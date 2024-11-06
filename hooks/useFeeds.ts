import { useChannel } from "@/hooks/useChannel"
import { useData } from "@/hooks/useData"
import { useGuild } from "@/hooks/useGuild"
import { useSearchParam } from "@/hooks/useSearchParams"
import type { Feed } from "@prisma/client"
import { redirect } from "next/navigation"

export const useFeeds = (channelId?: string) => {
  const { channel } = useChannel()
  const { guild } = useGuild()
  const { g } = useSearchParam()

  if (!channel) {
    if (g) {
      redirect(`/d#${g}`)
    } else if (guild) {
      redirect(`/d#${guild.id}`)
    } else {
      redirect(`/`)
    }
  }

  const { data: feeds } = useData(
    [channelId ?? channel.id, "feeds"],
    async (tx) => {
      return (
        await tx
          .scan<Omit<Feed, "createdAt" | "updatedAt">>({ prefix: "feed/" })
          .entries()
          .toArray()
      )
        .filter(([, v]) => v.channelId === (channelId ?? channel.id))
        .sort(([, a], [, b]) => b.order - a.order)
    },
  )

  return { feeds }
}
