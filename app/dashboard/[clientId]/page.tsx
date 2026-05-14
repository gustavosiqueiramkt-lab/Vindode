'use client'

import { useState } from 'react'
import { KPICards } from '@/components/dashboard/KPICards'
import { ClicksByDayChart } from '@/components/dashboard/ClicksByDayChart'
import { ClicksBySourceChart } from '@/components/dashboard/ClicksBySourceChart'
import { TopLinksTable } from '@/components/dashboard/TopLinksTable'
import { CampaignTable } from '@/components/dashboard/CampaignTable'
import { useMetrics } from '@/hooks/useMetrics'

interface DashboardPageProps {
  params: { clientId: string }
}

export default function DashboardPage({ params }: DashboardPageProps) {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d')
  const { data, isLoading, error } = useMetrics(params.clientId, period)

  const handleExportCSV = async () => {
    if (!data) return

    const headers = ['Data', 'Total Cliques', 'Canal Principal', 'Campanha Principal']
    const rows = [
      [
        new Date().toLocaleDateString('pt-BR'),
        data.total_clicks.toString(),
        data.clicks_by_source[0]?.source || 'N/A',
        data.clicks_by_campaign[0]?.campaign || 'N/A',
      ],
    ]

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `relatorio-metricas-${params.clientId}-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard de métricas</h1>
            <p className="text-gray-600 mt-2">Acompanhe o desempenho dos seus links</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
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

            <button
              onClick={handleExportCSV}
              disabled={!data}
              className="px-4 py-2 rounded-lg font-medium bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Exportar CSV
            </button>
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
