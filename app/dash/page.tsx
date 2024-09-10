"use client"

import { Button } from "@/components/ui/button"
import { useRCache } from "@/hooks/useRCache"
import { uuid } from "@/utils/ids"
import { map, pipe, sort, toArray } from "@fxts/core"
import type { Channel } from "@prisma/client"
import { useNetworkState } from "@uidotdev/usehooks"
import { useSubscribe } from "replicache-react"

export default function Page() {
  const { data: r } = useRCache()

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

  const { downlink, online } = useNetworkState()

  return (
    <div className="m-2 p-2 text-2xl">
      <div className="flex">
        <div>Network: {online ? "online" : "offline"}</div>
        <div>Downlink: {downlink} Mbps</div>
      </div>
      <div className="">
        <Button
          onClick={() => {
            r.mutate.createChannel({
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
                  r.mutate.deleteChannel(k)
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
