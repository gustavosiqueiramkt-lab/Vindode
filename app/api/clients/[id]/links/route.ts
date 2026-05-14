import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { getAgencyId, verifyClientToken } from '@/lib/auth'
import { generateSlug, validateUtmSource, errorJson } from '@/lib/validations'

async function resolveAccess(
  request: NextRequest,
  clientId: string,
): Promise<{ agencyAuthed: boolean } | NextResponse> {
  const supabase = createServiceRoleClient()
  const agencyId = await getAgencyId()

  if (agencyId) {
    const { data } = await supabase
      .from('clients')
      .select('id')
      .eq('id', clientId)
      .eq('agency_id', agencyId)
      .maybeSingle()
    if (!data) return errorJson('CLIENT_NOT_FOUND', 'Client not found', 404)
    return { agencyAuthed: true }
  }

  const token = request.headers.get('X-Client-Token')
  if (!token) return errorJson('UNAUTHENTICATED', 'Authentication required', 401)
  const client = await verifyClientToken(clientId, token)
  if (!client) return errorJson('UNAUTHORIZED', 'Invalid client token', 401)
  return { agencyAuthed: false }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const access = await resolveAccess(request, params.id)
  if (access instanceof NextResponse) return access

  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from('tracking_links')
    .select('*')
    .eq('client_id', params.id)
    .order('created_at', { ascending: false })

  if (error) return errorJson('INTERNAL_ERROR', 'Failed to fetch links', 500)

  return NextResponse.json(data ?? [])
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const clientId = params.id
  const agencyId = await getAgencyId()
  if (!agencyId) return errorJson('UNAUTHENTICATED', 'Authentication required', 401)

  const supabase = createServiceRoleClient()

  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('id', clientId)
    .eq('agency_id', agencyId)
    .maybeSingle()
  if (!client) return errorJson('CLIENT_NOT_FOUND', 'Client not found', 404)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return errorJson('INVALID_BODY', 'Request body must be valid JSON', 400)
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return errorJson('INVALID_BODY', 'Request body must be an object', 400)
  }

  const { utm_source, utm_campaign, utm_medium, utm_content, destination_text } =
    body as Record<string, unknown>

  if (!validateUtmSource(utm_source)) {
    return errorJson(
      'INVALID_UTM_SOURCE',
      'utm_source must be one of: meta, google, bio, organico, outro',
      400,
    )
  }
  if (!utm_campaign || typeof utm_campaign !== 'string' || !utm_campaign.trim()) {
    return errorJson('INVALID_UTM_CAMPAIGN', 'utm_campaign is required', 400)
  }
  if (!destination_text || typeof destination_text !== 'string' || !destination_text.trim()) {
    return errorJson('INVALID_DESTINATION', 'destination_text is required', 400)
  }

  // Generate a unique 8-char slug — up to 3 attempts before giving up.
  let slug: string | null = null
  for (let attempt = 0; attempt < 3; attempt++) {
    const candidate = generateSlug()
    const { data: existing } = await supabase
      .from('tracking_links')
      .select('id')
      .eq('slug', candidate)
      .maybeSingle()
    if (!existing) {
      slug = candidate
      break
    }
  }

  if (!slug) {
    return errorJson('SLUG_GENERATION_FAILED', 'Failed to generate a unique slug, please try again', 500)
  }

  const { data, error } = await supabase
    .from('tracking_links')
    .insert({
      client_id: clientId,
      slug,
      utm_source,
      utm_campaign: (utm_campaign as string).trim(),
      utm_medium: typeof utm_medium === 'string' ? utm_medium.trim() : '',
      utm_content: typeof utm_content === 'string' ? utm_content.trim() || null : null,
      destination_text: (destination_text as string).trim(),
    })
    .select('*')
    .single()

  if (error) return errorJson('INTERNAL_ERROR', 'Failed to create link', 500)

  return NextResponse.json(data, { status: 201 })
}
