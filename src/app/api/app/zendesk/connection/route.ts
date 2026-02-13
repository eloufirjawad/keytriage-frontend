import { toJsonResponse } from '@/lib/proxyResponse'
import { tenantProxyRequest } from '@/lib/serverTenantProxy'

export async function GET() {
  const upstream = await tenantProxyRequest('/api/v1/zendesk/connection')

  return toJsonResponse(upstream)
}
