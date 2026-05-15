'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { SafeClient } from '@/lib/auth'

interface SidebarProps {
  clients: SafeClient[]
}

export function Sidebar({ clients }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shrink-0">
      <div className="p-6 border-b border-gray-100">
        <span className="text-xl font-bold text-blue-600 tracking-tight">Vindode</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">
          Clientes
        </p>

        {clients.length === 0 && (
          <p className="text-sm text-gray-400 px-2 py-1">Nenhum cliente ainda</p>
        )}

        {clients.map((client) => {
          const href = `/dashboard/${client.id}`
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={client.id}
              href={href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                {client.name.charAt(0).toUpperCase()}
              </span>
              <span className="truncate">{client.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 space-y-1">
        <Link
          href="/dashboard/new-client"
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <span className="text-lg leading-none">+</span>
          Adicionar cliente
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors text-left"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sair
        </button>
      </div>
    </aside>
  )
}
