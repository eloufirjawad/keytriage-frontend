import { NextResponse } from 'next/server'

import { getApiBaseUrl } from '@/lib/apiBase'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const flowId = (url.searchParams.get('flow_id') || '').trim()

  if (!flowId) {
    return NextResponse.json({ detail: 'flow_id is required.' }, { status: 400 })
  }

  const apiBaseUrl = getApiBaseUrl()
  const upstreamUrl = `${apiBaseUrl}/api/v1/auth/zendesk/flow_status?flow_id=${encodeURIComponent(flowId)}`

  const upstream = await fetch(upstreamUrl, { cache: 'no-store' })
  const bodyText = await upstream.text()

  let payload: Record<string, unknown>

  try {
    payload = JSON.parse(bodyText)
  } catch {
    payload = { detail: bodyText || 'Zendesk flow status request failed.' }
  }

  return NextResponse.json(payload, { status: upstream.status })
}
