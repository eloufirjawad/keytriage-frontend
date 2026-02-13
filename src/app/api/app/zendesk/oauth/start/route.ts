import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { getApiBaseUrl } from '@/lib/apiBase'
import { toJsonResponse } from '@/lib/proxyResponse'
import { tenantProxyRequest } from '@/lib/serverTenantProxy'

const resolveZendeskRedirectUri = (apiBaseUrl: string) => {
  const explicit = (process.env.NEXT_PUBLIC_ZENDESK_REDIRECT_URI || '').trim()

  if (explicit) {
    return explicit
  }

  return new URL('/api/v1/zendesk/oauth/callback', `${apiBaseUrl}/`).toString()
}

export async function GET(request: NextRequest) {
  const subdomain = request.nextUrl.searchParams.get('subdomain') || ''
  const apiBaseUrl = getApiBaseUrl()

  if (!subdomain) {
    return NextResponse.json({ detail: 'subdomain is required' }, { status: 400 })
  }

  const redirectUri = resolveZendeskRedirectUri(apiBaseUrl)
  const params = new URLSearchParams({ subdomain, redirect_uri: redirectUri })
  const upstream = await tenantProxyRequest(`/api/v1/zendesk/oauth/start?${params.toString()}`)

  return toJsonResponse(upstream)
}
