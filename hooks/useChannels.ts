import { useRCache } from "@/hooks/useRCache"
import type { Channel } from "@prisma/client"
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query"
import { useCallback, useEffect } from "react"
import type { DeepReadonlyObject, ReadTransaction } from "replicache"

export const useChannels = () => {
  const { r } = useRCache()

  const txFn = useCallback(
    (tx: ReadTransaction) =>
      tx
        .scan<Omit<Channel, "createdAt" | "updatedAt">>({
          prefix: "channel/",
        })
        .entries()
        .toArray(),
    [],
  )

  const channelsQuery = queryOptions<
    (readonly [
      string,
      DeepReadonlyObject<Omit<Channel, "createdAt" | "updatedAt">>,
    ])[]
  >({
    queryKey: ["channels"] as const,
    queryFn: () => r.query(txFn),
  })

  const { data: channels, refetch } = useSuspenseQuery(channelsQuery)

  useEffect(() => {
    const unsub = r.subscribe(txFn, {
      onData() {
        refetch()
      },
    })

    return () => {
      unsub()
    }
  }, [])

  return { channels }
}
