'use client'

import { useState, useEffect } from 'react'

export interface MetricsResponse {
  total_clicks: number
  clicks_by_source: Array<{ source: string; count: number }>
  clicks_by_day: Array<{ date: string; count: number }>
  clicks_by_campaign: Array<{ campaign: string; count: number }>
  top_links: Array<{
    slug: string
    utm_campaign: string
    utm_content: string
    count: number
  }>
  period_comparison: {
    current: number
    previous: number
    change_pct: number
  }
}

interface UseMetricsState {
  data: MetricsResponse | null
  isLoading: boolean
  error: string | null
}

type Period = '7d' | '30d' | '90d'

export function useMetrics(clientId: string, period: Period = '30d', clientToken?: string) {
  const [state, setState] = useState<UseMetricsState>({
    data: null,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    if (!clientId) return

    const fetchMetrics = async () => {
      setState({ data: null, isLoading: true, error: null })

      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        }

        if (clientToken) {
          headers['X-Client-Token'] = clientToken
        }

        const response = await fetch(
          `/api/clients/${clientId}/metrics?period=${period}`,
          { headers }
        )

        const data = (await response.json()) as unknown

        if (!response.ok || (data && typeof data === 'object' && 'error' in data)) {
          const errorObj = (data as Record<string, unknown>)?.error as
            | Record<string, unknown>
            | undefined
          const errorMessage = (errorObj?.message as string) || 'Erro ao carregar métricas'
          setState({ data: null, isLoading: false, error: errorMessage })
          return
        }

        if (data && typeof data === 'object' && 'total_clicks' in data) {
          setState({ data: data as MetricsResponse, isLoading: false, error: null })
        } else {
          setState({
            data: null,
            isLoading: false,
            error: 'Resposta inválida da API',
          })
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro de conexão'
        setState({ data: null, isLoading: false, error: errorMessage })
      }
    }

    fetchMetrics()

    // Revalidate every 5 minutes
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [clientId, period, clientToken])

  return state
}
