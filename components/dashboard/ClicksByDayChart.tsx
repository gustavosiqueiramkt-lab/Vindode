'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { SkeletonChart } from '@/components/ui/SkeletonDashboard'
import type { MetricsResponse } from '@/hooks/useMetrics'

interface ClicksByDayChartProps {
  data: MetricsResponse | null
  isLoading: boolean
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.[0]) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-3 border border-gray-200">
        <p className="text-sm font-medium text-gray-900">
          {payload[0].payload.date}
        </p>
        <p className="text-sm font-bold text-blue-600">
          {payload[0].value.toLocaleString('pt-BR')} cliques
        </p>
      </div>
    )
  }
  return null
}

export function ClicksByDayChart({ data, isLoading }: ClicksByDayChartProps) {
  if (isLoading) {
    return <SkeletonChart />
  }

  if (!data || data.clicks_by_day.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 p-6 bg-white">
        <p className="text-sm font-medium text-gray-600 mb-6">Cliques por dia</p>
        <p className="text-center text-gray-500">Nenhum dado disponível</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 p-6 bg-white">
      <p className="text-sm font-medium text-gray-600 mb-6">Cliques por dia</p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data.clicks_by_day}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            stroke="#9ca3af"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#9ca3af"
            tickFormatter={(value) => value.toLocaleString('pt-BR')}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#3b82f6"
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
            name="Cliques"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
