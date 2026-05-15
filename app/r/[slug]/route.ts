import { NextResponse } from 'next/server'
import { waitUntil } from '@vercel/functions'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { sendMetaCAPIEvent } from '@/lib/capi'

export const runtime = 'edge'

// Truncates the last IPv4 octet or IPv6 group for LGPD compliance.
// We store the truncated version only — the full IP never reaches the DB.
function truncateIp(raw: string): string | null {
  const ip = raw.trim()
  if (!ip) return null

  if (ip.includes(':')) {
    // IPv6: blank the last 16-bit group
    const parts = ip.split(':')
    parts[parts.length - 1] = 'xxxx'
    return parts.join(':')
  }

  const parts = ip.split('.')
  if (parts.length !== 4) return null
  return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`
}

// Supabase embeds the FK-related row under the table name.
// This type narrows the shape returned by the join below.
interface EmbeddedClient {
  whatsapp_number: string
  meta_pixel_id: string | null
  meta_access_token: string | null
}

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params
  const url = new URL(request.url)

  // Step 2: Service-role client — only role allowed to INSERT into click_events
  const supabase = createServiceRoleClient()

  // Step 3: Single roundtrip — slug lookup + client credentials via FK join
  const { data: link, error } = await supabase
    .from('tracking_links')
    .select(`
      *,
      clients (
        whatsapp_number,
        meta_pixel_id,
        meta_access_token
      )
    `)
    .eq('slug', slug)
    .single()

  // Step 4a: Slug not found in DB
  if (error || !link) {
    return NextResponse.redirect(new URL('/404', request.url), { status: 302 })
  }

  // Step 4b: Link exists but the agency deactivated it
  if (!link.is_active) {
    return NextResponse.redirect(new URL('/link-inativo', request.url), { status: 302 })
  }

  // Supabase returns the FK-related row as a single object (many-to-one relationship).
  // The Array.isArray guard handles an unlikely type inference edge case at runtime.
  const clientData = (
    Array.isArray(link.clients) ? link.clients[0] : link.clients
  ) as EmbeddedClient | null | undefined

  if (!clientData) {
    return NextResponse.redirect(new URL('/404', request.url), { status: 302 })
  }

  // Step 5: Extract request metadata — x-forwarded-for may be comma-separated in Vercel
  const rawIp = request.headers.get('x-forwarded-for') ?? ''
  const ip = truncateIp(rawIp.split(',')[0])
  const userAgent = request.headers.get('user-agent') ?? null
  const referrer = request.headers.get('referer') ?? null
  const fbclid = url.searchParams.get('fbclid')
  const gclid = url.searchParams.get('gclid')

  // Step 6: Session ID is generated per-click; no cookie required
  const sessionId = crypto.randomUUID()

  // Step 7: WhatsApp deep link with pre-filled message text
  const waLink = `https://wa.me/${clientData.whatsapp_number}?text=${encodeURIComponent(link.destination_text)}`

  // Materialize as a real Promise so it can be safely chained by the CAPI block.
  // Promise.resolve() converts the Supabase PromiseLike builder into a full Promise.
  const insertPromise: Promise<void> = Promise.resolve(
    supabase
      .from('click_events')
      .insert({
        tracking_link_id: link.id,
        client_id: link.client_id,
        session_id: sessionId,
        ip_address: ip,
        user_agent: userAgent,
        referrer,
        fbclid,
        gclid,
        capi_sent: false,
      })
      .then(() => undefined),
  )

  // Step 8: Register INSERT with the Vercel edge runtime.
  // waitUntil keeps the worker alive after the response is sent so the write completes.
  waitUntil(insertPromise)

  // Step 9: CAPI — chained after INSERT so the capi_sent update has a row to target.
  // The catch inside swallows all errors; a CAPI failure must never prevent the redirect.
  if (clientData.meta_pixel_id && clientData.meta_access_token) {
    // fbc format required by Meta: fb.<version>.<creation_time>.<fbclid>
    const fbc = fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined

    waitUntil(
      insertPromise.then(async () => {
        try {
          await sendMetaCAPIEvent({
            pixelId: clientData.meta_pixel_id!,
            accessToken: clientData.meta_access_token!,
            eventSourceUrl: `${url.origin}/r/${slug}`,
            clientIpAddress: ip ?? '',
            clientUserAgent: userAgent ?? '',
            fbc,
            campaignName: link.utm_campaign,
            utmSource: link.utm_source,
            utmContent: link.utm_content ?? undefined,
          })

          // Best-effort update — if this fails the click_event already exists
          await supabase
            .from('click_events')
            .update({
              capi_sent: true,
              capi_sent_at: new Date().toISOString(),
            })
            .eq('session_id', sessionId)
        } catch {
          // Swallow: CAPI errors must never surface to the user or block the redirect
        }
      })
    )
  }

  // Step 10: Redirect — happens before INSERT or CAPI settle (both are fire-and-forget)
  return NextResponse.redirect(waLink, { status: 301 })
}
