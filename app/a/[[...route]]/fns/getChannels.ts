import "server-only"

import { env } from "@/lib/env"
import { isArray } from "@fxts/core"

export const getChannels = async (guild_id: string): Promise<Channel[]> => {
  const data = await fetch(
    `https://discord.com/api/v10/guilds/${guild_id}/channels`,
    {
      headers: { Authorization: `Bot ${env.DISCORD_BOT_TOKEN}` },
    },
  ).then<Channel[]>((r) => r.json())

  if (!isArray(data)) {
    console.error(data)
    throw new Error("Invalid response")
  }

  return data
}

export interface Channel {
  id: string
  type: number
  flags: number
  guild_id: string
  name: string
  parent_id: null | string
  position: number
  permission_overwrites: PermissionOverwrite[]
  last_message_id?: null | string
  rate_limit_per_user?: number
  topic?: null
  nsfw?: boolean
  bitrate?: number
  user_limit?: number
  rtc_region?: null
}

interface PermissionOverwrite {
  id: string
  type: number
  allow: string
  deny: string
}
