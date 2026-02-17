const client = ZAFClient.init()

const TOKEN_STORAGE_PREFIX = 'keytriage_user_token:'

const APP_MODE_ENABLED = 'enabled'
const APP_MODE_DEMO = 'demo'
const APP_MODE_DISABLED = 'disabled'

const state = {
  settings: null,
  ticketId: null,
  requesterEmail: null,
  subdomain: null,
  userToken: null,
  packet: null,
  loading: false,
  authenticated: false,
  appMode: APP_MODE_ENABLED
}

const el = {
  ticketContext: document.getElementById('ticketContext'),
  statusChip: document.getElementById('packetStatusChip'),
  aiStatusChip: document.getElementById('aiStatusChip'),
  aiMeta: document.getElementById('aiMeta'),
  aiSummary: document.getElementById('aiSummary'),
  rerunAi: document.getElementById('rerunAi'),
  packetMeta: document.getElementById('packetMeta'),
  packetSummary: document.getElementById('packetSummary'),
  screenshotWrap: document.getElementById('screenshotWrap'),
  screenshotLink: document.getElementById('screenshotLink'),
  macroSelect: document.getElementById('macroSelect'),
  sendLink: document.getElementById('sendLink'),
  refreshStatus: document.getElementById('refreshStatus'),
  insertMacro: document.getElementById('insertMacro'),
  addInternal: document.getElementById('addInternal'),
  escalationNote: document.getElementById('escalationNote'),
  escalate: document.getElementById('escalate'),
  connectZendeskAuth: document.getElementById('connectZendeskAuth'),
  authStatus: document.getElementById('authStatus'),
  dashboardLink: document.getElementById('dashboardLink'),
  appError: document.getElementById('appError'),
  modeBanner: document.getElementById('modeBanner')
}

const normalizeBaseUrl = value => (value || '').replace(/\/+$/, '')

const parseAppMode = rawValue => {
  const value = String(rawValue || APP_MODE_ENABLED).trim().toLowerCase()
  if (value === APP_MODE_DEMO) return APP_MODE_DEMO
  if (value === APP_MODE_DISABLED) return APP_MODE_DISABLED
  return APP_MODE_ENABLED
}

const enforceTenantStatusMode = tenantStatus => {
  if (!tenantStatus) return
  if (String(tenantStatus).toLowerCase() === 'active') return

  state.appMode = APP_MODE_DISABLED
  applyModeUi()
}

const getTokenStorageKey = () => `${TOKEN_STORAGE_PREFIX}${state.subdomain || 'default'}`

const getStoredToken = () => {
  try {
    return window.localStorage.getItem(getTokenStorageKey()) || ''
  } catch (_error) {
    return ''
  }
}

const setStoredToken = token => {
  try {
    window.localStorage.setItem(getTokenStorageKey(), token)
  } catch (_error) {
    // ignore storage failures
  }
}

const clearStoredToken = () => {
  try {
    window.localStorage.removeItem(getTokenStorageKey())
  } catch (_error) {
    // ignore storage failures
  }
}

const hasWriteAccess = () => state.authenticated && state.appMode === APP_MODE_ENABLED
const hasReadAccess = () => state.authenticated && state.appMode !== APP_MODE_DISABLED

const setModeBanner = message => {
  if (!message) {
    el.modeBanner.classList.add('hidden')
    el.modeBanner.textContent = ''
    return
  }

  el.modeBanner.textContent = message
  el.modeBanner.classList.remove('hidden')
}

const setAuthStatus = (connected, email) => {
  if (connected) {
    el.authStatus.textContent = `Connected${email ? ` (${email})` : ''}`
    el.connectZendeskAuth.textContent = 'Reconnect'
    return
  }

  el.authStatus.textContent = 'Not connected'
  el.connectZendeskAuth.textContent = 'Connect Zendesk'
}

const setError = message => {
  if (!message) {
    el.appError.classList.add('hidden')
    el.appError.textContent = ''
    return
  }

  el.appError.textContent = message
  el.appError.classList.remove('hidden')
}

