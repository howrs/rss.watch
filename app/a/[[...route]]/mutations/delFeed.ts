import type { MutatorDefaultParams } from "@/app/a/[[...route]]/mutations/putChannel"
import { db } from "prisma/db"

type Param = {
  args: string
} & MutatorDefaultParams

export const delFeed = async ({ guild, version, args }: Param) => {
  const { prisma } = db

  return [
    prisma.feed.updateMany({
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
