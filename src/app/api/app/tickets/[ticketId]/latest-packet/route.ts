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

export async function GET(_request: Request, context: RouteContext) {
  const { ticketId } = await Promise.resolve(context.params)
  const upstream = await tenantProxyRequest(`/api/v1/tickets/${encodeURIComponent(ticketId)}/packets/latest`)

  return toJsonResponse(upstream)
}
