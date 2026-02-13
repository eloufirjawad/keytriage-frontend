import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server'

import { getApiBaseUrl } from '@/lib/apiBase'

type RouteContext = {
  params:
    | {
        packetId: string
      }
    | Promise<{
        packetId: string
      }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { packetId } = await Promise.resolve(context.params)
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.json({ detail: 'token is required' }, { status: 400 })
  }

  const apiBaseUrl = getApiBaseUrl()
  const upstreamUrl = `${apiBaseUrl}/api/v1/packets/${packetId}/public?token=${encodeURIComponent(token)}`

  try {
    const upstream = await fetch(upstreamUrl, {
      cache: 'no-store'
    })

    const body = await upstream.text()
    const contentType = upstream.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      try {
        return NextResponse.json(JSON.parse(body), { status: upstream.status })
      } catch {
        return NextResponse.json({ detail: body || 'Invalid JSON from upstream' }, { status: upstream.status })
      }
    }

    return new NextResponse(body, {
      status: upstream.status,
      headers: {
        'Content-Type': contentType || 'text/plain; charset=utf-8'
      }
    })
  } catch (error) {
    return NextResponse.json(
      { detail: `Proxy error: ${(error as Error).message}` },
      { status: 502 }
    )
  }
}
