import { NextResponse } from 'next/server'

import { getApiBaseUrl } from '@/lib/apiBase'
import { getUserTokenFromCookies } from '@/lib/authCookie'

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
  const userToken = await getUserTokenFromCookies()

  if (!userToken) {
    return NextResponse.json({ detail: 'Authentication required.' }, { status: 401 })
  }

  const { packetId } = await Promise.resolve(context.params)
  const apiBaseUrl = getApiBaseUrl()
  const upstreamUrl = `${apiBaseUrl}/api/v1/packets/${packetId}/screenshot`

  try {
    const headers = new Headers()

    headers.set('Authorization', `Bearer ${userToken}`)

    const upstream = await fetch(upstreamUrl, {
      headers,
      redirect: 'manual',
      cache: 'no-store'
    })

    if (upstream.status === 302) {
      const location = upstream.headers.get('location')

      if (!location) {
        return NextResponse.json({ detail: 'Missing redirect URL from upstream' }, { status: 502 })
      }

      return NextResponse.redirect(location, 302)
    }

    if (!upstream.ok) {
      const detail = await upstream.text()

      return new NextResponse(detail, {
        status: upstream.status,
        headers: {
          'Content-Type': upstream.headers.get('content-type') || 'text/plain; charset=utf-8'
        }
      })
    }

    const fileData = await upstream.arrayBuffer()

    return new NextResponse(fileData, {
      status: 200,
      headers: {
        'Content-Type': upstream.headers.get('content-type') || 'application/octet-stream',
        'Cache-Control': 'no-store',
        'Content-Disposition': 'inline'
      }
    })
  } catch (error) {
    return NextResponse.json({ detail: `Screenshot proxy error: ${(error as Error).message}` }, { status: 502 })
  }
}
