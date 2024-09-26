import { db } from "prisma/db"

type Param = {
  version: number
  guildId: string
  args: string
}

export const delChannel = ({ guildId, version, args }: Param) => {
  const { prisma } = db

  return [
    prisma.channel.updateMany({
      where: {
        id: args.split("/")[1],
      },
      data: {
        deleted: true,
        version,
      },
    }),
  ]
}
