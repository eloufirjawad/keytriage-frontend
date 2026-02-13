import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const USER_TOKEN_COOKIE = 'kt_user_token'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const userToken = request.cookies.get(USER_TOKEN_COOKIE)?.value
  const isAuthenticated = Boolean(userToken)

  if (pathname.startsWith('/api/app/') || pathname.startsWith('/api/packets/')) {
    if (isAuthenticated) return NextResponse.next()

    return NextResponse.json({ detail: 'Authentication required.' }, { status: 401 })
  }

  if (pathname.startsWith('/app')) {
    if (isAuthenticated) return NextResponse.next()

    const loginUrl = request.nextUrl.clone()

    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('next', pathname)

    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/app/:path*', '/api/app/:path*', '/api/packets/:path*', '/login', '/register']
}
