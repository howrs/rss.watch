import type { Prisma } from "@prisma/client"
import type { WriteTransaction } from "replicache"

export const putWebhook = async (
  tx: WriteTransaction,
  { id, url, channelId }: Omit<Prisma.WebhookUncheckedCreateInput, "guildId">,
) => {
  await tx.set(`webhook/${id}`, {
    id,
    url,
    channelId,
  })
}
