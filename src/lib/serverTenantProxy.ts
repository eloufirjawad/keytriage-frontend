import 'server-only'

import { getApiBaseUrl } from '@/lib/apiBase'
import { getUserTokenFromCookies } from '@/lib/authCookie'

export const tenantProxyRequest = async (path: string, init?: RequestInit) => {
  const apiBaseUrl = getApiBaseUrl()
  const userToken = await getUserTokenFromCookies()

  if (!userToken) {
    throw new Error('Authentication required. Please sign in.')
  }

  const headers = new Headers(init?.headers)

  headers.set('Authorization', `Bearer ${userToken}`)

  return fetch(`${apiBaseUrl}${path}`, {
    ...init,
    cache: 'no-store',
    headers
  })
}
