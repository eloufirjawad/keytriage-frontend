import { NextResponse } from 'next/server'

export const toJsonResponse = async (upstream: Response) => {
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
}
