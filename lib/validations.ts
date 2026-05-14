import { NextResponse } from 'next/server'

const UTM_SOURCES = ['meta', 'google', 'bio', 'organico', 'outro'] as const
export type UtmSource = (typeof UTM_SOURCES)[number]

// DDI (2) + DDD (2) + number (8 or 9) = 12 or 13 digits total.
export function validateWhatsappNumber(value: unknown): value is string {
  if (typeof value !== 'string') return false
  return /^\d{12,13}$/.test(value)
}

export function validateUtmSource(value: unknown): value is UtmSource {
  return typeof value === 'string' && (UTM_SOURCES as readonly string[]).includes(value)
}

// Cryptographically random slug using a-z0-9 alphabet.
export function generateSlug(length = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(bytes, (b) => chars[b % chars.length]).join('')
}

export function errorJson(
  code: string,
  message: string,
  status: number,
): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status })
}
