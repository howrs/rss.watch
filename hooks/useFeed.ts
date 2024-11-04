import { rep } from "@/lib/rc/RC"
import type { Feed } from "@prisma/client"
import { useSubscribe } from "replicache-react"

export const useFeed = (id: string) => {
  const feed = useSubscribe(rep, (tx) => {
    return tx.get<Omit<Feed, "createdAt" | "updatedAt">>(id)
  })

  return { feed: feed! }
}
