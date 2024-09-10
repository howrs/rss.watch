import { REDIRECT_PATH } from "constants/urls"
import { headers } from "next/headers"

const CLIENT_SECRET = `ETIw0Ub_yNcbiuvD23CLv6IMlUpjEben`
const CLIENT_ID = `1280201575712948325`

export const getOAuth2Token = async (code: string) => {
  const host = headers().get("Host")
  const origin = headers().get("Origin")
  const BASE_URL =
    !!host && host.includes("localhost") ? `http://${host}` : origin

  if (!BASE_URL) {
    throw new Error("BASE_URL not found")
  }

  const data = await fetch(`https://discord.com/api/v10/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: `${BASE_URL}${REDIRECT_PATH}`,
    }),
  }).then<R>((r) => r.json())

  return data
}

export interface R {
  token_type: string
  access_token: string
  expires_in: number
  refresh_token: string
  scope: string
  guild: Guild
}

export interface Guild {
  id: string
  name: string
  icon: null
  description: null
  home_header: null
  splash: null
  discovery_splash: null
  features: any[]
  emojis: any[]
  stickers: any[]
  banner: null
  owner_id: string
  application_id: null
  region: string
  afk_channel_id: null
  afk_timeout: number
  system_channel_id: string
  widget_enabled: boolean
  widget_channel_id: null
  verification_level: number
  roles: Role[]
  default_message_notifications: number
  mfa_level: number
  explicit_content_filter: number
  max_presences: null
  max_members: number
  max_stage_video_channel_users: number
  max_video_channel_users: number
  vanity_url_code: null
  premium_tier: number
  premium_subscription_count: number
  system_channel_flags: number
  preferred_locale: string
  rules_channel_id: null
  safety_alerts_channel_id: null
  public_updates_channel_id: null
  hub_type: null
  premium_progress_bar_enabled: boolean
  latest_onboarding_question_id: null
  incidents_data: null
  inventory_settings: null
  nsfw: boolean
  nsfw_level: number
}

export interface Role {
  id: string
  name: string
  description: null
  permissions: string
  position: number
  color: number
  hoist: boolean
  managed: boolean
  mentionable: boolean
  icon: null
  unicode_emoji: null
  flags: number
  tags?: Tags
}

export interface Tags {
  bot_id: string
}
