'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { SkeletonChart } from '@/components/ui/SkeletonDashboard'
import type { MetricsResponse } from '@/hooks/useMetrics'

interface ClicksBySourceChartProps {
  data: MetricsResponse | null
  isLoading: boolean
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.[0]) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-3 border border-gray-200">
        <p className="text-sm font-medium text-gray-900 capitalize">
          {payload[0].payload.source}
        </p>
        <p className="text-sm font-bold text-blue-600">
          {payload[0].value.toLocaleString('pt-BR')} cliques
        </p>
      </div>
    )
  }
  return null
}

export function ClicksBySourceChart({ data, isLoading }: ClicksBySourceChartProps) {
  if (isLoading) {
    return <SkeletonChart />
  }

  if (!data || data.clicks_by_source.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 p-6 bg-white">
        <p className="text-sm font-medium text-gray-600 mb-6">Cliques por canal</p>
        <p className="text-center text-gray-500">Nenhum dado disponível</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 p-6 bg-white">
      <p className="text-sm font-medium text-gray-600 mb-6">Cliques por canal</p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data.clicks_by_source}
          margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="source"
            tick={{ fontSize: 12 }}
            stroke="#9ca3af"
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#9ca3af"
            tickFormatter={(value) => value.toLocaleString('pt-BR')}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]}>
            {data.clicks_by_source.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
