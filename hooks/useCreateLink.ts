'use client'

import { useState } from 'react'
import type { TrackingLink } from '@/types/database'

interface CreateLinkPayload {
  utm_source: string
  utm_campaign: string
  utm_content?: string
  destination_text: string
}

interface UseCreateLinkState {
  link: TrackingLink | null
  isLoading: boolean
  error: string | null
}

export function useCreateLink(clientId: string) {
  const [state, setState] = useState<UseCreateLinkState>({
    link: null,
    isLoading: false,
    error: null,
  })

  const createLink = async (payload: CreateLinkPayload): Promise<boolean> => {
    setState({ link: null, isLoading: true, error: null })

    try {
      const response = await fetch(
        `/api/clients/${clientId}/links`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )

      const data = await response.json() as unknown

      // Error response has { error: { code, message } }
      if (!response.ok || (data && typeof data === 'object' && 'error' in data)) {
        const errorObj = (data as Record<string, unknown>)?.error as Record<string, unknown> | undefined
        const errorMessage = (errorObj?.message as string) || 'Erro ao criar link'
        setState({ link: null, isLoading: false, error: errorMessage })
        return false
      }

      // Success response is the TrackingLink directly
      if (data && typeof data === 'object' && 'id' in data) {
        setState({ link: data as TrackingLink, isLoading: false, error: null })
        return true
      }

      setState({
        link: null,
        isLoading: false,
        error: 'Resposta inválida da API',
      })
      return false
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro de conexão'
      setState({ link: null, isLoading: false, error: errorMessage })
      return false
    }
  }

  const reset = () => {
    setState({ link: null, isLoading: false, error: null })
  }

  return { ...state, createLink, reset }
}
