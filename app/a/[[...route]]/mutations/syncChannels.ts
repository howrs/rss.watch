import type { SyncChannelsSchema } from "@/lib/rc/mutations/syncChannels"
import { map, pipe } from "@fxts/core"
import { db } from "prisma/db"

export const syncChannels = async (args: SyncChannelsSchema) => {
  const { prisma } = db

  await pipe(
    args,
    map(({ id, ...rest }) => {
      return tx.set(`channel/${id}`, {
        id,
        ...rest,
      })
    }),
    concurrent(args.length),
    toArray,
  )
}
