import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { getAgencyId } from '@/lib/auth'
import { validateWhatsappNumber, errorJson } from '@/lib/validations'
import type { Client } from '@/types/database'

type SafeClient = Omit<Client, 'meta_access_token'>

function stripToken({ meta_access_token: _, ...safe }: Client): SafeClient {
  return safe
}

export async function GET(): Promise<NextResponse> {
  const agencyId = await getAgencyId()
  if (!agencyId) return errorJson('UNAUTHENTICATED', 'Authentication required', 401)

  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('agency_id', agencyId)
    .order('created_at', { ascending: false })

  if (error) return errorJson('INTERNAL_ERROR', 'Failed to fetch clients', 500)

  return NextResponse.json((data ?? []).map(stripToken) as SafeClient[])
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const agencyId = await getAgencyId()
  if (!agencyId) return errorJson('UNAUTHENTICATED', 'Authentication required', 401)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return errorJson('INVALID_BODY', 'Request body must be valid JSON', 400)
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return errorJson('INVALID_BODY', 'Request body must be an object', 400)
  }

  const {
    name,
    whatsapp_number,
    meta_pixel_id,
    meta_access_token,
  } = body as Record<string, unknown>

  if (!name || typeof name !== 'string' || !name.trim()) {
    return errorJson('INVALID_NAME', 'name is required', 400)
  }
  if (!validateWhatsappNumber(whatsapp_number)) {
    return errorJson(
      'INVALID_PHONE',
      'whatsapp_number must contain only digits and be 12 or 13 characters (DDI + DDD + number)',
      400,
    )
  }

  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from('clients')
    .insert({
      agency_id: agencyId,
      name: (name as string).trim(),
      whatsapp_number: whatsapp_number as string,
      meta_pixel_id: typeof meta_pixel_id === 'string' ? meta_pixel_id : null,
      meta_access_token: typeof meta_access_token === 'string' ? meta_access_token : null,
    })
    .select('*')
    .single()

  if (error) return errorJson('INTERNAL_ERROR', 'Failed to create client', 500)

  return NextResponse.json(stripToken(data), { status: 201 })
}
