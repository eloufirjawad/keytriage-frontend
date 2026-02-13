import { NextResponse } from 'next/server'

import { getApiBaseUrl } from '@/lib/apiBase'

const resolveZendeskRedirectUri = (apiBaseUrl: string) => {
  const explicit = (process.env.NEXT_PUBLIC_ZENDESK_REDIRECT_URI || '').trim()

  if (explicit) {
    return explicit
  }

  return new URL('/api/v1/zendesk/oauth/callback', `${apiBaseUrl}/`).toString()
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const subdomainFromQuery = (url.searchParams.get('subdomain') || '').trim().toLowerCase()
  const subdomain = subdomainFromQuery

  const apiBaseUrl = getApiBaseUrl()
  const postOrigin = (request.headers.get('origin') || url.origin || '').trim()
  const upstreamParams = new URLSearchParams()
  const redirectUri = resolveZendeskRedirectUri(apiBaseUrl)

  upstreamParams.set('mode', 'popup')
  upstreamParams.set('post_origin', postOrigin)
  upstreamParams.set('redirect_uri', redirectUri)

  if (subdomain) {
    upstreamParams.set('subdomain', subdomain)
  }

  const upstreamUrl = `${apiBaseUrl}/api/v1/auth/zendesk/start?${upstreamParams.toString()}`
  let upstream: Response

  try {
    upstream = await fetch(upstreamUrl, {
      cache: 'no-store'
    })
  } catch {
    return NextResponse.json(
      {
        detail: `Unable to reach API at ${apiBaseUrl}. Make sure Django is running.`
      },
      { status: 502 }
    )
  }

  const upstreamBodyText = await upstream.text()

  if (!upstream.ok) {
    let detail = upstreamBodyText || 'Zendesk auth start failed.'

    if (detail.includes('subdomain is required')) {
      detail =
        'Zendesk workspace not detected. Open login from your Zendesk app or pass ?subdomain=your_workspace.'
    }

    return NextResponse.json({ detail }, { status: upstream.status })
  }

  const payload = JSON.parse(upstreamBodyText) as { redirect_url?: string; flow_id?: string }
  const redirectUrl = (payload.redirect_url || '').trim()
  const flowId = (payload.flow_id || '').trim()

  if (!redirectUrl) {
    return NextResponse.json({ detail: 'Missing redirect URL from auth start.' }, { status: 502 })
  }

  let apiOrigin = ''

  try {
    apiOrigin = new URL(apiBaseUrl).origin
  } catch {
    apiOrigin = ''
  }

  return NextResponse.json(
    {
      redirect_url: redirectUrl,
      flow_id: flowId,
      api_origin: apiOrigin
    },
    { status: 200 }
  )
}
