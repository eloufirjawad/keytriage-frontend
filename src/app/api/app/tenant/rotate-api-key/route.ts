import { toJsonResponse } from '@/lib/proxyResponse'
import { tenantProxyRequest } from '@/lib/serverTenantProxy'

export async function POST() {
  const upstream = await tenantProxyRequest('/api/v1/tenants/me/rotate_api_key', {
    method: 'POST'
  })

  return toJsonResponse(upstream)
}
