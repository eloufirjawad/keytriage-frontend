import { toJsonResponse } from '@/lib/proxyResponse'
import { tenantProxyRequest } from '@/lib/serverTenantProxy'

type RouteContext = {
  params:
    | {
        packetId: string
      }
    | Promise<{
        packetId: string
      }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { packetId } = await Promise.resolve(context.params)
  const upstream = await tenantProxyRequest(`/api/v1/packets/${encodeURIComponent(packetId)}/macros`)

  return toJsonResponse(upstream)
}
