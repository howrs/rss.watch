import "server-only"

import type { Webhook } from "@/app/a/[[...route]]/fns/createWebhook"
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
