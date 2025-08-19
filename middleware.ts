import { NextRequest, NextResponse } from 'next/server'
import { getUserBySessionToken } from '@/lib/auth'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/api/auth')
  if (isAuthRoute) return NextResponse.next()

  const token = req.cookies.get('session')?.value
  const user = getUserBySessionToken(token)
  if (!user) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = { matcher: ['/', '/api/:path*'] }
