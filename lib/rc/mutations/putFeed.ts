import type { Prisma } from "@prisma/client"
import type { WriteTransaction } from "replicache"

export const putFeed = async (
  tx: WriteTransaction,
  {
    id,
    type,
    value,
    channelId,
    faviconUrl,
    xmlUrl,
    position,
  }: Omit<Prisma.FeedUncheckedCreateInput, "guildId">,
) => {
  await tx.set(`feed/${id}`, {
    id,
    type,
    value,
    channelId,
    faviconUrl,
    xmlUrl,
    position,
  })
}
