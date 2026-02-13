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

export async function POST(_request: Request, context: RouteContext) {
  const { ticketId } = await Promise.resolve(context.params)

  const upstream = await tenantProxyRequest(`/api/v1/tickets/${encodeURIComponent(ticketId)}/send_debug_link`, {
    method: 'POST'
  })

  return toJsonResponse(upstream)
}
