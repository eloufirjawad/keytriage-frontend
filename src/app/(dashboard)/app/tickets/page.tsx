'use client'

import { useCallback, useMemo, useState } from 'react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { appApiFetch } from '@/lib/clientApi'
import type { LatestPacketStatus, MacroTemplate, SendDebugLinkResponse } from '@/types/keytriage'

const statusColor = (status: string) => {
  if (status === 'completed') return 'success'
  if (status === 'pending') return 'default'
  if (status === 'expired') return 'error'

  return 'default'
}

const TicketsPage = () => {
  const [ticketId, setTicketId] = useState('')
  const [packet, setPacket] = useState<LatestPacketStatus | null>(null)
  const [macros, setMacros] = useState<MacroTemplate[]>([])
  const [selectedMacroId, setSelectedMacroId] = useState('')
  const [debugLinkUrl, setDebugLinkUrl] = useState('')
  const [escalationNote, setEscalationNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const hasPacket = Boolean(packet && packet.status !== 'none')
  const packetId = packet?.packet_id || ''

  const activeMacro = useMemo(() => {
    return macros.find(item => item.id === selectedMacroId) || null
  }, [macros, selectedMacroId])

  const triage = packet?.triage
  const topCandidates = Array.isArray(triage?.top_candidates) ? triage.top_candidates : []
  const likelyCauses = Array.isArray(triage?.likely_causes) ? triage.likely_causes : []
  const nextActions = Array.isArray(triage?.recommended_next_actions) ? triage.recommended_next_actions : []
  const escalationChecklist = Array.isArray(triage?.escalation_checklist) ? triage.escalation_checklist : []

  const hasStructuredTriage =
    Boolean(triage?.version) ||
    topCandidates.length > 0 ||
    likelyCauses.length > 0 ||
    nextActions.length > 0 ||
    escalationChecklist.length > 0

  const refreshLatestPacket = useCallback(async (targetTicketId: string) => {
    const latest = await appApiFetch<LatestPacketStatus>(
      `/api/app/tickets/${encodeURIComponent(targetTicketId)}/latest-packet`
    )

    setPacket(latest)

    if (latest.packet_id) {
      const macroRows = await appApiFetch<MacroTemplate[]>(`/api/app/packets/${latest.packet_id}/macros`)

      setMacros(macroRows)
      setSelectedMacroId(macroRows[0]?.id || '')
    } else {
      setMacros([])
      setSelectedMacroId('')
    }
  }, [])

  const runWithFeedback = async (message: string, fn: () => Promise<void>) => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await fn()
      setSuccess(message)
    } catch (requestError) {
      setError((requestError as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleSendDebugLink = async () => {
    await runWithFeedback('Debug link sent to ticket.', async () => {
      const payload = await appApiFetch<SendDebugLinkResponse>(
        `/api/app/tickets/${encodeURIComponent(ticketId)}/send-debug-link`,
        {
          method: 'POST'
        }
      )

      setDebugLinkUrl(payload.debug_link_url)
      await refreshLatestPacket(ticketId)
    })
  }

  const handleRefresh = async () => {
    await runWithFeedback('Latest packet refreshed.', async () => {
      await refreshLatestPacket(ticketId)
    })
  }

  const handleInsertMacro = async (publicReply: boolean) => {
    if (!selectedMacroId) return

    await runWithFeedback(publicReply ? 'Public macro inserted.' : 'Internal macro inserted.', async () => {
      await appApiFetch<{ status: string }>(`/api/app/tickets/${encodeURIComponent(ticketId)}/insert-macro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          macro_id: selectedMacroId,
          public: publicReply
        })
      })
    })
  }

  const handleEscalate = async () => {
    await runWithFeedback('Ticket escalated to engineering.', async () => {
      await appApiFetch<{ status: string }>(`/api/app/tickets/${encodeURIComponent(ticketId)}/escalate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          note: escalationNote
        })
      })
    })
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant='h4'>Ticket Workbench</Typography>
        <Typography color='text.secondary'>Run full Zendesk ticket triage from one screen.</Typography>
      </Box>

      {error && <Alert severity='error'>{error}</Alert>}
      {success && <Alert severity='success'>{success}</Alert>}

      <Paper variant='outlined' sx={{ p: 2.5 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 5 }}>
            <TextField
              label='Zendesk ticket ID'
              value={ticketId}
              onChange={event => setTicketId(event.target.value)}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <Button variant='contained' disabled={loading || !ticketId.trim()} onClick={handleSendDebugLink}>
                Send / Resend Debug Link
              </Button>
              <Button variant='outlined' disabled={loading || !ticketId.trim()} onClick={handleRefresh}>
                Refresh Packet
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper variant='outlined' sx={{ p: 2.5 }}>
            <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{ mb: 1.5 }}>
              <Typography variant='h6'>Latest Packet</Typography>
              <Chip label={packet?.status || 'none'} color={statusColor(packet?.status || 'none')} size='small' />
            </Stack>
            <Typography color='text.secondary'>Packet ID: {packetId || '-'}</Typography>
            <Typography color='text.secondary'>Expires at: {packet?.expires_at || '-'}</Typography>
            <Typography color='text.secondary'>
              Category: {packet?.failure_category || '-'} {packet?.confidence ? `(${packet.confidence})` : ''}
            </Typography>
            {debugLinkUrl && (
              <Typography sx={{ mt: 1 }}>
                Debug link:{' '}
                <a href={debugLinkUrl} target='_blank' rel='noopener noreferrer'>
                  open
                </a>
              </Typography>
            )}
            <Divider sx={{ my: 1.5 }} />
            <Typography variant='subtitle2' sx={{ mb: 1 }}>
              Summary
            </Typography>
            <Paper variant='outlined' sx={{ p: 1.5, whiteSpace: 'pre-wrap', minHeight: 160 }}>
              {packet?.summary || 'No packet summary yet.'}
            </Paper>
            {hasStructuredTriage && triage && (
              <Stack spacing={1} sx={{ mt: 1.5 }}>
                <Typography variant='subtitle2'>Analysis (structured)</Typography>
                <Paper variant='outlined' sx={{ p: 1.5 }}>
                  <Typography color='text.secondary'>
                    Model: {triage.version || '-'} | Requires engineering: {triage.requires_engineering ? 'yes' : 'no'}
                  </Typography>
                  <Typography sx={{ mt: 1 }}>
                    Top candidates:{' '}
                    {topCandidates
                      .map(candidate => `${candidate.category} (${candidate.relative_likelihood})`)
                      .join(' | ') || '-'}
                  </Typography>
                  <Typography sx={{ mt: 1 }}>
                    Likely causes: {likelyCauses.length ? likelyCauses.join(' | ') : '-'}
                  </Typography>
                  <Typography sx={{ mt: 1 }}>
                    Next steps: {nextActions.length ? nextActions.join(' | ') : '-'}
                  </Typography>
                  <Typography sx={{ mt: 1 }}>
                    Escalation checklist: {escalationChecklist.length ? escalationChecklist.join(' | ') : '-'}
                  </Typography>
                </Paper>
              </Stack>
            )}
            {packet?.has_screenshot && packetId && (
              <Typography sx={{ mt: 1 }}>
                Screenshot:{' '}
                <a href={`/api/packets/${packetId}/screenshot`} target='_blank' rel='noopener noreferrer'>
                  view
                </a>
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Paper variant='outlined' sx={{ p: 2.5 }}>
            <Typography variant='h6' sx={{ mb: 1.5 }}>
              Agent Actions
            </Typography>
            <TextField
              select
              label='Suggested macro'
              fullWidth
              value={selectedMacroId}
              onChange={event => setSelectedMacroId(event.target.value)}
              disabled={!hasPacket || !macros.length || loading}
            >
              {!macros.length && <MenuItem value=''>No macros available</MenuItem>}
              {macros.map(item => (
                <MenuItem key={item.id} value={item.id}>
                  {item.title}
                </MenuItem>
              ))}
            </TextField>

            <Stack spacing={1} sx={{ mt: 1.5 }}>
              <Button
                variant='outlined'
                disabled={!selectedMacroId || loading}
                onClick={() => {
                  handleInsertMacro(true)
                }}
              >
                Insert Public Macro
              </Button>
              <Button
                variant='outlined'
                disabled={!selectedMacroId || loading}
                onClick={() => {
                  handleInsertMacro(false)
                }}
              >
                Insert Internal Macro
              </Button>
            </Stack>

            {activeMacro && (
              <Paper variant='outlined' sx={{ p: 1.5, mt: 1.5 }}>
                <Typography variant='subtitle2' sx={{ mb: 0.5 }}>
                  Macro preview
                </Typography>
                <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                  {activeMacro.body_public || activeMacro.body_internal}
                </Typography>
              </Paper>
            )}

            <Divider sx={{ my: 1.5 }} />
            <TextField
              label='Escalation note'
              fullWidth
              multiline
              minRows={3}
              value={escalationNote}
              onChange={event => setEscalationNote(event.target.value)}
            />
            <Button
              sx={{ mt: 1.5 }}
              variant='contained'
              color='warning'
              disabled={loading || !escalationNote.trim() || !ticketId.trim()}
              onClick={handleEscalate}
            >
              Escalate to Engineering
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  )
}

export default TicketsPage
