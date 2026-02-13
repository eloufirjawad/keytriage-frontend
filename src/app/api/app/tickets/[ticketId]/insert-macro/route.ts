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
  const { macro_id: macroId, public: isPublic } = await request.json()

  if (!macroId) {
    return NextResponse.json({ detail: 'macro_id is required' }, { status: 400 })
  }

  const publicValue = isPublic === false ? 'false' : 'true'

  const upstream = await tenantProxyRequest(
    `/api/v1/tickets/${encodeURIComponent(ticketId)}/insert_macro?macro_id=${encodeURIComponent(macroId)}&public=${publicValue}`,
    {
      method: 'POST'
    }
  )

  return toJsonResponse(upstream)
}
