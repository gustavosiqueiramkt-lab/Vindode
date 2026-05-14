import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { getAgencyId, verifyClientToken } from '@/lib/auth'
import { errorJson } from '@/lib/validations'

const PERIOD_DAYS: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 }

type ClickRow = {
  clicked_at: string
  tracking_links: {
    slug: string
    utm_source: string
    utm_campaign: string
    utm_content: string | null
  }
}

function buildMetrics(current: ClickRow[], previous: ClickRow[]) {
  // clicks_by_day
  const byDay: Record<string, number> = {}
  for (const row of current) {
    const date = row.clicked_at.slice(0, 10)
    byDay[date] = (byDay[date] ?? 0) + 1
  }
  const clicks_by_day = Object.entries(byDay)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // clicks_by_source
  const bySource: Record<string, number> = {}
  for (const row of current) {
    const source = row.tracking_links.utm_source
    bySource[source] = (bySource[source] ?? 0) + 1
  }
  const clicks_by_source = Object.entries(bySource)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)

  // clicks_by_campaign
  const byCampaign: Record<string, number> = {}
  for (const row of current) {
    const campaign = row.tracking_links.utm_campaign
    byCampaign[campaign] = (byCampaign[campaign] ?? 0) + 1
  }
  const clicks_by_campaign = Object.entries(byCampaign)
    .map(([campaign, count]) => ({ campaign, count }))
    .sort((a, b) => b.count - a.count)

  // top_links (deduplicated by slug + campaign + content, top 10)
  const byLink: Record<
    string,
    { slug: string; utm_campaign: string; utm_content: string; count: number }
  > = {}
  for (const row of current) {
    const tl = row.tracking_links
    const key = `${tl.slug}|${tl.utm_campaign}|${tl.utm_content ?? ''}`
    if (!byLink[key]) {
      byLink[key] = {
        slug: tl.slug,
        utm_campaign: tl.utm_campaign,
        utm_content: tl.utm_content ?? '',
        count: 0,
      }
    }
    byLink[key].count++
  }
  const top_links = Object.values(byLink)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // period_comparison
  const currentCount = current.length
  const previousCount = previous.length
  const change_pct =
    previousCount === 0
      ? currentCount > 0
        ? 100
        : 0
      : Math.round(((currentCount - previousCount) / previousCount) * 100)

  return {
    total_clicks: currentCount,
    clicks_by_source,
    clicks_by_day,
    clicks_by_campaign,
    top_links,
    period_comparison: {
      current: currentCount,
      previous: previousCount,
      change_pct,
    },
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const clientId = params.id
  const { searchParams } = new URL(request.url)
  const periodKey = searchParams.get('period') ?? '30d'
  const periodDays = PERIOD_DAYS[periodKey]

  if (!periodDays) {
    return errorJson('INVALID_PERIOD', 'period must be one of: 7d, 30d, 90d', 400)
  }

  const supabase = createServiceRoleClient()

  // Auth: agency session OR client_token
  const agencyId = await getAgencyId()
  if (agencyId) {
    const { data: clientCheck } = await supabase
      .from('clients')
      .select('id')
      .eq('id', clientId)
      .eq('agency_id', agencyId)
      .maybeSingle()
    if (!clientCheck) return errorJson('CLIENT_NOT_FOUND', 'Client not found', 404)
  } else {
    const token = request.headers.get('X-Client-Token')
    if (!token) return errorJson('UNAUTHENTICATED', 'Authentication required', 401)
    const clientCheck = await verifyClientToken(clientId, token)
    if (!clientCheck) return errorJson('UNAUTHORIZED', 'Invalid client token', 401)
  }

  const now = new Date()
  const periodMs = periodDays * 24 * 60 * 60 * 1000
  const currentStart = new Date(now.getTime() - periodMs)
  const previousStart = new Date(currentStart.getTime() - periodMs)

  // Single JOIN query covering both current and previous periods to avoid N+1.
  const { data: allRows, error } = await supabase
    .from('click_events')
    .select('clicked_at, tracking_links!inner(slug, utm_source, utm_campaign, utm_content)')
    .eq('client_id', clientId)
    .gte('clicked_at', previousStart.toISOString())
    .lte('clicked_at', now.toISOString())

  if (error) return errorJson('INTERNAL_ERROR', 'Failed to fetch metrics', 500)

  const rows = (allRows ?? []) as ClickRow[]
  const currentRows = rows.filter((r) => new Date(r.clicked_at) >= currentStart)
  const previousRows = rows.filter((r) => new Date(r.clicked_at) < currentStart)

  return NextResponse.json(buildMetrics(currentRows, previousRows))
}
