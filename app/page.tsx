"use client"

import { Button } from "@/components/ui/button"
import { useRCache } from "@/hooks/useRCache"
import { filter, fromEntries, map, pipe, sort, toArray } from "@fxts/core"
import type { Channel } from "@prisma/client"
import { useSearchParams } from "next/navigation"
import { useSubscribe } from "replicache-react"

export default function Page() {
  const search = useSearchParams()
  const g = search.get("g")!
  const { data: r } = useRCache()

  const channels = useSubscribe(
    r,
    async (tx) => {
      const list = await tx
        .scan<Omit<Channel, "createdAt" | "updatedAt">>({ prefix: "channel/" })
        .entries()
        .toArray()
      return list
    },
    { default: [] },
  )

  return (
    <div className="m-2 p-2 text-2xl">
      <div className="">
        <Button
          onClick={async () => {
            fetch("/a/guild", {
              method: "POST",
              body: JSON.stringify({
                name: "test guild",
              }),
            })
          }}
        >
          Create Guild
        </Button>
        <Button
          onClick={() => {
            r.mutate.createChannel({
              id: crypto.randomUUID(),
              name: "test channel",
              position: 0,
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
          filter(([_, v]) => !v.deleted),
          // sort(([,a], [_,b]) => a.),
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
