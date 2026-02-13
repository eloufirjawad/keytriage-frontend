import type { NextRequest } from 'next/server'

import { toJsonResponse } from '@/lib/proxyResponse'
import { tenantProxyRequest } from '@/lib/serverTenantProxy'

export async function GET() {
  const upstream = await tenantProxyRequest('/api/v1/tenants/me')

  return toJsonResponse(upstream)
}

export async function PATCH(request: NextRequest) {
  const payload = await request.text()

  const upstream = await tenantProxyRequest('/api/v1/tenants/me', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: payload
  })

  return toJsonResponse(upstream)
}
