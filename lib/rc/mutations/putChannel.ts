import type { Prisma } from "@prisma/client"
import type { WriteTransaction } from "replicache"

export const putChannel = async (
  tx: WriteTransaction,
  {
    id,
    type,
    name,
    parentId,
    position,
  }: Omit<Prisma.ChannelCreateInput, "guild">,
) => {
  await tx.set(`channel/${id}`, {
    id,
    type,
    name,
    parentId: parentId ?? null,
    position,
  })
}
