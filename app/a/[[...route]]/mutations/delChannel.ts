import type { MutatorDefaultParams } from "@/app/a/[[...route]]/mutations/putChannel"
import { db } from "prisma/db"

type Param = {
  args: string
} & MutatorDefaultParams

export const delChannel = async ({ guild, version, args }: Param) => {
  const { prisma } = db

  return [
    prisma.channel.updateMany({
      where: {
        id: args.split("/")[1],
        guildId: guild.id,
      },
      data: {
        deleted: true,
        version,
      },
    }),
  ]
}
