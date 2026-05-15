import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Cookie-based redirect only — real auth verification happens in server components and API routes.
  // @supabase/ssr cannot be used here because it references Node.js APIs unsupported in the Vercel Edge Runtime.
  const hasAuthCookie = request.cookies.getAll().some(
    (cookie) => cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token'),
  )

  if (!hasAuthCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  // Only run on /dashboard and /api/clients — never on /r/[slug], /login, /register, /client
  matcher: ['/dashboard/:path*', '/api/clients/:path*'],
}
