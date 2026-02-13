import { NextResponse } from 'next/server'

import { getApiBaseUrl } from '@/lib/apiBase'
import { getUserTokenFromCookies, USER_TOKEN_COOKIE } from '@/lib/authCookie'

export async function GET() {
  const userToken = await getUserTokenFromCookies()

  if (!userToken) {
    return NextResponse.json({ authenticated: false }, { status: 200 })
  }

  const apiBaseUrl = getApiBaseUrl()

  const upstream = await fetch(`${apiBaseUrl}/api/v1/auth/session`, {
    headers: {
      Authorization: `Bearer ${userToken}`
    },
    cache: 'no-store'
  })

  if (!upstream.ok) {
    const response = NextResponse.json({ authenticated: false }, { status: 200 })

    response.cookies.set(USER_TOKEN_COOKIE, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0
    })

    return response
  }

  const sessionPayload = await upstream.json()

  return NextResponse.json({ authenticated: true, ...sessionPayload }, { status: 200 })
}
