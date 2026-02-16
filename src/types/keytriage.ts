export type PacketStatus = 'pending' | 'completed' | 'expired' | 'none'

export type TriageCandidate = {
  category: string
  score: number
  relative_likelihood: number
  signals: string[]
}

export type TriageSignal = {
  category: string
  signal: string
  weight: number
}

export type TriageAnalysis = {
  version: string
  classification_type: string
  category: string
  confidence: number
  requires_engineering: boolean
  top_candidates: TriageCandidate[]
  signals: TriageSignal[]
  likely_causes: string[]
  recommended_next_actions: string[]
  escalation_checklist: string[]
  disclaimer: string
}

export type TenantSettings = {
  id: string
  name: string
  slug: string
  status: string
  retention_days: number
  screenshot_enabled: boolean
  token_expires_seconds: number
  auto_post_public: boolean
  ticket_tagging_enabled: boolean
  created_at: string
  updated_at: string
}

export type ZendeskConnectionStatus = {
  connected: boolean
  subdomain?: string
  token_expires_at?: string
}

export type PublicPacketStatusResponse = {
  packet_id: string
  status: PacketStatus
  expires_at: string
  completed_at: string | null
}

export type PacketSubmitRequest = {
  consent: boolean
  answers?: {
    intent?: string
    symptom?: string
    prompt_behavior?: string
    passkey_exists?: string
    same_device_as_enrollment?: string
    account_match?: string
    used_cross_device?: string
    cross_device_step?: string
    network_context?: string
    managed_device?: string
    login_url?: string
    [key: string]: unknown
  }
  environment?: {
    os?: string
    browser?: string
    device?: string
  }
  capability?: {
    webauthn_supported?: boolean
    platform_authenticator_available?: boolean
    cross_device_available?: boolean
  }
  error_message?: string
}

export type PacketSubmitResponse = {
  success: boolean
  packet_id: string
  status: PacketStatus
  failure_category: string | null
  confidence: number | null
  triage?: TriageAnalysis
  summary: string
  zendesk_attached?: boolean
  zendesk_attach_error?: string | null
}

export type LatestPacketStatus = {
  status: PacketStatus | string
  packet_id?: string
  summary?: string
  failure_category?: string | null
  confidence?: number | null
  triage?: TriageAnalysis
  expires_at?: string
  has_screenshot?: boolean
}

export type SendDebugLinkResponse = {
  packet_id: string
  debug_link_url: string
  status: string
  expires_at: string
}

export type MacroTemplate = {
  id: string
  title: string
  body_public: string
  body_internal: string
}

export type AnalyticsOverview = {
  packets_sent: number
  packets_completed: number
  escalated: number
  avg_ttr_seconds: number
  escalation_rate: number
}

export type AnalyticsCategory = {
  category: string
  count: number
}

export type AnalyticsPlatform = {
  platform: string
  count: number
}

export type AnalyticsTicket = {
  zendesk_ticket_id: string
  created_at: string
  completed_at: string | null
  failure_category: string | null
}

export type AnalyticsTTR = {
  category: string
  avg_ttr_seconds: number
  count: number
}
