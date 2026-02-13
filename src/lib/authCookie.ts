import { cookies } from 'next/headers'

export const USER_TOKEN_COOKIE = 'kt_user_token'

export const getUserTokenFromCookies = async () => {
  const cookieStore = await cookies()
  const value = cookieStore.get(USER_TOKEN_COOKIE)?.value || ''

  return value.trim()
}

export const getAuthCookieOptions = () => {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 30
  }
}
