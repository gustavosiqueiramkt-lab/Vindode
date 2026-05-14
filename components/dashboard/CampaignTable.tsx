'use client'

import { SkeletonTable } from '@/components/ui/SkeletonDashboard'
import type { MetricsResponse } from '@/hooks/useMetrics'

interface CampaignTableProps {
  data: MetricsResponse | null
  isLoading: boolean
}

export function CampaignTable({ data, isLoading }: CampaignTableProps) {
  if (isLoading) {
    return <SkeletonTable />
  }

  if (!data || data.clicks_by_campaign.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 p-6 bg-white">
        <p className="text-sm font-medium text-gray-600 mb-6">Cliques por campanha</p>
        <p className="text-center text-gray-500">Nenhuma campanha com cliques ainda</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 p-6 bg-white">
      <p className="text-sm font-medium text-gray-600 mb-6">Cliques por campanha</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Campanha</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Cliques</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">% do total</th>
            </tr>
          </thead>
          <tbody>
            {data.clicks_by_campaign.map((campaign, idx) => {
              const percentage =
                data.total_clicks > 0
                  ? ((campaign.count / data.total_clicks) * 100).toFixed(1)
                  : '0'
              return (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900 font-medium">
                    {campaign.campaign}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-700">
                    {campaign.count.toLocaleString('pt-BR')}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-gray-700 font-semibold w-10 text-right">
                        {percentage}%
                      </span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
