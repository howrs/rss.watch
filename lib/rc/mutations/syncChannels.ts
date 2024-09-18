import { differenceBy, map, pipe } from "@fxts/core"
import type { WriteTransaction } from "replicache"
import {
  type InferInput,
  array,
  nullable,
  number,
  object,
  string,
} from "valibot"

export const ChannelSchema = object({
  id: string(),
  type: string(),
  name: string(),
  parentId: nullable(string()),
  position: number(),
})

export const SyncChannelsSchema = array(ChannelSchema)

export type SyncChannelsSchema = InferInput<typeof SyncChannelsSchema>

type ChannelSchema = InferInput<typeof ChannelSchema>

export const syncChannels = async (
  tx: WriteTransaction,
  args: SyncChannelsSchema,
) => {
  const channels = await tx
    .scan<ChannelSchema>({ prefix: "channel/" })
    .toArray()

  await Promise.all([
    pipe(
      channels,
      (channels) => differenceBy((c) => c.id, args, channels),
      map(({ id }) => tx.del(`channel/${id}`)),
    ),
    pipe(
      args,
      map((arg) => tx.set(`channel/${arg.id}`, arg)),
    ),
  ])
}
