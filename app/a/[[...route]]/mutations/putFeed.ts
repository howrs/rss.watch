import type { Prisma } from "@prisma/client"
import { db } from "prisma/db"

export type Param = {
  version: number
  guildId: string
  args: Omit<Prisma.FeedUncheckedCreateInput, "guildId">
}

export const putFeed = ({ guildId, version, args }: Param) => {
  const { prisma } = db

  return [
    prisma.feed.upsert({
      where: {
        id: args.id,
      },
      create: {
        id: args.id,
        type: args.type,
        position: args.position,
        channelId: args.channelId,
        value: args.value,
        faviconUrl: args.faviconUrl,
        xmlUrl: args.xmlUrl,
        guildId,
        version,
      },
      update: {
        type: args.type,
        position: args.position,
        channelId: args.channelId,
        value: args.value,
        faviconUrl: args.faviconUrl,
        xmlUrl: args.xmlUrl,
        deleted: false,
        version,
      },
    }),
  ]
}
