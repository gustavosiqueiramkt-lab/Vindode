'use client'

import { useState } from 'react'
import { useCreateLink } from '@/hooks/useCreateLink'
import { GeneratedLinkCard } from './GeneratedLinkCard'

interface CreateLinkFormProps {
  clientId: string
  onError?: (message: string) => void
}

interface FormState {
  utm_source: string
  utm_campaign: string
  utm_content: string
  destination_text: string
}

interface FormErrors {
  utm_source?: string
  utm_campaign?: string
  utm_content?: string
  destination_text?: string
}

const UTM_SOURCES = [
  { value: 'meta', label: 'Meta Ads' },
  { value: 'google', label: 'Google Ads' },
  { value: 'bio', label: 'Link na Bio' },
  { value: 'organico', label: 'Orgânico' },
  { value: 'outro', label: 'Outro' },
] as const

export function CreateLinkForm({ clientId, onError }: CreateLinkFormProps) {
  const { link, isLoading, error, createLink, reset } = useCreateLink(clientId)
  const [form, setForm] = useState<FormState>({
    utm_source: '',
    utm_campaign: '',
    utm_content: '',
    destination_text: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // utm_source validation
    if (!form.utm_source) {
      newErrors.utm_source = 'Canal é obrigatório'
    }

    // utm_campaign validation
    if (!form.utm_campaign) {
      newErrors.utm_campaign = 'Nome da campanha é obrigatório'
    } else if (form.utm_campaign.length < 3) {
      newErrors.utm_campaign = 'Mínimo 3 caracteres'
    } else if (!/^[a-z0-9-]+$/.test(form.utm_campaign)) {
      newErrors.utm_campaign = 'Apenas letras minúsculas, números e hífens'
    }

    // destination_text validation
    if (!form.destination_text) {
      newErrors.destination_text = 'Texto é obrigatório'
    } else if (form.destination_text.length < 10) {
      newErrors.destination_text = 'Mínimo 10 caracteres'
    } else if (form.destination_text.length > 200) {
      newErrors.destination_text = 'Máximo 200 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (touched[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name as keyof FormErrors]
        return newErrors
      })
    }
  }

  const handleBlur = (
    e: React.FocusEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const payload = {
      utm_source: form.utm_source,
      utm_campaign: form.utm_campaign,
      utm_content: form.utm_content || undefined,
      destination_text: form.destination_text,
    }

    const success = await createLink(payload)

    if (!success && error && onError) {
      onError(error)
    }
  }

  if (link) {
    return (
      <GeneratedLinkCard
        link={link}
        onCreateAnother={() => {
          reset()
          setForm({
            utm_source: '',
            utm_campaign: '',
            utm_content: '',
            destination_text: '',
          })
          setErrors({})
          setTouched({})
        }}
      />
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Canal (utm_source) */}
      <div>
        <label htmlFor="utm_source" className="block text-sm font-medium text-gray-700">
          Canal <span className="text-red-500">*</span>
        </label>
        <select
          id="utm_source"
          name="utm_source"
          value={form.utm_source}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`mt-2 block w-full rounded-lg border px-4 py-2 text-gray-900 transition-colors ${
            touched['utm_source'] && errors.utm_source
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 bg-white'
          } focus:border-blue-500 focus:outline-none`}
        >
          <option value="">Selecione um canal</option>
          {UTM_SOURCES.map((source) => (
            <option key={source.value} value={source.value}>
              {source.label}
            </option>
          ))}
        </select>
        {touched['utm_source'] && errors.utm_source && (
          <p className="mt-1 text-sm text-red-600">{errors.utm_source}</p>
        )}
      </div>

      {/* Nome da campanha (utm_campaign) */}
      <div>
        <label htmlFor="utm_campaign" className="block text-sm font-medium text-gray-700">
          Nome da campanha <span className="text-red-500">*</span>
        </label>
        <input
          id="utm_campaign"
          type="text"
          name="utm_campaign"
          value={form.utm_campaign}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="ex: maio-apartamento-2026"
          className={`mt-2 block w-full rounded-lg border px-4 py-2 text-gray-900 transition-colors ${
            touched['utm_campaign'] && errors.utm_campaign
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 bg-white'
          } focus:border-blue-500 focus:outline-none`}
        />
        {touched['utm_campaign'] && errors.utm_campaign && (
          <p className="mt-1 text-sm text-red-600">{errors.utm_campaign}</p>
        )}
      </div>

      {/* Nome do criativo (utm_content) */}
      <div>
        <label htmlFor="utm_content" className="block text-sm font-medium text-gray-700">
          Nome do criativo (opcional)
        </label>
        <input
          id="utm_content"
          type="text"
          name="utm_content"
          value={form.utm_content}
          onChange={handleChange}
          placeholder="ex: video-depoimento-01"
          className="mt-2 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Texto para WhatsApp (destination_text) */}
      <div>
        <label htmlFor="destination_text" className="block text-sm font-medium text-gray-700">
          Texto no WhatsApp <span className="text-red-500">*</span>
        </label>
        <textarea
          id="destination_text"
          name="destination_text"
          value={form.destination_text}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="ex: Olá! Vi o anúncio do apartamento e quero mais informações."
          rows={4}
          className={`mt-2 block w-full rounded-lg border px-4 py-2 text-gray-900 transition-colors ${
            touched['destination_text'] && errors.destination_text
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 bg-white'
          } focus:border-blue-500 focus:outline-none`}
        />

        {/* Character counter */}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {form.destination_text.length}/200 caracteres
          </span>
          {form.destination_text && (
            <div className="text-xs text-gray-600">
              <span className="font-medium">Preview:</span>
              <br />
              <code className="text-gray-900">
                wa.me/{'{whatsapp}'}?text=
                {encodeURIComponent(form.destination_text).slice(0, 50)}
                {form.destination_text.length > 50 ? '...' : ''}
              </code>
            </div>
          )}
        </div>

        {touched['destination_text'] && errors.destination_text && (
          <p className="mt-1 text-sm text-red-600">{errors.destination_text}</p>
        )}
      </div>

      {/* Error message from API */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Gerando link...
          </span>
        ) : (
          'Gerar Link'
        )}
      </button>
    </form>
  )
}
