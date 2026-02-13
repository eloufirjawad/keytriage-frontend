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

const passthroughJsonResponse = async (response: Response) => {
  const body = await response.text()
  const contentType = response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    try {
      return NextResponse.json(JSON.parse(body), { status: response.status })
    } catch {
      return NextResponse.json({ detail: body || 'Invalid JSON from upstream' }, { status: response.status })
    }
  }

  return new NextResponse(body, {
    status: response.status,
    headers: {
      'Content-Type': contentType || 'text/plain; charset=utf-8'
    }
  })
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { packetId } = await Promise.resolve(context.params)
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.json({ detail: 'token is required' }, { status: 400 })
  }

  const apiBaseUrl = getApiBaseUrl()
  const upstreamUrl = `${apiBaseUrl}/api/v1/packets/${packetId}/submit_public?token=${encodeURIComponent(token)}`
  const contentType = request.headers.get('content-type') || ''

  try {
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const upstreamForm = new FormData()

      for (const [key, value] of formData.entries()) {
        upstreamForm.append(key, value)
      }

      const upstream = await fetch(upstreamUrl, {
        method: 'POST',
        body: upstreamForm,
        cache: 'no-store'
      })

      return passthroughJsonResponse(upstream)
    }

    const raw = await request.text()

    const upstream = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': contentType || 'application/json'
      },
      body: raw,
      cache: 'no-store'
    })

    return passthroughJsonResponse(upstream)
  } catch (error) {
    return NextResponse.json(
      { detail: `Proxy error: ${(error as Error).message}` },
      { status: 502 }
    )
  }
}
