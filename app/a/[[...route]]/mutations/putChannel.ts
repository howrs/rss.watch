import type { Prisma } from "@prisma/client"
import { db } from "prisma/db"

type Param = {
  version: number
  guildId: string
  args: Omit<Prisma.ChannelUncheckedCreateInput, "guildId">
}

export const putChannel = ({ guildId, version, args }: Param) => {
  const { prisma } = db

  return [
    prisma.channel.upsert({
      where: {
        discordId: args.discordId,
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
      },
      update: {
        type: args.type,
        name: args.name,
        parentId: args.parentId,
        position: args.position,
        deleted: false,
        version,
      },
    }),
  ]
}
