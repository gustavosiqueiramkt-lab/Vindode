'use client'

import { SkeletonCard } from '@/components/ui/SkeletonDashboard'
import type { MetricsResponse } from '@/hooks/useMetrics'

interface KPICardsProps {
  data: MetricsResponse | null
  isLoading: boolean
}

export function KPICards({ data, isLoading }: KPICardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (!data) return null

  const topSource = data.clicks_by_source[0]
  const topCampaign = data.clicks_by_campaign[0]
  const comparison = data.period_comparison

  const sourceLabel = topSource
    ? `${topSource.source.charAt(0).toUpperCase() + topSource.source.slice(1)} — ${Math.round((topSource.count / data.total_clicks) * 100)}%`
    : 'N/A'

  const changeColor = comparison.change_pct > 0 ? 'text-green-600' : comparison.change_pct < 0 ? 'text-red-600' : 'text-gray-600'
  const changePrefix = comparison.change_pct > 0 ? '+' : ''

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="rounded-lg border border-gray-200 p-6 bg-white">
        <p className="text-sm font-medium text-gray-600 mb-2">Total de cliques</p>
        <p className="text-3xl font-bold text-gray-900">
          {data.total_clicks.toLocaleString('pt-BR')}
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 p-6 bg-white">
        <p className="text-sm font-medium text-gray-600 mb-2">Canal principal</p>
        <p className="text-xl font-bold text-gray-900">{sourceLabel}</p>
      </div>

      <div className="rounded-lg border border-gray-200 p-6 bg-white">
        <p className="text-sm font-medium text-gray-600 mb-2">Campanha principal</p>
        <p className="text-lg font-bold text-gray-900 truncate">{topCampaign?.campaign || 'N/A'}</p>
        {topCampaign && (
          <p className="text-xs text-gray-500 mt-2">
            {topCampaign.count.toLocaleString('pt-BR')} cliques
          </p>
        )}
      </div>

      <div className="rounded-lg border border-gray-200 p-6 bg-white">
        <p className="text-sm font-medium text-gray-600 mb-2">Variação</p>
        <p className={`text-3xl font-bold ${changeColor}`}>
          {changePrefix}{comparison.change_pct}%
        </p>
        <p className="text-xs text-gray-500 mt-2">
          vs período anterior
        </p>
      </div>
    </div>
  )
}
