import { NextResponse } from 'next/server'

import { getApiBaseUrl } from '@/lib/apiBase'
import { getUserTokenFromCookies, USER_TOKEN_COOKIE } from '@/lib/authCookie'

export async function POST() {
  const apiBaseUrl = getApiBaseUrl()
  const userToken = await getUserTokenFromCookies()

  if (userToken) {
    await fetch(`${apiBaseUrl}/api/v1/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userToken}`
      },
      cache: 'no-store'
    }).catch(() => null)
  }

  const response = NextResponse.json({ status: 'ok' }, { status: 200 })

  response.cookies.set(USER_TOKEN_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  })

  return response
}
