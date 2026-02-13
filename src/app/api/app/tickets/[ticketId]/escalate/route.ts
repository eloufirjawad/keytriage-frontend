import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { toJsonResponse } from '@/lib/proxyResponse'
import { tenantProxyRequest } from '@/lib/serverTenantProxy'

type RouteContext = {
  params:
    | {
        ticketId: string
      }
    | Promise<{
        ticketId: string
      }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { ticketId } = await Promise.resolve(context.params)
  const { note } = await request.json()
  const trimmedNote = (note || '').trim()

  if (!trimmedNote) {
    return NextResponse.json({ detail: 'note is required' }, { status: 400 })
  }

  const upstream = await tenantProxyRequest(
    `/api/v1/tickets/${encodeURIComponent(ticketId)}/escalate?note=${encodeURIComponent(trimmedNote)}`,
    {
      method: 'POST'
    }
  )

  return toJsonResponse(upstream)
}
