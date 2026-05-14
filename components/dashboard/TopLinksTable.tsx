'use client'

import { SkeletonTable } from '@/components/ui/SkeletonDashboard'
import type { MetricsResponse } from '@/hooks/useMetrics'

interface TopLinksTableProps {
  data: MetricsResponse | null
  isLoading: boolean
}

export function TopLinksTable({ data, isLoading }: TopLinksTableProps) {
  if (isLoading) {
    return <SkeletonTable />
  }

  if (!data || data.top_links.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 p-6 bg-white">
        <p className="text-sm font-medium text-gray-600 mb-6">Top links</p>
        <p className="text-center text-gray-500">Nenhum link com cliques ainda</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 p-6 bg-white">
      <p className="text-sm font-medium text-gray-600 mb-6">Top links</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Slug</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Campanha</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Criativo</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Cliques</th>
            </tr>
          </thead>
          <tbody>
            {data.top_links.map((link, idx) => (
              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-900 font-mono text-xs">
                  {link.slug}
                </td>
                <td className="py-3 px-4 text-gray-700">{link.utm_campaign}</td>
                <td className="py-3 px-4 text-gray-700">
                  {link.utm_content || '—'}
                </td>
                <td className="py-3 px-4 text-right font-semibold text-gray-900">
                  {link.count.toLocaleString('pt-BR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
