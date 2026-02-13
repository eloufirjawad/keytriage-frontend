import 'server-only'

import { getApiBaseUrl } from '@/lib/apiBase'
import { getUserTokenFromCookies } from '@/lib/authCookie'

const requireUserToken = async () => {
  const userToken = await getUserTokenFromCookies()

  if (!userToken) {
    throw new Error('Authentication required. Please sign in.')
  }

  return userToken
}

export const fetchTenantApi = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const apiBaseUrl = getApiBaseUrl()
  const userToken = await requireUserToken()
  const url = `${apiBaseUrl}${path}`
  const headers = new Headers(init?.headers)

  headers.set('Authorization', `Bearer ${userToken}`)

  const response = await fetch(url, {
    ...init,
    cache: 'no-store',
    headers
  })

  if (!response.ok) {
    const detail = await response.text()

    throw new Error(`Tenant API request failed (${response.status}): ${detail}`)
  }

  return (await response.json()) as T
}
