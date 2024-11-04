import { createWebhook } from "@/app/a/[[...route]]/fns/createWebhook"
import { getWebhooks } from "@/app/a/[[...route]]/fns/getWebhooks"
import { uuid } from "@/utils/ids"
import type { Guild, Prisma } from "@prisma/client"
import { db } from "prisma/db"

export type MutatorDefaultParams = {
  version: number
  guild: Guild
}

type Param = MutatorDefaultParams & {
  args: Omit<Prisma.ChannelUncheckedCreateInput, "guildId">
}

export const putChannel = async ({ guild, version, args }: Param) => {
  const { prisma } = db
  const guildId = guild.id

  const webhook =
    args.type === 0
      ? await (async () => {
          const webhooks = await getWebhooks(guild.discordId)

          const webhook = webhooks.find(
            (webhook) => webhook.channel_id === args.discordId,
          )

          return webhook ? webhook : await createWebhook(args.discordId)
        })()
      : null

  return [
    prisma.channel.upsert({
      where: {
        discordId: args.discordId,
        guildId,
      },
      create: {
        id: args.id,
        type: args.type,
        name: args.name,
        parentId: args.parentId,
        position: args.position,
        discordId: args.discordId,
        guildId,
        version,
        ...(webhook
          ? {
              Webhook: {
                create: {
                  id: uuid(),
                  url: webhook.url,
                  guildId,
                  version,
                },
              },
            }
          : {}),
      },
      update: {
        type: args.type,
        name: args.name,
        parentId: args.parentId,
        position: args.position,
        deleted: false,
        version,
        ...(webhook
          ? {
              Webhook: {
                upsert: {
                  create: {
                    id: uuid(),
                    url: webhook.url,
                    guildId,
                    version,
                  },
                  update: {
                    url: webhook.url,
                    version,
                  },
                },
              },
            }
          : {}),
      },
    }),
  ]
}
