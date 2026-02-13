import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'

import { fetchTenantApi } from '@/lib/serverTenantApi'
import LogoutButton from '@/components/dashboard/LogoutButton'
import type {
  AnalyticsCategory,
  AnalyticsOverview,
  AnalyticsPlatform,
  AnalyticsTicket,
  AnalyticsTTR
} from '@/types/keytriage'

export const dynamic = 'force-dynamic'

type ZendeskConnectionStatus = {
  connected: boolean
  subdomain?: string
  token_expires_at?: string
}

type LatestPacketStatus = {
  status: string
  packet_id?: string
  has_screenshot?: boolean
}

const formatSeconds = (seconds: number) => {
  if (seconds <= 0) return '0s'

  const rounded = Math.round(seconds)
  const minutes = Math.floor(rounded / 60)
  const remainingSeconds = rounded % 60

  if (!minutes) return `${remainingSeconds}s`
  if (!remainingSeconds) return `${minutes}m`

  return `${minutes}m ${remainingSeconds}s`
}

const formatDate = (value: string | null) => {
  if (!value) return '-'

  return new Date(value).toLocaleString()
}

const DashboardPage = async () => {
  const now = new Date()
  const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const range = `?from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(now.toISOString())}`

  let loadError = ''
  let overview: AnalyticsOverview | null = null
  let categories: AnalyticsCategory[] = []
  let platforms: AnalyticsPlatform[] = []
  let tickets: AnalyticsTicket[] = []
  let ttr: AnalyticsTTR[] = []
  let zendeskConnection: ZendeskConnectionStatus = { connected: false }
  let latestPacketByTicket: Record<string, LatestPacketStatus> = {}

  try {
    const [overviewPayload, categoriesPayload, platformsPayload, ticketsPayload, ttrPayload, zendeskPayload] =
      await Promise.all([
        fetchTenantApi<AnalyticsOverview>(`/api/v1/analytics/overview${range}`),
        fetchTenantApi<AnalyticsCategory[]>(`/api/v1/analytics/categories${range}`),
        fetchTenantApi<AnalyticsPlatform[]>(`/api/v1/analytics/platforms${range}`),
        fetchTenantApi<AnalyticsTicket[]>(`/api/v1/analytics/tickets${range}`),
        fetchTenantApi<AnalyticsTTR[]>(`/api/v1/analytics/ttr${range}`),
        fetchTenantApi<ZendeskConnectionStatus>('/api/v1/zendesk/connection')
      ])

    overview = overviewPayload
    categories = categoriesPayload
    platforms = platformsPayload
    tickets = ticketsPayload
    ttr = ttrPayload
    zendeskConnection = zendeskPayload

    const recentTicketIds = [...new Set(ticketsPayload.slice(0, 12).map(row => row.zendesk_ticket_id))]

    const latestPacketRows = await Promise.all(
      recentTicketIds.map(async ticketId => {
        try {
          const payload = await fetchTenantApi<LatestPacketStatus>(`/api/v1/tickets/${ticketId}/packets/latest`)

          return [ticketId, payload] as const
        } catch {
          return [ticketId, { status: 'unknown' }] as const
        }
      })
    )

    latestPacketByTicket = Object.fromEntries(latestPacketRows)
  } catch (error) {
    loadError = (error as Error).message
  }

  return (
    <Stack spacing={4}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent='space-between'
        spacing={2}
      >
        <Box>
          <Typography variant='h4'>KeyTriage Dashboard</Typography>
          <Typography color='text.secondary'>Last 30 days overview</Typography>
        </Box>
        <LogoutButton />
      </Stack>

      {loadError && (
        <Alert severity='error'>
          {loadError}
          <br />
          Sign in first, and ensure `NEXT_PUBLIC_API_BASE_URL` is set correctly.
        </Alert>
      )}

      <Paper variant='outlined' sx={{ p: 2.5 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'flex-start', md: 'center' }}>
          <Typography variant='subtitle1'>Zendesk connection</Typography>
          <Chip
            label={zendeskConnection.connected ? 'Connected' : 'Not connected'}
            color={zendeskConnection.connected ? 'success' : 'default'}
            size='small'
          />
          {zendeskConnection.subdomain && (
            <Typography color='text.secondary'>{zendeskConnection.subdomain}.zendesk.com</Typography>
          )}
          {zendeskConnection.token_expires_at && (
            <Typography color='text.secondary'>
              Token expires: {formatDate(zendeskConnection.token_expires_at)}
            </Typography>
          )}
        </Stack>
      </Paper>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card variant='outlined'>
            <CardContent>
              <Typography color='text.secondary'>Packets sent</Typography>
              <Typography variant='h4'>{overview ? overview.packets_sent : '-'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card variant='outlined'>
            <CardContent>
              <Typography color='text.secondary'>Packets completed</Typography>
              <Typography variant='h4'>{overview ? overview.packets_completed : '-'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card variant='outlined'>
            <CardContent>
              <Typography color='text.secondary'>Escalated</Typography>
              <Typography variant='h4'>{overview ? overview.escalated : '-'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card variant='outlined'>
            <CardContent>
              <Typography color='text.secondary'>Avg TTR</Typography>
              <Typography variant='h4'>{overview ? formatSeconds(overview.avg_ttr_seconds) : '-'}</Typography>
              <Typography color='text.secondary' sx={{ mt: 0.5 }}>
                Escalation rate: {overview ? `${(overview.escalation_rate * 100).toFixed(1)}%` : '-'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant='outlined' sx={{ p: 2.5 }}>
            <Typography variant='h6'>Top failure categories</Typography>
            <Divider sx={{ my: 1.5 }} />
            <Stack spacing={1.25}>
              {categories.length ? (
                categories.map(row => (
                  <Stack key={row.category} direction='row' justifyContent='space-between'>
                    <Typography>{row.category}</Typography>
                    <Chip label={row.count} size='small' />
                  </Stack>
                ))
              ) : (
                <Typography color='text.secondary'>No category data yet.</Typography>
              )}
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant='outlined' sx={{ p: 2.5 }}>
            <Typography variant='h6'>Platform breakdown</Typography>
            <Divider sx={{ my: 1.5 }} />
            <Stack spacing={1.25}>
              {platforms.length ? (
                platforms.map(row => (
                  <Stack key={row.platform} direction='row' justifyContent='space-between'>
                    <Typography>{row.platform}</Typography>
                    <Chip label={row.count} size='small' />
                  </Stack>
                ))
              ) : (
                <Typography color='text.secondary'>No platform data yet.</Typography>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper variant='outlined' sx={{ p: 2.5 }}>
            <Typography variant='h6'>TTR by category</Typography>
            <Divider sx={{ my: 1.5 }} />
            <Stack spacing={1.25}>
              {ttr.length ? (
                ttr.map(row => (
                  <Stack key={row.category} direction='row' justifyContent='space-between' alignItems='center'>
                    <Typography>{row.category}</Typography>
                    <Typography color='text.secondary'>
                      {formatSeconds(row.avg_ttr_seconds)} ({row.count})
                    </Typography>
                  </Stack>
                ))
              ) : (
                <Typography color='text.secondary'>No resolved ticket events yet.</Typography>
              )}
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper variant='outlined' sx={{ p: 2.5 }}>
            <Typography variant='h6'>Recent packets</Typography>
            <Divider sx={{ my: 1.5 }} />
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>Ticket</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Completed</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Screenshot</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tickets.slice(0, 12).map(row => {
                  const latest = latestPacketByTicket[row.zendesk_ticket_id]
                  const hasScreenshot = Boolean(latest?.has_screenshot && latest?.packet_id)
                  const screenshotHref = latest?.packet_id ? `/api/packets/${latest.packet_id}/screenshot` : '#'

                  return (
                    <TableRow key={`${row.zendesk_ticket_id}-${row.created_at}`}>
                      <TableCell>{row.zendesk_ticket_id}</TableCell>
                      <TableCell>{formatDate(row.created_at)}</TableCell>
                      <TableCell>{formatDate(row.completed_at)}</TableCell>
                      <TableCell>{row.failure_category || '-'}</TableCell>
                      <TableCell>
                        {hasScreenshot ? (
                          <Typography
                            component='a'
                            href={screenshotHref}
                            target='_blank'
                            rel='noopener noreferrer'
                            color='primary.main'
                          >
                            View
                          </Typography>
                        ) : (
                          <Typography color='text.secondary'>-</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
                {!tickets.length && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography color='text.secondary'>No packets yet.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  )
}

export default DashboardPage
