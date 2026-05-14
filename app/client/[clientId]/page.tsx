'use client'

import { useState, useEffect } from 'react'
import { KPICards } from '@/components/dashboard/KPICards'
import { ClicksByDayChart } from '@/components/dashboard/ClicksByDayChart'
import { ClicksBySourceChart } from '@/components/dashboard/ClicksBySourceChart'
import { TopLinksTable } from '@/components/dashboard/TopLinksTable'
import { CampaignTable } from '@/components/dashboard/CampaignTable'
import { useMetrics } from '@/hooks/useMetrics'

interface ClientDashboardPageProps {
  params: { clientId: string }
  searchParams: { token?: string }
}

export default function ClientDashboardPage({ params, searchParams }: ClientDashboardPageProps) {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d')
  const [clientToken, setClientToken] = useState<string | undefined>()

  useEffect(() => {
    if (searchParams.token) {
      setClientToken(searchParams.token)
      localStorage.setItem(`client-token-${params.clientId}`, searchParams.token)
    } else {
      const stored = localStorage.getItem(`client-token-${params.clientId}`)
      if (stored) {
        setClientToken(stored)
      }
    }
  }, [searchParams.token, params.clientId])

  const { data, isLoading, error } = useMetrics(params.clientId, period, clientToken)

  if (!clientToken && !isLoading && !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg border border-gray-200 p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso necessário</h1>
          <p className="text-gray-600 mb-6">
            Você precisa de um token válido para acessar o dashboard
          </p>
          <p className="text-sm text-gray-500">
            Solicite acesso ao seu gerente de projetos
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Métricas de desempenho</h1>
            <p className="text-gray-600 mt-2">Acompanhe o desempenho dos seus links</p>
          </div>

          <div className="flex gap-2">
            {(['7d', '30d', '90d'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  period === p
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {p === '7d' ? '7 dias' : p === '30d' ? '30 dias' : '90 dias'}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <KPICards data={data} isLoading={isLoading} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ClicksByDayChart data={data} isLoading={isLoading} />
            <ClicksBySourceChart data={data} isLoading={isLoading} />
          </div>

          <TopLinksTable data={data} isLoading={isLoading} />

          <CampaignTable data={data} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}
