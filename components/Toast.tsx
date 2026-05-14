'use client'

import { useState, useEffect } from 'react'

interface ToastProps {
  message: string
  type?: 'error' | 'success' | 'info'
  duration?: number
  onClose?: () => void
}

export function Toast({
  message,
  type = 'info',
  duration = 3000,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!isVisible) return null

  const bgColor = {
    error: 'bg-red-500',
    success: 'bg-green-500',
    info: 'bg-blue-500',
  }[type]

  return (
    <div
      className={`fixed bottom-4 right-4 rounded-lg px-6 py-3 text-white shadow-lg ${bgColor}`}
    >
      {message}
    </div>
  )
}
