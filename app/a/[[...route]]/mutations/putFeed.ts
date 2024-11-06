import type { MutatorDefaultParams } from "@/app/a/[[...route]]/mutations/putChannel"
import type { Prisma } from "@prisma/client"
import { db } from "prisma/db"

export type Param = {
  args: Omit<Prisma.FeedUncheckedCreateInput, "guildId">
} & MutatorDefaultParams

export const putFeed = async ({
  guild,
  version,
  args: { id, ...args },
}: Param) => {
  const guildId = guild.id
  const { prisma } = db

  return [
    prisma.feed.upsert({
      where: {
        id,
        guildId,
      },
      create: {
        id,
        ...args,
        // type: args.type,
        // order: args.order,
        // channelId: args.channelId,
        // value: args.value,
        // faviconUrl: args.faviconUrl,
        // xmlUrl: args.xmlUrl,
        // enabled: args.enabled,
        guildId,
        version,
      },
      update: {
        ...args,
        // type: args.type,
        // order: args.order,
        // channelId: args.channelId,
        // value: args.value,
        // faviconUrl: args.faviconUrl,
        // xmlUrl: args.xmlUrl,
        // enabled: args.enabled,
        deleted: false,
        version,
      },
    }),
  ]
}
