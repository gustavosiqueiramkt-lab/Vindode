import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { getAgencyId } from '@/lib/auth'
import { errorJson } from '@/lib/validations'
import type { Client } from '@/types/database'

type SafeClient = Omit<Client, 'meta_access_token'>

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const agencyId = await getAgencyId()
  if (!agencyId) return errorJson('UNAUTHENTICATED', 'Authentication required', 401)

  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', params.id)
    .eq('agency_id', agencyId)
    .maybeSingle()

  if (error) return errorJson('INTERNAL_ERROR', 'Failed to fetch client', 500)
  if (!data) return errorJson('CLIENT_NOT_FOUND', 'Client not found', 404)

  const { meta_access_token: _, ...safe } = data
  return NextResponse.json(safe as SafeClient)
}
