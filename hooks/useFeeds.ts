import { useData } from "@/hooks/useData"
import { useSearchParam } from "@/hooks/useSearchParams"
import type { Feed } from "@prisma/client"
import { useMemo } from "react"

export const useFeeds = (channelId?: string) => {
  const { c } = useSearchParam()

  const { data } = useData(["feeds"], async (tx) => {
    return tx
      .scan<Omit<Feed, "createdAt" | "updatedAt">>({ prefix: "feed/" })
      .entries()
      .toArray()
  })

  const feeds = useMemo(
    () =>
      data
        .filter(([, v]) => v.channelId === (channelId ?? c))
        .sort(([, a], [, b]) => b.order - a.order),
    [data, channelId, c],
  )

  return { feeds }
}
