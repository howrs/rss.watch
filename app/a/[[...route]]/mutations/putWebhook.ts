import type { MutatorDefaultParams } from "@/app/a/[[...route]]/mutations/putChannel"
import type { Param } from "@/app/a/[[...route]]/mutations/putFeed"
import { db } from "prisma/db"

type Params = {} & MutatorDefaultParams

export const putWebhook = async ({ guild, version, args }: Param) => {
  const { prisma } = db

  return [
    // prisma.channel.upsert({
    //   where: {
    //     id: args.id,
    //   },
    //   create: {
    //     id: args.id,
    //     type: args.type,
    //     name: args.name,
    //     parentId: args.parentId,
    //     position: args.position,
    //     guildId,
    //     version,
    //   },
    //   update: {
    //     type: args.type,
    //     name: args.name,
    //     parentId: args.parentId,
    //     position: args.position,
    //     version,
    //   },
    // }),
  ]
}
