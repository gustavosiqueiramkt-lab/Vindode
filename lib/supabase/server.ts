import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Service-role client bypasses all RLS. Never expose this key to the client.
// Only used in server/edge contexts where the caller is trusted (e.g. redirect route).
export function createServiceRoleClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
}
