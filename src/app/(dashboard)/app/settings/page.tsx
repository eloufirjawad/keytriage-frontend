'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { appApiFetch } from '@/lib/clientApi'
import type { TenantSettings, ZendeskConnectionStatus } from '@/types/keytriage'

const SettingsPage = () => {
  const router = useRouter()
  const [tenant, setTenant] = useState<TenantSettings | null>(null)
  const [zendesk, setZendesk] = useState<ZendeskConnectionStatus | null>(null)
  const [subdomain, setSubdomain] = useState('')
  const [integrationApiKey, setIntegrationApiKey] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadData = async () => {
    const [tenantPayload, zendeskPayload] = await Promise.all([
      appApiFetch<TenantSettings>('/api/app/tenant'),
      appApiFetch<ZendeskConnectionStatus>('/api/app/zendesk/connection')
    ])

    setTenant(tenantPayload)
    setZendesk(zendeskPayload)
    setSubdomain(zendeskPayload.subdomain || '')
  }

  useEffect(() => {
    loadData().catch(requestError => {
      setError((requestError as Error).message)
    })
  }, [])

  const updateTenantField = <K extends keyof TenantSettings>(field: K, value: TenantSettings[K]) => {
    setTenant(current => {
      if (!current) return current

      return {
        ...current,
        [field]: value
      }
    })
  }

  const saveSettings = async () => {
    if (!tenant) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const payload = {
        retention_days: tenant.retention_days,
        screenshot_enabled: tenant.screenshot_enabled,
        token_expires_seconds: tenant.token_expires_seconds,
        auto_post_public: tenant.auto_post_public,
        ticket_tagging_enabled: tenant.ticket_tagging_enabled
      }

      const saved = await appApiFetch<TenantSettings>('/api/app/tenant', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      setTenant(saved)
      setSuccess('Tenant settings saved.')
    } catch (requestError) {
      setError((requestError as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const startOauthFlow = async () => {
    if (!subdomain.trim()) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const payload = await appApiFetch<{ redirect_url: string }>(
        `/api/app/zendesk/oauth/start?subdomain=${encodeURIComponent(subdomain.trim())}`
      )

      window.open(payload.redirect_url, '_blank', 'noopener,noreferrer')
      setSuccess('OAuth window opened. Complete it, then refresh this page.')
    } catch (requestError) {
      setError((requestError as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.replace('/login')
    router.refresh()
  }

  const handleGenerateApiKey = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const payload = await appApiFetch<{ api_key: string }>('/api/app/tenant/rotate-api-key', {
        method: 'POST'
      })

      setIntegrationApiKey(payload.api_key)
      setSuccess('New API key generated. Copy it now; it will not be shown again.')
    } catch (requestError) {
      setError((requestError as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant='h4'>Workspace Settings</Typography>
        <Typography color='text.secondary'>Configure tenant behavior, retention, and Zendesk connection.</Typography>
        <Button sx={{ mt: 1 }} variant='text' color='inherit' onClick={handleLogout}>
          Sign out
        </Button>
      </Box>

      {error && <Alert severity='error'>{error}</Alert>}
      {success && <Alert severity='success'>{success}</Alert>}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper variant='outlined' sx={{ p: 2.5 }}>
            <Typography variant='h6'>Tenant</Typography>
            <Divider sx={{ my: 1.5 }} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label='Name' value={tenant?.name || ''} fullWidth disabled />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label='Slug' value={tenant?.slug || ''} fullWidth disabled />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label='Retention days'
                  type='number'
                  fullWidth
                  value={tenant?.retention_days ?? ''}
                  disabled={!tenant}
                  onChange={event => {
                    updateTenantField('retention_days', Number(event.target.value || 30))
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label='Token expiry (seconds)'
                  type='number'
                  fullWidth
                  value={tenant?.token_expires_seconds ?? ''}
                  disabled={!tenant}
                  onChange={event => {
                    updateTenantField('token_expires_seconds', Number(event.target.value || 86400))
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField label='Status' value={tenant?.status || ''} fullWidth disabled />
              </Grid>
            </Grid>

            <Stack sx={{ mt: 1.5 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={Boolean(tenant?.screenshot_enabled)}
                    disabled={!tenant}
                    onChange={event => {
                      updateTenantField('screenshot_enabled', event.target.checked)
                    }}
                  />
                }
                label='Enable screenshots'
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={Boolean(tenant?.auto_post_public)}
                    disabled={!tenant}
                    onChange={event => {
                      updateTenantField('auto_post_public', event.target.checked)
                    }}
                  />
                }
                label='Auto post debug link as public reply'
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={Boolean(tenant?.ticket_tagging_enabled)}
                    disabled={!tenant}
                    onChange={event => {
                      updateTenantField('ticket_tagging_enabled', event.target.checked)
                    }}
                  />
                }
                label='Enable ticket tags'
              />
            </Stack>

            <Button sx={{ mt: 1.5 }} variant='contained' disabled={saving || !tenant} onClick={saveSettings}>
              Save Settings
            </Button>

            <Divider sx={{ my: 1.5 }} />
            <Typography variant='h6'>Integration API key</Typography>
            <Typography color='text.secondary'>
              Use this key for Zendesk app configuration or server-to-server calls.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1 }}>
              <Button variant='outlined' disabled={saving} onClick={handleGenerateApiKey}>
                Generate New API Key
              </Button>
              <Button
                variant='outlined'
                disabled={!integrationApiKey}
                onClick={async () => {
                  await navigator.clipboard.writeText(integrationApiKey)
                }}
              >
                Copy API Key
              </Button>
            </Stack>
            {integrationApiKey && (
              <TextField
                sx={{ mt: 1 }}
                fullWidth
                label='New API key (one-time display)'
                value={integrationApiKey}
                InputProps={{ readOnly: true }}
              />
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Paper variant='outlined' sx={{ p: 2.5 }}>
            <Typography variant='h6'>Zendesk</Typography>
            <Divider sx={{ my: 1.5 }} />
            <Stack spacing={1}>
              <Stack direction='row' spacing={1} alignItems='center'>
                <Typography>Connection status:</Typography>
                <Chip
                  label={zendesk?.connected ? 'Connected' : 'Not connected'}
                  color={zendesk?.connected ? 'success' : 'default'}
                  size='small'
                />
              </Stack>
              <Typography color='text.secondary'>Subdomain: {zendesk?.subdomain || '-'}</Typography>
              <Typography color='text.secondary'>Token expires: {zendesk?.token_expires_at || '-'}</Typography>
            </Stack>

            <Divider sx={{ my: 1.5 }} />
            <TextField
              fullWidth
              label='Zendesk subdomain'
              value={subdomain}
              onChange={event => {
                setSubdomain(event.target.value)
              }}
            />
            <Button sx={{ mt: 1.5 }} variant='outlined' disabled={saving || !subdomain.trim()} onClick={startOauthFlow}>
              Start OAuth Connect
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  )
}

export default SettingsPage
