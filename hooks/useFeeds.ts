import { useChannel } from "@/hooks/useChannel"
import { useData } from "@/hooks/useData"
import { useGuild } from "@/hooks/useGuild"
import { getSearchParams } from "@/hooks/useSearchParams"
import type { Feed } from "@prisma/client"
import { redirect } from "next/navigation"

export const useFeeds = () => {
  const { channel } = useChannel()
  const { guild } = useGuild()

  const { data: feeds } = useData(["feeds"], (tx) => {
    return tx
      .scan<Omit<Feed, "createdAt" | "updatedAt">>({ prefix: "feed/" })
      .entries()
      .toArray()
  })

  if (!channel) {
    const { g } = getSearchParams()

    if (g) {
      redirect(`/d#${g}`)
    } else if (guild) {
      redirect(`/d#${guild.id}`)
    } else {
      redirect(`/`)
    }
  }

  return {
    feeds: feeds
      .filter(([, v]) => v.channelId === channel.id)
      .sort(([, a], [, b]) => b.order - a.order),
  }
}
