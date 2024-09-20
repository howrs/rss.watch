import { db } from "prisma/db"

export type Param = {
  version: number
  guildId: string
  args: any
}

export const putChannel = ({ guildId, version, args }: Param) => {
  const { prisma } = db

  return [
    prisma.channel.upsert({
      where: {
        id: args.id,
      },
      create: {
        id: args.id,
        type: args.type,
        name: args.name,
        parentId: args.parentId,
        position: args.position,
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
