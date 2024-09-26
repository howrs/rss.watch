import { useChannel } from "@/hooks/useChannel"
import { useData } from "@/hooks/useData"
import type { Feed } from "@prisma/client"

export const useFeeds = () => {
  const { channel } = useChannel()

  const { data: feeds } = useData(["feeds", channel!.id], (tx) =>
    tx
      .scan<Omit<Feed, "createdAt" | "updatedAt">>({ prefix: "feed/" })
      .entries()
      .toArray(),
  )

  return { feeds: feeds.filter(([, v]) => v.channelId === channel!.id) }
}
