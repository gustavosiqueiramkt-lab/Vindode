import { redirect } from 'next/navigation'
import { createSessionClient } from '@/lib/supabase/session'
import { Sidebar } from '@/components/dashboard/Sidebar'
import type { SafeClient } from '@/lib/auth'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createSessionClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: clients } = await supabase
    .from('clients')
    .select('id, agency_id, name, whatsapp_number, plan, meta_pixel_id, client_token, is_active, created_at')
    .eq('agency_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar clients={(clients ?? []) as SafeClient[]} />
      <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
    </div>
  )
}
