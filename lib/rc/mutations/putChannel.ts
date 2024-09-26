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
    discordId,
    webhookId,
  }: Omit<Prisma.ChannelUncheckedCreateInput, "guildId">,
) => {
  await tx.set(`channel/${id}`, {
    id,
    type,
    name,
    position,
    parentId: parentId ?? null,
    discordId,
    webhookId,
  })
}
