import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { getAgencyId } from '@/lib/auth'
import { errorJson } from '@/lib/validations'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; linkId: string } },
): Promise<NextResponse> {
  const { id: clientId, linkId } = params

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

  const { is_active } = body as Record<string, unknown>
  if (typeof is_active !== 'boolean') {
    return errorJson('INVALID_IS_ACTIVE', 'is_active must be a boolean', 400)
  }

  const { data, error } = await supabase
    .from('tracking_links')
    .update({ is_active })
    .eq('id', linkId)
    .eq('client_id', clientId) // cross-tenant isolation at link level
    .select('*')
    .maybeSingle()

  if (error) return errorJson('INTERNAL_ERROR', 'Failed to update link', 500)
  if (!data) return errorJson('LINK_NOT_FOUND', 'Link not found', 404)

  return NextResponse.json(data)
}
