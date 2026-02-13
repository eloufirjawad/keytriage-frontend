'use client'

import type { FormEvent} from 'react';
import { useEffect, useMemo, useState } from 'react'

import { useParams, useSearchParams } from 'next/navigation'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormLabel from '@mui/material/FormLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import type {
  PacketSubmitRequest,
  PacketSubmitResponse,
  PublicPacketStatusResponse
} from '@/types/keytriage'

type EnvironmentData = {
  os: string
  browser: string
  device: string
}

type CapabilityData = {
  webauthn_supported: boolean
  platform_authenticator_available: boolean
  cross_device_available: boolean
}

const detectEnvironment = (): EnvironmentData => {
  const userAgent = window.navigator.userAgent

  let os = 'Unknown'

  if (/Android/i.test(userAgent)) os = 'Android'
  else if (/iPhone|iPad|iPod/i.test(userAgent)) os = 'iOS'
  else if (/Windows NT/i.test(userAgent)) os = 'Windows'
  else if (/Mac OS X/i.test(userAgent)) os = 'macOS'
  else if (/Linux/i.test(userAgent)) os = 'Linux'

  let browser = 'Unknown'

  if (/Edg\//i.test(userAgent)) browser = 'Edge'
  else if (/Chrome\//i.test(userAgent) && !/Edg\//i.test(userAgent)) browser = 'Chrome'
  else if (/Safari\//i.test(userAgent) && !/Chrome\//i.test(userAgent)) browser = 'Safari'
  else if (/Firefox\//i.test(userAgent)) browser = 'Firefox'

  const device = /Mobi|Android|iPhone|iPad|iPod/i.test(userAgent) ? 'mobile' : 'desktop'

  return { os, browser, device }
}

const detectCapabilities = async (): Promise<CapabilityData> => {
  const maybePublicKeyCredential = (typeof window !== 'undefined' ? window.PublicKeyCredential : undefined) as
    | (typeof PublicKeyCredential & {
        isConditionalMediationAvailable?: () => Promise<boolean>
      })
    | undefined

  const hasPublicKeyCredential = Boolean(maybePublicKeyCredential)

  const maybePublicKeyCredentialWithExtra = maybePublicKeyCredential as
    | (typeof PublicKeyCredential & {
        isConditionalMediationAvailable?: () => Promise<boolean>
      })
    | undefined

  let platformAuthenticatorAvailable = false
  let crossDeviceAvailable = false

  if (
    hasPublicKeyCredential &&
    maybePublicKeyCredential &&
    typeof maybePublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
  ) {
    try {
      platformAuthenticatorAvailable = await maybePublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
    } catch {
      platformAuthenticatorAvailable = false
    }
  }

  if (
    hasPublicKeyCredential &&
    maybePublicKeyCredentialWithExtra &&
    typeof maybePublicKeyCredentialWithExtra.isConditionalMediationAvailable === 'function'
  ) {
    try {
      crossDeviceAvailable = await maybePublicKeyCredentialWithExtra.isConditionalMediationAvailable()
    } catch {
      crossDeviceAvailable = false
    }
  }

  return {
    webauthn_supported: hasPublicKeyCredential,
    platform_authenticator_available: platformAuthenticatorAvailable,
    cross_device_available: crossDeviceAvailable
  }
}

const statusChipColor = (status: string): 'default' | 'success' | 'error' => {
  if (status === 'completed') return 'success'
  if (status === 'expired') return 'error'
  if (status === 'pending') return 'default'

  return 'default'
}

const DebugPacketPage = () => {
  const routeParams = useParams<{ packetId: string }>()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const packetIdFromRoute = Array.isArray(routeParams.packetId) ? routeParams.packetId[0] : routeParams.packetId
  const [packetId, setPacketId] = useState<string>('')
  const [packetStatus, setPacketStatus] = useState<PublicPacketStatusResponse | null>(null)
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitResult, setSubmitResult] = useState<PacketSubmitResponse | null>(null)
  const [requestError, setRequestError] = useState<string>('')

  const [consent, setConsent] = useState(false)
  const [intent, setIntent] = useState('login')
  const [symptom, setSymptom] = useState('prompt did not appear')
  const [errorMessage, setErrorMessage] = useState('')
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null)

  const [environment, setEnvironment] = useState<EnvironmentData>({
    os: 'Unknown',
    browser: 'Unknown',
    device: 'desktop'
  })

  const [capability, setCapability] = useState<CapabilityData>({
    webauthn_supported: false,
    platform_authenticator_available: false,
    cross_device_available: false
  })

  useEffect(() => {
    let ignore = false

    const load = async () => {
      const resolvedPacketId = packetIdFromRoute

      if (ignore || !resolvedPacketId) return

      setPacketId(resolvedPacketId)
      setLoadingStatus(true)
      setRequestError('')

      if (!token) {
        setLoadingStatus(false)
        setRequestError('Missing token in debug link.')
        
return
      }

      try {
        const statusResponse = await fetch(`/api/public/packets/${resolvedPacketId}?token=${encodeURIComponent(token)}`, {
          cache: 'no-store'
        })

        const statusPayload = (await statusResponse.json()) as PublicPacketStatusResponse & { detail?: string }

        if (!statusResponse.ok) {
          setRequestError(statusPayload.detail || 'Unable to load packet status.')
          setPacketStatus(null)
        } else {
          setPacketStatus(statusPayload)
        }
      } catch (error) {
        setRequestError(`Unable to load packet status: ${(error as Error).message}`)
        setPacketStatus(null)
      } finally {
        setLoadingStatus(false)
      }
    }

    load()

    return () => {
      ignore = true
    }
  }, [packetIdFromRoute, token])

  useEffect(() => {
    let ignore = false

    const runDetection = async () => {
      const detectedEnvironment = detectEnvironment()
      const detectedCapability = await detectCapabilities()

      if (ignore) return

      setEnvironment(detectedEnvironment)
      setCapability(detectedCapability)
    }

    runDetection()

    return () => {
      ignore = true
    }
  }, [])

  const canSubmit = useMemo(() => {
    return Boolean(token && packetStatus?.status === 'pending' && !submitLoading)
  }, [packetStatus?.status, submitLoading, token])

  const submitPacket = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!packetId || !token) return

    setSubmitLoading(true)
    setRequestError('')

    const payload: PacketSubmitRequest = {
      consent,
      answers: { intent, symptom },
      environment,
      capability,
      error_message: errorMessage.trim()
    }

    try {
      let response: Response
      const submitUrl = `/api/public/packets/${packetId}/submit?token=${encodeURIComponent(token)}`

      if (screenshotFile) {
        const multipart = new FormData()

        multipart.append('payload', JSON.stringify(payload))
        multipart.append('screenshot', screenshotFile)
        response = await fetch(submitUrl, {
          method: 'POST',
          body: multipart
        })
      } else {
        response = await fetch(submitUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })
      }

      const responseBody = (await response.json()) as PacketSubmitResponse & { detail?: string }

      if (!response.ok) {
        setRequestError(responseBody.detail || 'Unable to submit packet.')
        
return
      }

      setSubmitResult(responseBody)
      setPacketStatus(prev =>
        prev
          ? {
              ...prev,
              status: responseBody.status,
              completed_at: new Date().toISOString()
            }
          : prev
      )
    } catch (error) {
      setRequestError(`Unable to submit packet: ${(error as Error).message}`)
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <Container maxWidth='sm' sx={{ py: 8 }}>
      <Paper elevation={0} variant='outlined' sx={{ p: { xs: 3, sm: 4 } }}>
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography variant='h4'>KeyTriage</Typography>
            <Typography color='text.secondary'>Login triage report</Typography>
          </Stack>

          {loadingStatus ? (
            <Stack direction='row' spacing={1} alignItems='center'>
              <CircularProgress size={18} />
              <Typography>Loading packet status...</Typography>
            </Stack>
          ) : (
            <Stack direction='row' spacing={1} alignItems='center'>
              <Typography color='text.secondary'>Packet status</Typography>
              <Chip label={packetStatus?.status || 'unknown'} color={statusChipColor(packetStatus?.status || 'unknown')} />
            </Stack>
          )}

          {requestError && <Alert severity='error'>{requestError}</Alert>}

          {packetStatus?.status === 'expired' && (
            <Alert severity='warning'>This debug link expired. Ask your support agent to resend a new link.</Alert>
          )}

          {packetStatus?.status === 'completed' && (
            <Alert severity='success'>
              Packet submitted. Your support agent received the report.
              {submitResult?.failure_category ? ` Category: ${submitResult.failure_category}.` : ''}
            </Alert>
          )}

          {packetStatus?.status === 'pending' && (
            <Box component='form' onSubmit={submitPacket}>
              <Stack spacing={3}>
                <Stack spacing={1}>
                  <Typography variant='h6'>Consent</Typography>
                  <Typography color='text.secondary'>
                    We collect device/browser info and your answers. We do not collect passwords, passkeys, biometric data, or
                    WebAuthn credential payloads.
                  </Typography>
                  <FormControlLabel
                    control={<Checkbox checked={consent} onChange={event => setConsent(event.target.checked)} />}
                    label='I agree to share this diagnostic information with support'
                  />
                </Stack>

                <Divider />

                <FormControl fullWidth>
                  <FormLabel>What are you trying to do?</FormLabel>
                  <TextField
                    select
                    value={intent}
                    onChange={event => setIntent(event.target.value)}
                    sx={{ mt: 1 }}
                  >
                    <MenuItem value='login'>Login</MenuItem>
                    <MenuItem value='add_passkey'>Add passkey</MenuItem>
                    <MenuItem value='reset_passkey'>Reset passkey</MenuItem>
                  </TextField>
                </FormControl>

                <FormControl fullWidth>
                  <FormLabel>What happened?</FormLabel>
                  <TextField
                    select
                    value={symptom}
                    onChange={event => setSymptom(event.target.value)}
                    sx={{ mt: 1 }}
                  >
                    <MenuItem value='prompt did not appear'>Passkey prompt did not appear</MenuItem>
                    <MenuItem value='prompt appeared but failed'>Prompt appeared but failed</MenuItem>
                    <MenuItem value='completed prompt but login failed'>Completed prompt but login still failed</MenuItem>
                    <MenuItem value='not sure'>Not sure</MenuItem>
                  </TextField>
                </FormControl>

                <Stack spacing={1}>
                  <Typography variant='h6'>Quick checks</Typography>
                  <Typography color='text.secondary'>
                    Device: {environment.device} / {environment.os} / {environment.browser}
                  </Typography>
                  <Typography color='text.secondary'>WebAuthn supported: {String(capability.webauthn_supported)}</Typography>
                  <Typography color='text.secondary'>
                    Platform authenticator: {String(capability.platform_authenticator_available)}
                  </Typography>
                  <Typography color='text.secondary'>Cross-device available: {String(capability.cross_device_available)}</Typography>
                </Stack>

                <TextField
                  fullWidth
                  label='Optional error message'
                  value={errorMessage}
                  onChange={event => setErrorMessage(event.target.value)}
                  multiline
                  minRows={2}
                />

                <Stack spacing={1}>
                  <Typography variant='body2' color='text.secondary'>
                    Optional screenshot
                  </Typography>
                  <Button component='label' variant='outlined'>
                    {screenshotFile ? `Selected: ${screenshotFile.name}` : 'Upload screenshot'}
                    <input
                      hidden
                      type='file'
                      accept='image/png,image/jpeg,image/webp'
                      onChange={event => {
                        const nextFile = event.target.files?.[0] || null

                        setScreenshotFile(nextFile)
                      }}
                    />
                  </Button>
                </Stack>

                <Button type='submit' variant='contained' disabled={!canSubmit || !consent}>
                  {submitLoading ? 'Submitting...' : 'Submit support packet'}
                </Button>
              </Stack>
            </Box>
          )}

          {submitResult?.summary && (
            <Stack spacing={1}>
              <Typography variant='h6'>Submitted summary</Typography>
              <Paper variant='outlined' sx={{ p: 2, whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: 13 }}>
                {submitResult.summary}
              </Paper>
            </Stack>
          )}

          {submitResult?.triage && (
            <Stack spacing={1}>
              <Typography variant='h6'>Structured triage JSON</Typography>
              <Paper variant='outlined' sx={{ p: 2, whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: 12 }}>
                {JSON.stringify(submitResult.triage, null, 2)}
              </Paper>
            </Stack>
          )}
        </Stack>
      </Paper>
    </Container>
  )
}

export default DebugPacketPage
