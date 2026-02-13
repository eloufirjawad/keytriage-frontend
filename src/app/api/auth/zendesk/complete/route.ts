import { NextResponse } from 'next/server'

import { getApiBaseUrl } from '@/lib/apiBase'
import { getAuthCookieOptions, USER_TOKEN_COOKIE } from '@/lib/authCookie'

type CompleteBody = {
  token?: string
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as CompleteBody
  const token = (payload.token || '').trim()

  if (!token) {
    return NextResponse.json({ detail: 'token is required.' }, { status: 400 })
  }

  const apiBaseUrl = getApiBaseUrl()

  const sessionCheck = await fetch(`${apiBaseUrl}/api/v1/auth/session`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    cache: 'no-store'
  })

  if (!sessionCheck.ok) {
    return NextResponse.json({ detail: 'Invalid or expired Zendesk auth token.' }, { status: 401 })
  }

  const sessionPayload = await sessionCheck.json()
  const response = NextResponse.json({ status: 'ok', ...sessionPayload }, { status: 200 })

  response.cookies.set(USER_TOKEN_COOKIE, token, getAuthCookieOptions())

  return response
}