const applyControlState = () => {
  const canRead = hasReadAccess()
  const canWrite = hasWriteAccess()
  const escalationNoteReady = Boolean((el.escalationNote.value || '').trim())
  const canRerunAi = canWrite && state.packet && state.packet.packet_id && String(state.packet.status || '').toLowerCase() === 'completed'

  el.connectZendeskAuth.disabled = state.loading || state.appMode === APP_MODE_DISABLED
  el.refreshStatus.disabled = state.loading || !canRead
  el.sendLink.disabled = state.loading || !canWrite || !state.ticketId
  el.rerunAi.disabled = state.loading || !canRerunAi
  el.insertMacro.disabled = state.loading || !canWrite || !state.packet || !state.packet.packet_id
  el.addInternal.disabled = state.loading || !canWrite || !state.packet || !state.packet.packet_id
  el.escalate.disabled = state.loading || !canWrite || !state.ticketId || !escalationNoteReady
}

const setLoading = isLoading => {
  state.loading = isLoading
  applyControlState()
}

const setStatusChip = status => {
  const next = (status || 'unknown').toLowerCase()
  el.statusChip.textContent = next
  el.statusChip.className = 'chip'

  if (next === 'completed') {
    el.statusChip.classList.add('chip-completed')
  } else if (next === 'expired') {
    el.statusChip.classList.add('chip-expired')
  } else if (next === 'pending') {
    el.statusChip.classList.add('chip-pending')
  } else {
    el.statusChip.classList.add('chip-default')
  }
}

const setAiStatusChip = status => {
  const next = (status || 'not_started').toLowerCase()
  el.aiStatusChip.textContent = next
  el.aiStatusChip.className = 'chip'

  if (next === 'succeeded') {
    el.aiStatusChip.classList.add('chip-completed')
  } else if (next === 'pending') {
    el.aiStatusChip.classList.add('chip-pending')
  } else if (next === 'failed') {
    el.aiStatusChip.classList.add('chip-failed')
  } else {
    el.aiStatusChip.classList.add('chip-default')
  }
}

const notify = (message, kind = 'notice') => {
  client.invoke('notify', message, kind, 4000)
}

const parseBody = response => {
  if (typeof response === 'string') {
    try {
      return JSON.parse(response)
    } catch (_error) {
      return { detail: response }
    }
  }

  return response || {}
}

