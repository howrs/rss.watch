import type { WriteTransaction } from "replicache"

export const del = async (tx: WriteTransaction, id: string) => {
  await tx.del(id)
}
