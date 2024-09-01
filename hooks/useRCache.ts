import { rCachePreflight } from "@/utils/rCachePreflight"
import type { Channel, Prisma } from "@prisma/client"
import { useSuspenseQuery } from "@tanstack/react-query"
import ms from "ms"
import { useSearchParams } from "next/navigation"
import usePartySocket from "partysocket/react"
import { Replicache, type WriteTransaction } from "replicache"
import { isServer } from "utils/isServer"

rCachePreflight()

const mutators = {
  async createChannel(
    tx: WriteTransaction,
    {
      id,
      type,
      name,
      parentId,
      position,
    }: Omit<Prisma.ChannelCreateInput, "guild">,
  ) {
    await tx.set(`channel/${id}`, {
      id,
      type,
      name,
      parentId: parentId ?? null,
      position,
      deleted: false,
    })
  },
  async deleteChannel(tx: WriteTransaction, id: string) {
    const ch = await tx.get<Omit<Channel, "createdAt" | "updatedAt">>(id)
    if (!ch) {
      return
    }
    await tx.set(id, {
      ...ch,
      deleted: true,
    })
  },
}

export const useRCache = () => {
  const search = useSearchParams()
  const g = search.get("g")!
  const r = useSuspenseQuery({
    queryKey: ["replicache"],
    queryFn: async () => {
      if (isServer()) {
        return {} as Replicache<typeof mutators>
      }

      const r = new Replicache({
        name: "user42",
        licenseKey: "l11c46dbbe3b14e5bae548f51cf9c2543",
        // logLevel: "debug",
        pullURL: `/a/l?g=${g}`,
        pushURL: `/a/p?g=${g}`,
        pullInterval: ms("1m"),
        pushDelay: ms("0.5s"),

        mutators,
      })

      return r
    },
  })

  const ws = usePartySocket({
    // usePartySocket takes the same arguments as PartySocket.
    host: "rss-watch-party.howrs.partykit.dev", // or localhost:1999 in dev
    // host: `localhost:1999`,
    room: g,

    // in addition, you can provide socket lifecycle event handlers
    // (equivalent to using ws.addEventListener in an effect hook)
    onOpen() {
      console.log("connected")
    },
    onMessage(e) {
      const { data } = e
      // console.log("message", e)
      if (typeof data === "string" && data.includes("poke")) {
        console.log("pulling..")
        r.data.pull()
      }
    },
    onClose() {
      console.log("closed")
    },
    onError(e) {
      console.log("error")
    },
  })

  return r
}
