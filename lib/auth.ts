import { createSessionClient } from '@/lib/supabase/session'
import { createServiceRoleClient } from '@/lib/supabase/server'
import type { Client } from '@/types/database'

export type SafeClient = Omit<Client, 'meta_access_token'>

// Returns the agency_id (= auth.uid()) for a valid Supabase Auth session, or null.
export async function getAgencyId(): Promise<string | null> {
  const supabase = createSessionClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user.id
}

// Verifies a client_token header against the DB. Returns the client row (without
// meta_access_token) if valid for the given clientId, or null.
export async function verifyClientToken(
  clientId: string,
  token: string,
): Promise<SafeClient | null> {
  const supabase = createServiceRoleClient()
  const { data } = await supabase
    .from('clients')
    .select(
      'id, agency_id, name, whatsapp_number, plan, meta_pixel_id, client_token, is_active, created_at',
    )
    .eq('id', clientId)
    .eq('client_token', token)
    .maybeSingle()
  return data as SafeClient | null
}
