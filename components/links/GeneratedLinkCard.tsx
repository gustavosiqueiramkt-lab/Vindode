'use client'

import { useState } from 'react'
import type { TrackingLink } from '@/types/database'

interface GeneratedLinkCardProps {
  link: TrackingLink
  onCreateAnother: () => void
}

export function GeneratedLinkCard({
  link,
  onCreateAnother,
}: GeneratedLinkCardProps) {
  const [copied, setCopied] = useState(false)

  const fullUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.com'}/r/${link.slug}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-green-200 bg-green-50 p-6">
        <h3 className="mb-2 text-sm font-medium text-gray-700">
          Link gerado com sucesso!
        </h3>

        <div className="mb-4 flex items-center gap-2">
          <code className="flex-1 rounded bg-white px-3 py-2 font-mono text-sm text-gray-900">
            {fullUrl}
          </code>
          <button
            onClick={handleCopy}
            className="inline-flex h-10 items-center gap-2 rounded bg-green-600 px-4 py-2 font-medium text-white transition-colors hover:bg-green-700"
          >
            {copied ? (
              <>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Copiado!
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Copiar link
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-gray-600">
          Cole este link diretamente no campo de URL do seu anúncio no Meta ou Google Ads
        </p>
      </div>

      <div className="rounded-lg bg-blue-50 p-4">
        <h4 className="mb-2 font-medium text-gray-900">Informações do link:</h4>
        <dl className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-600">Canal:</dt>
            <dd className="font-medium text-gray-900 capitalize">{link.utm_source}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Campanha:</dt>
            <dd className="font-medium text-gray-900">{link.utm_campaign}</dd>
          </div>
          {link.utm_content && (
            <div className="flex justify-between">
              <dt className="text-gray-600">Criativo:</dt>
              <dd className="font-medium text-gray-900">{link.utm_content}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-gray-600">Texto WhatsApp:</dt>
            <dd className="font-medium text-gray-900 truncate">
              {link.destination_text}
            </dd>
          </div>
        </dl>
      </div>

      <button
        onClick={onCreateAnother}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-900 transition-colors hover:bg-gray-50"
      >
        Criar outro link
      </button>
    </div>
  )
}
