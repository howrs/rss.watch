"use client"

import { client } from "@/components/QueryProvider"
import { Button } from "@/components/ui/button"
import { useRCache } from "@/hooks/useRCache"
import { useSyncing } from "@/hooks/useSyncing"
import { uuid } from "@/utils/ids"
import { map, pipe, sort, toArray } from "@fxts/core"
import type { Channel } from "@prisma/client"
import { useNetworkState } from "@uidotdev/usehooks"
import { CloudOff } from "lucide-react"
import { useEffect } from "react"
import { useSubscribe } from "replicache-react"

export default function Page() {
  const { r, m } = useRCache()

  const channels = useSubscribe(
    r,
    async (tx) => {
      const list = await tx
        .scan<Omit<Channel, "createdAt" | "updatedAt">>({ prefix: "channel/" })
        .entries()
        .toArray()
      return list.filter(([_, v]) => !v.deleted)
    },
    { default: [] },
  )

  const { online } = useNetworkState()
  const { syncing } = useSyncing()

  useEffect(() => {
    !(async () => {
      const isOffline = client.getQueryData<boolean>(["isOffline"])

      if (isOffline && online) {
        const hasMutations = (await r.experimentalPendingMutations()).length > 0

        if (hasMutations) {
          client.setQueryData(["isOffline"], false)
          r.push({ now: true })
        }
      }
    })()
  }, [online])

  return (
    <div className="m-2 p-2 text-2xl">
      <div className="flex h-12 gap-4">
        {!online && (
          <div>
            <CloudOff />
          </div>
        )}
        {online && syncing && <div>Syncing...</div>}
      </div>
      <div className="">
        <Button
          onClick={() => {
            m.createChannel({
              id: uuid(),
              name: "test channel",
              position: channels.length,
              type: 0,
            })
          }}
        >
          Create Channel
        </Button>
      </div>
      <div className="flex flex-col font-mono text-xs">
        {pipe(
          channels,
          // filter(([_, v]) => !v.deleted),
          sort(([, a], [_, b]) => a.id.localeCompare(b.id)),
          map(([k, v]) => (
            <div key={k} className="flex">
              {k}
              <Button
                className="h-4 w-fit text-xs"
                variant="link"
                onClick={() => {
                  m.deleteChannel(k)
                }}
              >
                del
              </Button>
            </div>
          )),
          toArray,
        )}
      </div>
    </div>
  )
}
