import { env } from "@/lib/env"
import { APP_NAME } from "constants/urls"

export const createWebhook = async (channelId: string): Promise<Webhook> => {
  const res = await fetch(
    `https://discord.com/api/v10/channels/${channelId}/webhooks`,
    {
      method: "POST",
      headers: {
        Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: APP_NAME,
      }),
    },
  )

  if (!res.ok) {
    throw new Error(`Failed to create webhook: ${res.status} ${res.statusText}`)
  }

  const data = await res.json<Webhook>()

  console.log(data)

  return data
}

export interface Webhook {
  application_id: string | null
  avatar: string | null
  channel_id: string
  guild_id: string
  id: string
  name: string
  type: number
  user: User
  token?: string
  url: string
}

export interface User {
  id: string
  username: string
  avatar: string
  discriminator: string
  public_flags: number
  premium_type: number
  flags: number
  banner: string | null
  accent_color: string | null
  global_name: string
  avatar_decoration_data: string | null
  banner_color: string | null
}
