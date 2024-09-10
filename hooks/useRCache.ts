import { rCachePreflight } from "@/utils/rCachePreflight"
import type { Channel, Prisma } from "@prisma/client"
import { useSuspenseQuery } from "@tanstack/react-query"
import { PARTY_HOST } from "constants/urls"
import Cookies from "js-cookie"
import ms from "ms"
import { redirect, useRouter, useSearchParams } from "next/navigation"
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
  const { replace } = useRouter()
  const search = useSearchParams()
  const g = search.get("g")!

  const r = useSuspenseQuery({
    queryKey: ["replicache"],
    queryFn: async () => {
      if (isServer()) {
        return {} as Replicache<typeof mutators>
      }

      const userId = Cookies.get("user_id")

      if (!userId) {
        return redirect("/")
        // replace("")
        // return {} as Replicache<typeof mutators>
      }

      const r = new Replicache({
        name: `${userId}:${g}`,
        licenseKey: "l11c46dbbe3b14e5bae548f51cf9c2543",
        // logLevel: "debug",
        pullURL: `/a/l?g=${g}`,
        pushURL: `/a/p?g=${g}`,
        pullInterval: ms("1m"),
        // pushDelay: ms("0.5s"),

        mutators,
        schemaVersion: "1",
      })

      r.onClientStateNotFound = null

      return r
    },
  })

  const ws = usePartySocket({
    host: new URL(PARTY_HOST).host,
    room: g,
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
