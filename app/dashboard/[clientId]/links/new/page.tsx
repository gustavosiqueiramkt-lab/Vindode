'use client'

import { useState } from 'react'
import { CreateLinkForm } from '@/components/links/CreateLinkForm'
import { Toast } from '@/components/Toast'
import Link from 'next/link'

interface PageProps {
  params: {
    clientId: string
  }
}

export default function CreateLinkPage({ params }: PageProps) {
  const [toast, setToast] = useState<{
    message: string
    type: 'error' | 'success' | 'info'
  } | null>(null)

  const handleError = (message: string) => {
    setToast({ message, type: 'error' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href={`/dashboard/${params.clientId}/links`}
              className="text-blue-600 hover:text-blue-700"
            >
              ← Voltar
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              Criar novo tracking link
            </h1>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-6 shadow">
          <CreateLinkForm
            clientId={params.clientId}
            onError={handleError}
          />
        </div>

        {/* Info section */}
        <div className="mt-8 space-y-4 rounded-lg border border-blue-200 bg-blue-50 p-6">
          <h2 className="font-semibold text-gray-900">
            Como usar links de rastreamento
          </h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">1.</span>
              <span>Crie um novo link informando o canal (Meta, Google, etc)</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">2.</span>
              <span>
                Copie o link gerado (começando com <code className="text-gray-900">https://app.com/r/</code>)
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">3.</span>
              <span>Cole o link no campo de URL do seu anúncio</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">4.</span>
              <span>Quando alguém clicar, será redirecionado para o WhatsApp com a mensagem configurada</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">5.</span>
              <span>Acompanhe os cliques na aba "Links" do dashboard</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
