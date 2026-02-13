type ApiErrorPayload = {
  detail?: string
}

const parseResponse = async <T>(response: Response): Promise<T | ApiErrorPayload> => {
  const body = await response.text()
  const contentType = response.headers.get('content-type') || ''

  if (!contentType.includes('application/json')) {
    return { detail: body || 'Unexpected response format' }
  }

  try {
    return JSON.parse(body) as T
  } catch {
    return { detail: body || 'Invalid JSON response' }
  }
}

export const appApiFetch = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(path, {
    ...init,
    cache: 'no-store'
  })

  const payload = await parseResponse<T>(response)

  if (!response.ok) {
    const detail = (payload as ApiErrorPayload).detail || `Request failed (${response.status})`

    throw new Error(detail)
  }

  return payload as T
}
