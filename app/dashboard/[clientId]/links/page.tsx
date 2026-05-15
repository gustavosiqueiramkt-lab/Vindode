'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import type { TrackingLink } from '@/types/database'

interface Props {
  params: { clientId: string }
}

const SOURCE_LABELS: Record<string, string> = {
  meta: 'Meta',
  google: 'Google',
  bio: 'Bio',
  organico: 'Orgânico',
  outro: 'Outro',
}

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  if (typeof window !== 'undefined') return window.location.origin
  return ''
}

export default function LinksPage({ params }: Props) {
  const [links, setLinks] = useState<TrackingLink[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const fetchLinks = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/clients/${params.clientId}/links`)
    if (!res.ok) {
      setError('Erro ao carregar links')
      setLoading(false)
      return
    }
    setLinks(await res.json())
    setLoading(false)
  }, [params.clientId])

  useEffect(() => { fetchLinks() }, [fetchLinks])

  async function toggleActive(linkId: string, current: boolean) {
    setToggling(linkId)
    const res = await fetch(`/api/clients/${params.clientId}/links/${linkId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !current }),
    })
    if (res.ok) {
      setLinks((prev) =>
        prev.map((l) => (l.id === linkId ? { ...l, is_active: !current } : l)),
      )
    }
    setToggling(null)
  }

  async function copyLink(slug: string) {
    await navigator.clipboard.writeText(`${getBaseUrl()}/r/${slug}`)
    setCopied(slug)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href={`/dashboard/${params.clientId}`}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              ← Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Links de rastreamento</h1>
          </div>
          <Link
            href={`/dashboard/${params.clientId}/links/new`}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Criar link
          </Link>
        </div>

        {loading && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
            Carregando links...
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && links.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-sm mb-4">Nenhum link criado ainda</p>
            <Link
              href={`/dashboard/${params.clientId}/links/new`}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Criar primeiro link
            </Link>
          </div>
        )}

        {!loading && links.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Campanha
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Canal
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Link
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Ativo
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Criado em
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {links.map((link) => (
                  <tr key={link.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{link.utm_campaign}</div>
                      {link.utm_content && (
                        <div className="text-xs text-gray-400 mt-0.5">{link.utm_content}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                        {SOURCE_LABELS[link.utm_source] ?? link.utm_source}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-gray-500 truncate max-w-[200px] block">
                          {getBaseUrl()}/r/{link.slug}
                        </code>
                        <button
                          onClick={() => copyLink(link.slug)}
                          className="text-blue-600 hover:text-blue-700 text-xs font-medium shrink-0"
                        >
                          {copied === link.slug ? 'Copiado!' : 'Copiar'}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(link.id, link.is_active)}
                        disabled={toggling === link.id}
                        aria-label={link.is_active ? 'Desativar link' : 'Ativar link'}
                        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
                          link.is_active ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            link.is_active ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(link.created_at).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
