import { useData } from "@/hooks/useData"
import type { Feed } from "@prisma/client"

export const useFeed = (id: string) => {
  const { data: feed } = useData(id.split("/"), (tx) =>
    tx.get<Omit<Feed, "createdAt" | "updatedAt">>(id),
  )

  return { feed: feed! }
}
