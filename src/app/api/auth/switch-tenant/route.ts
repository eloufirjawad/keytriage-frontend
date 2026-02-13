import { NextResponse } from 'next/server'

import { getApiBaseUrl } from '@/lib/apiBase'
import { getUserTokenFromCookies } from '@/lib/authCookie'

type SwitchTenantBody = {
  tenant_id?: string
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as SwitchTenantBody
  const tenantId = (payload.tenant_id || '').trim()

  if (!tenantId) {
    return NextResponse.json({ detail: 'tenant_id is required.' }, { status: 400 })
  }

  const userToken = await getUserTokenFromCookies()

  if (!userToken) {
    return NextResponse.json({ detail: 'Not authenticated.' }, { status: 401 })
  }

  const apiBaseUrl = getApiBaseUrl()

  const upstream = await fetch(`${apiBaseUrl}/api/v1/auth/switch_tenant`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json'
    },
    cache: 'no-store',
    body: JSON.stringify({ tenant_id: tenantId })
  })

  const bodyText = await upstream.text()

  try {
    return NextResponse.json(JSON.parse(bodyText), { status: upstream.status })
  } catch {
    return NextResponse.json({ detail: bodyText || 'Switch tenant failed.' }, { status: upstream.status })
  }
}
