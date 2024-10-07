import type { Prisma } from "@prisma/client"
import type { WriteTransaction } from "replicache"

export const putFeed = async (
  tx: WriteTransaction,
  {
    id,
    ...args
    // type,
    // value,
    // channelId,
    // faviconUrl,
    // xmlUrl,
    // order,
    // enabled,
  }: Omit<
    Prisma.FeedUncheckedCreateInput,
    "guildId" | "updatedAt" | "createdAt"
  >,
) => {
  await tx.set(`feed/${id}`, {
    id,
    ...args,
    // type,
    // value,
    // channelId,
    // faviconUrl,
    // xmlUrl,
    // order,
    // enabled,
  })
}
