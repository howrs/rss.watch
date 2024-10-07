import "server-only"

import { env } from "@/lib/env"
import { isArray } from "@fxts/core"

export const getWebhooks = async (guild_id: string): Promise<Webhook[]> => {
  const data = await fetch(
    `https://discord.com/api/v10/guilds/${guild_id}/webhooks`,
    {
      headers: { Authorization: `Bot ${env.DISCORD_BOT_TOKEN}` },
    },
  ).then<Webhook[]>((r) => r.json())

  if (!isArray(data)) {
    console.error(data)
    throw new Error("Invalid response")
  }

  return data
}

export interface Webhook {
  application_id: string
  avatar: null
  channel_id: string
  guild_id: string
  id: string
  name: string
  type: number
  user: User
  token: string
  url: string
}

interface User {
  id: string
  username: string
  avatar: null
  discriminator: string
  public_flags: number
  flags: number
  bot: boolean
  banner: null
  accent_color: null
  global_name: null
  avatar_decoration_data: null
  banner_color: null
  clan: null
}
