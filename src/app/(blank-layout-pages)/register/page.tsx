'use client'

import { useMemo, useState } from 'react'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

const ZENDESK_AUTH_MESSAGE_TYPE = 'keytriage-zendesk-auth'

type ZendeskAuthStartResponse = {
  redirect_url: string
  flow_id?: string
  api_origin?: string
  detail?: string
}

type ZendeskFlowStatusResponse = {
  status?: string
  token?: string
  detail?: string
}

const isAllowedMessageOrigin = (origin: string, expectedOrigin: string) => {
  if (!expectedOrigin) return true
  if (origin === expectedOrigin) return true

  try {
    const left = new URL(origin)
    const right = new URL(expectedOrigin)
    const leftIsLoopback = left.hostname === '127.0.0.1' || left.hostname === 'localhost'
    const rightIsLoopback = right.hostname === '127.0.0.1' || right.hostname === 'localhost'
    const leftPort = left.port || (left.protocol === 'https:' ? '443' : '80')
    const rightPort = right.port || (right.protocol === 'https:' ? '443' : '80')

    return leftIsLoopback && rightIsLoopback && left.protocol === right.protocol && leftPort === rightPort
  } catch {
    return false
  }
}

const resolveSubdomain = (searchParams: URLSearchParams) => {
  const querySubdomain = (searchParams.get('subdomain') || searchParams.get('zd_subdomain') || '').trim().toLowerCase()

  const referrerSubdomain = (() => {
    try {
      const referrerHost = new URL(document.referrer || '').hostname || ''
      const match = referrerHost.match(/^([a-z0-9-]+)\.zendesk\.com$/i)

      
return match ? match[1].toLowerCase() : ''
    } catch {
      return ''
    }
  })()

  return querySubdomain || referrerSubdomain
}

const normalizeZendeskSubdomain = (rawValue: string) => {
  const value = rawValue.trim().toLowerCase()

  if (!value) return ''

  if (/^[a-z0-9-]+$/.test(value)) {
    return value
  }

  const withProtocol = value.includes('://') ? value : `https://${value}`

  try {
    const host = new URL(withProtocol).hostname.toLowerCase()
    const match = host.match(/^([a-z0-9-]+)\.zendesk\.com$/)

    if (match?.[1]) return match[1]
  } catch {
    return ''
  }

  return ''
}

const waitForZendeskAuthMessage = (apiOrigin: string) =>
  new Promise<{ token?: string }>((resolve, reject) => {
    const onMessage = (event: MessageEvent) => {
      if (!isAllowedMessageOrigin(event.origin, apiOrigin)) return

      const data = (event.data || {}) as { type?: string; token?: string }

      if (data.type !== ZENDESK_AUTH_MESSAGE_TYPE) return

      cleanup()
      resolve(data)
    }

    const timeoutHandle = window.setTimeout(() => {
      cleanup()
      reject(new Error('Zendesk auth timeout. Please try again.'))
    }, 90000)

    const cleanup = () => {
      window.removeEventListener('message', onMessage)
      window.clearTimeout(timeoutHandle)
    }

    window.addEventListener('message', onMessage)
  })

const waitForPopupClosed = (popup: Window) =>
  new Promise<never>((_, reject) => {
    let popupClosedAt: number | null = null

    const poll = window.setInterval(() => {
      if (!popup || popup.closed) {
        if (popupClosedAt === null) {
          popupClosedAt = Date.now()
          
return
        }

        if (Date.now() - popupClosedAt < 1500) return

        window.clearInterval(poll)
        reject(new Error('Zendesk popup closed before completing authentication.'))
      }
    }, 400)
  })

const sleep = (ms: number) => new Promise(resolve => window.setTimeout(resolve, ms))

const pollZendeskFlowToken = async (flowId: string) => {
  const timeoutAt = Date.now() + 90000

  while (Date.now() < timeoutAt) {
    const response = await fetch(`/api/auth/zendesk/flow-status?flow_id=${encodeURIComponent(flowId)}`, {
      cache: 'no-store'
    })

    const payload = (await response.json().catch(() => ({}))) as ZendeskFlowStatusResponse

    if (!response.ok) {
      throw new Error(payload.detail || 'Unable to confirm Zendesk authentication status.')
    }

    if (payload.status === 'completed') {
      const token = (payload.token || '').trim()

      if (token) {
        return token
      }
    }

    if (payload.status === 'failed' || payload.status === 'expired') {
      throw new Error(payload.detail || 'Zendesk authentication did not complete.')
    }

    await sleep(1200)
  }

  throw new Error('Zendesk authentication confirmation timed out. Please try again.')
}

const RegisterPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = useMemo(() => searchParams.get('next') || '/app/dashboard', [searchParams])

  const [oauthLoading, setOauthLoading] = useState(false)
  const [error, setError] = useState('')

  const handleZendeskContinue = async () => {
    setOauthLoading(true)
    setError('')

    try {
      let subdomain = resolveSubdomain(searchParams)
      const savedSubdomain = (window.localStorage.getItem('keytriage_zendesk_subdomain') || '').trim().toLowerCase()

      if (!subdomain && savedSubdomain) {
        subdomain = savedSubdomain
      }

      if (!subdomain) {
        const workspaceInput = window.prompt(
          'Enter your Zendesk workspace subdomain or URL (example: acme or acme.zendesk.com)'
        )

        subdomain = normalizeZendeskSubdomain(workspaceInput || '')
      }

      if (!subdomain) {
        throw new Error('Zendesk workspace is required to continue.')
      }

      window.localStorage.setItem('keytriage_zendesk_subdomain', subdomain)

      // Open popup synchronously from the click event to avoid browser popup blockers.
      const popup = window.open('about:blank', 'keytriage_web_zendesk_auth', 'width=560,height=760')

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site and try again.')
      }

      try {
        popup.document.title = 'KeyTriage'
        popup.document.body.innerHTML = '<p style="font-family: system-ui; padding: 16px;">Connecting to Zendesk...</p>'
      } catch {
        // Ignore DOM access errors for popup placeholder content.
      }

      const startPath = `/api/auth/zendesk/start?subdomain=${encodeURIComponent(subdomain)}`

      const startResponse = await fetch(startPath, { cache: 'no-store' })
      const startPayload = (await startResponse.json().catch(() => ({}))) as ZendeskAuthStartResponse

      if (!startResponse.ok || !startPayload.redirect_url) {
        throw new Error(startPayload.detail || 'Unable to start Zendesk authentication.')
      }

      const flowId = (startPayload.flow_id || '').trim()

      const authPromise = waitForZendeskAuthMessage(startPayload.api_origin || '')

      popup.location.href = startPayload.redirect_url

      let token = ''

      try {
        const authMessage = await Promise.race([authPromise, waitForPopupClosed(popup)])

        token = (authMessage.token || '').trim()
      } catch {
        // Continue with flow-status polling fallback.
      }

      if (!token && flowId) {
        token = await pollZendeskFlowToken(flowId)
      }

      if (!token) {
        throw new Error('Zendesk auth did not return a session token.')
      }

      const completeResponse = await fetch('/api/auth/zendesk/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })

      const completePayload = (await completeResponse.json().catch(() => ({}))) as { detail?: string }

      if (!completeResponse.ok) {
        throw new Error(completePayload.detail || 'Zendesk authentication failed.')
      }

      router.replace(nextPath)
      router.refresh()
    } catch (requestError) {
      setError((requestError as Error).message)
    } finally {
      setOauthLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Paper variant='outlined' sx={{ width: '100%', maxWidth: 520, p: 3 }}>
        <Stack spacing={2}>
          <Typography variant='h4'>Register with Zendesk</Typography>
          <Typography color='text.secondary'>
            KeyTriage automatically creates your workspace from your Zendesk account.
          </Typography>

          {error && <Alert severity='error'>{error}</Alert>}

          <Button variant='contained' disabled={oauthLoading} onClick={handleZendeskContinue}>
            {oauthLoading ? 'Connecting Zendesk...' : 'Continue with Zendesk'}
          </Button>

          <Typography color='text.secondary'>
            Already connected? <Link href='/login'>Sign in with Zendesk</Link>
          </Typography>
          <Typography color='text.secondary'>
            Back to <Link href='/'>landing page</Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  )
}

export default RegisterPage