const requestApi = async (path, options = {}) => {
  const settings = state.settings

  if (!settings || !settings.apiBaseUrl) {
    throw new Error('Missing apiBaseUrl in app settings.')
  }

  const method = options.method || 'GET'
  const url = `${normalizeBaseUrl(settings.apiBaseUrl)}${path}`
  const headers = Object.assign({}, options.headers || {})
  const request = {
    url,
    type: method,
    headers,
    httpCompleteResponse: true
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`
  }

  if (options.data !== undefined) {
    request.data = options.data
    headers['Content-Type'] = headers['Content-Type'] || 'application/json'
  }

  let response
  try {
    response = await client.request(request)
  } catch (error) {
    const detail = error && error.responseText ? error.responseText : error.message
    throw new Error(detail || 'Network request failed.')
  }

  const status = response.status
  const body = parseBody(response.responseJSON || response.responseText || response.response)

  if (status < 200 || status >= 300) {
    const detail = body.detail || `API request failed (${status}).`
    const failure = new Error(detail)
    failure.status = status
    throw failure
  }

  return body
}

const apiRequest = async (path, options = {}) => {
  if (!state.userToken) {
    throw new Error('Connect Zendesk first.')
  }

  try {
    return await requestApi(path, { ...options, token: state.userToken })
  } catch (error) {
    if (error.status === 401) {
      state.userToken = null
      state.authenticated = false
      clearStoredToken()
      setAuthStatus(false)
      applyControlState()
      throw new Error('Session expired. Click Connect Zendesk and try again.')
    }
    throw error
  }
}

const inferSubdomainFromHost = () => {
  const host = window.location.hostname || ''
  const match = host.match(/^([a-z0-9-]+)\.zendesk\.com$/i)
  return match ? match[1].toLowerCase() : ''
}

const resolveSubdomain = async () => {
  const fromSettings = (state.settings.zendeskSubdomain || '').trim().toLowerCase()
  if (fromSettings) return fromSettings

  try {
    const data = await client.get('account.subdomain')
    const value = (data['account.subdomain'] || '').trim().toLowerCase()
    if (value) return value
  } catch (_error) {
    // continue fallback chain
  }

  try {
    const context = await client.context()
    const value = ((context.account && context.account.subdomain) || '').trim().toLowerCase()
    if (value) return value
  } catch (_error) {
    // continue fallback chain
  }

  const fromHost = inferSubdomainFromHost()
  if (fromHost) return fromHost

  throw new Error('Unable to resolve Zendesk subdomain. Set zendeskSubdomain in app settings.')
}

const verifySession = async () => {
  if (!state.userToken) {
    state.authenticated = false
    setAuthStatus(false)
    applyControlState()
    return false
  }

  try {
    const payload = await requestApi('/api/v1/auth/session', { token: state.userToken })
    const email = payload.user && payload.user.email ? payload.user.email : ''
    const tenantStatus = payload.tenant && payload.tenant.status ? payload.tenant.status : ''

    enforceTenantStatusMode(tenantStatus)

    state.authenticated = true
    setAuthStatus(true, email)
    applyControlState()
    return true
  } catch (_error) {
    state.userToken = null
    state.authenticated = false
    clearStoredToken()
    setAuthStatus(false)
    applyControlState()
    return false
  }
}

const sleep = ms => new Promise(resolve => window.setTimeout(resolve, ms))

const pollZendeskFlowToken = async flowId => {
  const timeoutAt = Date.now() + 90000

  while (Date.now() < timeoutAt) {
    const payload = await requestApi(`/api/v1/auth/zendesk/flow_status?flow_id=${encodeURIComponent(flowId)}`)
    const flowStatus = (payload.status || '').toLowerCase()
    const token = (payload.token || '').trim()

    if (flowStatus === 'completed' && token) {
      return token
    }

    if (flowStatus === 'failed' || flowStatus === 'expired') {
      throw new Error(payload.detail || 'Zendesk authentication did not complete.')
    }

    await sleep(1200)
  }

  throw new Error('Zendesk authentication confirmation timed out. Please try again.')
}

const startZendeskAuth = async () => {
  // Open synchronously from click path to avoid popup blockers in iframe contexts.
  const popup = window.open('about:blank', 'keytriage_zendesk_auth', 'width=560,height=760')
  if (!popup) {
    throw new Error('Popup blocked. Allow popups and try again.')
  }

  try {
    try {
      popup.document.title = 'KeyTriage'
      popup.document.body.innerHTML = '<p style="font-family: system-ui; padding: 16px;">Connecting to Zendesk...</p>'
    } catch (_error) {
      // Ignore popup placeholder rendering issues.
    }

    const postOrigin = (window.location.origin || '').trim()
    const query = new URLSearchParams({
      subdomain: state.subdomain,
      mode: 'popup'
    })
    if (postOrigin) {
      query.set('post_origin', postOrigin)
    }
    const payload = await requestApi(`/api/v1/auth/zendesk/start?${query.toString()}`)
    const redirectUrl = payload.redirect_url
    const flowId = (payload.flow_id || '').trim()

    if (!redirectUrl) {
      throw new Error('Missing redirect URL from auth start endpoint.')
    }
    if (!flowId) {
      throw new Error('Missing flow ID from auth start endpoint.')
    }

    popup.location.href = redirectUrl

    const token = await pollZendeskFlowToken(flowId)

    if (!token) {
      throw new Error('Authentication did not return a user token.')
    }

    state.userToken = token
    setStoredToken(token)

    const verified = await verifySession()
    if (!verified) {
      throw new Error('Unable to verify authenticated session.')
    }
  } catch (error) {
    if (!popup.closed) {
      popup.close()
    }
    throw error
  }
}

const loadTicketContext = async () => {
  const data = await client.get(['ticket.id', 'ticket.requester.email'])
  state.ticketId = String(data['ticket.id'])
  state.requesterEmail = data['ticket.requester.email'] || 'Unknown requester'
  el.ticketContext.textContent = `Ticket #${state.ticketId} - ${state.requesterEmail}`
}

const setNoPacketState = message => {
  setStatusChip('none')
  el.packetMeta.textContent = message || 'No packet sent yet.'
  el.packetSummary.textContent = 'No packet yet.'
  el.screenshotWrap.classList.add('hidden')
  el.macroSelect.innerHTML = '<option value="">No macro available</option>'
  setAiStatusChip('not_started')
  el.aiMeta.textContent = 'No AI result yet.'
  el.aiSummary.textContent = 'AI summary will appear after packet completion.'
  state.packet = null
  applyControlState()
}

const renderAI = packet => {
  const ai = packet && packet.ai ? packet.ai : null
  if (!ai || !ai.run) {
    setAiStatusChip(ai && ai.status ? ai.status : 'not_started')
    el.aiMeta.textContent = 'No AI result yet.'
    el.aiSummary.textContent = 'AI summary will appear after packet completion.'
    return
  }

  const run = ai.run
  const output = run.output_json || {}
  const category = output.category || 'unknown'
  const confidence = typeof output.confidence === 'number' ? ` (${Math.round(output.confidence * 100)}%)` : ''
  const summaryBullets = Array.isArray(output.summary_bullets) ? output.summary_bullets : []
  const steps = Array.isArray(output.recommended_next_steps) ? output.recommended_next_steps : []
  const publicDraft = output.public_reply_draft || ''
  const internalDraft = output.internal_note_draft || ''

  setAiStatusChip(ai.status || run.status)
  el.aiMeta.textContent = `Category: ${category}${confidence} - Model: ${run.model_name || 'n/a'}`

  const lines = []
  if (summaryBullets.length) {
    lines.push('Summary:')
    summaryBullets.forEach(item => lines.push(`- ${item}`))
  }
  if (steps.length) {
    lines.push('')
    lines.push('Recommended next steps:')
    steps.forEach(item => lines.push(`- ${item}`))
  }
  if (publicDraft) {
    lines.push('')
    lines.push('Public reply draft:')
    lines.push(publicDraft)
  }
  if (internalDraft) {
    lines.push('')
    lines.push('Internal note draft:')
    lines.push(internalDraft)
  }
  el.aiSummary.textContent = lines.join('\n') || 'AI run exists but no structured content returned.'
}

const renderPacket = packet => {
  state.packet = packet
  setStatusChip(packet.status)

  if (packet.status === 'none') {
    setNoPacketState('No packet sent yet.')
    return
  }

  el.packetMeta.textContent = `Packet ID: ${packet.packet_id || 'n/a'} - Expires: ${packet.expires_at || 'n/a'}`
  el.packetSummary.textContent = packet.summary || 'No summary yet.'

  const canShowScreenshot = Boolean(packet.has_screenshot && packet.packet_id && state.settings.appBaseUrl)
  if (canShowScreenshot) {
    const screenshotUrl = `${normalizeBaseUrl(state.settings.appBaseUrl)}/api/packets/${packet.packet_id}/screenshot`
    el.screenshotLink.href = screenshotUrl
    el.screenshotWrap.classList.remove('hidden')
  } else {
    el.screenshotWrap.classList.add('hidden')
  }

  renderAI(packet)
  applyControlState()
}

const loadMacros = async packet => {
  if (!packet || !packet.packet_id || !hasReadAccess()) {
    el.macroSelect.innerHTML = '<option value="">No macro available</option>'
    return
  }

  if ((packet.status || '').toLowerCase() !== 'completed') {
    el.macroSelect.innerHTML = '<option value="">Macros available after packet is completed</option>'
    return
  }

  const macros = await apiRequest(`/api/v1/packets/${packet.packet_id}/macros`)
  el.macroSelect.innerHTML = ''

  if (!Array.isArray(macros) || macros.length === 0) {
    el.macroSelect.innerHTML = '<option value="">No macro available</option>'
    return
  }

  macros.forEach(item => {
    const option = document.createElement('option')
    option.value = item.id
    option.textContent = item.title
    el.macroSelect.appendChild(option)
  })
}

const refreshPacket = async () => {
  if (!state.ticketId || !hasReadAccess()) return

  const payload = await apiRequest(`/api/v1/tickets/${state.ticketId}/packets/latest`)
  renderPacket(payload)

  await loadMacros(payload)
  return payload
}

const sendDebugLink = async () => {
  if (!state.ticketId) return
  if (!hasWriteAccess()) {
    notify('Action disabled by workspace mode.', 'error')
    return
  }

  setLoading(true)
  setError('')

  try {
    await apiRequest(`/api/v1/tickets/${state.ticketId}/send_debug_link`, { method: 'POST' })
    notify('Debug link posted to ticket.', 'notice')
    await refreshPacket()
  } catch (error) {
    setError(error.message)
    notify(error.message, 'error')
  } finally {
    setLoading(false)
  }
}

const insertMacro = async publicReply => {
  if (!hasWriteAccess()) {
    notify('Action disabled by workspace mode.', 'error')
    return
  }

  const macroId = el.macroSelect.value
  if (!macroId) {
    notify('Select a macro first.', 'error')
    return
  }

  setLoading(true)
  setError('')

  try {
    await apiRequest(`/api/v1/tickets/${state.ticketId}/insert_macro?macro_id=${encodeURIComponent(macroId)}&public=${publicReply}`, {
      method: 'POST'
    })
    notify(publicReply ? 'Public macro reply inserted.' : 'Internal macro note inserted.', 'notice')
  } catch (error) {
    setError(error.message)
    notify(error.message, 'error')
  } finally {
    setLoading(false)
  }
}

const escalateTicket = async () => {
  if (!hasWriteAccess()) {
    notify('Action disabled by workspace mode.', 'error')
    return
  }

  const note = (el.escalationNote.value || '').trim()
  if (!note) {
    notify('Provide an escalation note first.', 'error')
    applyControlState()
    return
  }

  setLoading(true)
  setError('')

  try {
    await apiRequest(`/api/v1/tickets/${state.ticketId}/escalate?note=${encodeURIComponent(note)}`, { method: 'POST' })
    el.escalationNote.value = ''
    applyControlState()
    notify('Ticket escalated to engineering.', 'notice')
  } catch (error) {
    setError(error.message)
    notify(error.message, 'error')
  } finally {
    setLoading(false)
  }
}

const rerunAi = async () => {
  if (!hasWriteAccess()) {
    notify('Action disabled by workspace mode.', 'error')
    return
  }
  if (!state.packet || !state.packet.packet_id) {
    notify('No packet available for AI rerun.', 'error')
    return
  }

  setLoading(true)
  setError('')

  try {
    await apiRequest(`/api/v1/packets/${state.packet.packet_id}/ai/rerun`, { method: 'POST' })
    notify('AI rerun queued.', 'notice')
    await refreshPacket()
  } catch (error) {
    setError(error.message)
    notify(error.message, 'error')
  } finally {
    setLoading(false)
  }
}

const connectZendesk = async () => {
  if (state.appMode === APP_MODE_DISABLED) return

  setLoading(true)
  setError('')

  try {
    await startZendeskAuth()
    notify('Zendesk connected to KeyTriage.', 'notice')
    await refreshPacket()
  } catch (error) {
    setError(error.message)
    notify(error.message, 'error')
  } finally {
    setLoading(false)
  }
}

const bindEvents = () => {
  el.sendLink.addEventListener('click', sendDebugLink)
  el.refreshStatus.addEventListener('click', async () => {
    setLoading(true)
    setError('')
    try {
      await refreshPacket()
      notify('Packet refreshed.', 'notice')
    } catch (error) {
      setError(error.message)
      notify(error.message, 'error')
    } finally {
      setLoading(false)
    }
  })
  el.insertMacro.addEventListener('click', () => insertMacro(true))
  el.addInternal.addEventListener('click', () => insertMacro(false))
  el.escalate.addEventListener('click', escalateTicket)
  el.rerunAi.addEventListener('click', rerunAi)
  el.escalationNote.addEventListener('input', applyControlState)
  el.connectZendeskAuth.addEventListener('click', connectZendesk)
}

const validateSettings = () => {
  const settings = state.settings

  if (!settings.apiBaseUrl) {
    throw new Error('Missing required setting: apiBaseUrl.')
  }

  if (!settings.appBaseUrl) {
    throw new Error('Missing required setting: appBaseUrl.')
  }
}

const applyModeUi = () => {
  if (state.appMode === APP_MODE_DISABLED) {
    setModeBanner('KeyTriage is disabled for this workspace by admin.')
    setNoPacketState('App is disabled in workspace settings.')
    return
  }

  if (state.appMode === APP_MODE_DEMO) {
    setModeBanner('Demo mode enabled: read-only view. Ticket updates are disabled.')
    return
  }

  setModeBanner('')
}

const init = async () => {
  client.invoke('resize', { width: '100%', height: '760px' })
  setLoading(true)
  setError('')

  try {
    const metadata = await client.metadata()
    state.settings = metadata.settings || {}
    validateSettings()

    state.appMode = parseAppMode(state.settings.workspaceMode)
    applyModeUi()

    el.dashboardLink.href = `${normalizeBaseUrl(state.settings.appBaseUrl)}/app/dashboard`

    await loadTicketContext()
    bindEvents()

    if (state.appMode === APP_MODE_DISABLED) {
      state.authenticated = false
      setAuthStatus(false)
      applyControlState()
      return
    }

    state.subdomain = await resolveSubdomain()
    state.userToken = getStoredToken()

    const hasSession = await verifySession()
    if (hasSession) {
      await refreshPacket()
    } else {
      setNoPacketState('Connect Zendesk to start triaging this ticket.')
    }
  } catch (error) {
    setError(error.message)
    notify(error.message, 'error')
  } finally {
    setLoading(false)
  }
}

init()
