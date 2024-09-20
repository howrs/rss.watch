import { c } from "@/app/a/[[...route]]/hc"
import { useChannels } from "@/hooks/useChannels"
import { useRCache } from "@/hooks/useRCache"
import {
  concurrent,
  differenceBy,
  filter,
  indexBy,
  intersectionBy,
  map,
  pipe,
  toArray,
  toAsync,
} from "@fxts/core"
import type { Prisma } from "@prisma/client"
import { useQuery } from "@tanstack/react-query"
import { isEqual } from "es-toolkit"

export const useSyncChannels = () => {
  const { m } = useRCache()
  const { channels } = useChannels()

  useQuery({
    queryKey: ["syncChannels"],
    queryFn: async () => {
      const newChannels = (await c.channels.$get().then((r) => r.json())).map(
        (channel) =>
          ({
            id: channel.id,
            name: channel.name,
            parentId: channel.parent_id || null,
            position: channel.position,
            type: channel.type,
          }) satisfies Omit<Prisma.ChannelCreateInput, "guild">,
      )

      const existingChannels = channels.map(([, v]) => v)

      const indexed = pipe(
        existingChannels,
        indexBy(({ id }) => id),
      )

      await Promise.all([
        pipe(
          newChannels,
          (newChannels) =>
            differenceBy(({ id }) => id, existingChannels, newChannels),
          toAsync,
          map((channel) => m.putChannel(channel)),
          concurrent(newChannels.length),
          toArray,
        ),
        pipe(
          newChannels,
          (newChannels) =>
            intersectionBy(({ id }) => id, existingChannels, newChannels),
          filter((channel) => !isEqual(channel, indexed[channel.id])),
          toAsync,
          map((channel) => m.putChannel(channel)),
          concurrent(newChannels.length),
          toArray,
        ),
        pipe(
          existingChannels,
          (channels) => differenceBy(({ id }) => id, newChannels, channels),
          toAsync,
          map((channel) => m.delChannel(`channel/${channel.id}`)),
          concurrent(channels.length),
          toArray,
        ),
      ])

      return null
    },
  })

  // return { data: channels }
}
