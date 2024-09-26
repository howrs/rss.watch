import { c } from "@/app/a/[[...route]]/hc"
import { useChannels } from "@/hooks/useChannels"
import { useRCache } from "@/hooks/useRCache"
import { nanoid } from "@/utils/ids"
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
      const allChannels = await c.channels
        .$get()
        .then((r) => r.json())
        .then((channels) =>
          channels.map(
            (channel) =>
              ({
                id: nanoid(),
                name: channel.name,
                parentId: channel.parent_id,
                position: channel.position,
                type: channel.type,
                discordId: channel.id,
              }) satisfies Omit<Prisma.ChannelUncheckedCreateInput, "guildId">,
          ),
        )

      const existingChannels = channels
        .map(([, v]) => v)
        .map(
          (channel) =>
            ({
              id: channel.id,
              name: channel.name,
              parentId: channel.parentId,
              position: channel.position,
              type: channel.type,
              discordId: channel.discordId,
            }) satisfies Omit<Prisma.ChannelUncheckedCreateInput, "guildId">,
        )

      const indexed = pipe(
        existingChannels,
        indexBy(({ discordId }) => discordId),
      )

      const newChannels = pipe(
        allChannels,
        (newChannels) =>
          differenceBy(
            ({ discordId }) => discordId,
            existingChannels,
            newChannels,
          ),
        toArray,
      )

      const changedChannels = pipe(
        allChannels,
        (newChannels) =>
          intersectionBy(
            ({ discordId }) => discordId,
            existingChannels,
            newChannels,
          ),
        filter(
          (channel) =>
            !isEqual(
              { ...channel, id: null },
              { ...indexed[channel.discordId], id: null },
            ),
        ),
        toArray,
      )

      const deletedChannels = pipe(
        existingChannels,
        (channels) =>
          differenceBy(({ discordId }) => discordId, allChannels, channels),
        toArray,
      )

      console.log({
        newChannels,
        changedChannels,
        deletedChannels,
      })

      await Promise.all([
        pipe(
          newChannels,
          toAsync,
          map((channel) => m.putChannel(channel)),
          concurrent(allChannels.length),
          toArray,
        ),
        pipe(
          changedChannels,
          toAsync,
          map((channel) =>
            m.putChannel({
              ...channel,
              id: indexed[channel.discordId]!.id,
            }),
          ),
          concurrent(allChannels.length),
          toArray,
        ),
        pipe(
          deletedChannels,
          toAsync,
          map((channel) => m.delChannel(`channel/${channel.id}`)),
          concurrent(channels.length),
          toArray,
        ),
      ])

      return null
    },
  })
}
