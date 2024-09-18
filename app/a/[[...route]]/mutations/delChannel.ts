import type { Param } from "@/app/a/[[...route]]/mutations/putChannel"
import { db } from "prisma/db"

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
