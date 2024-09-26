import { useData } from "@/hooks/useData"
import type { Channel } from "@prisma/client"

export const useChannels = () => {
  const { data: channels } = useData(["channels"], (tx) =>
    tx
      .scan<Omit<Channel, "createdAt" | "updatedAt">>({ prefix: "channel/" })
      .entries()
      .toArray(),
  )

  return { channels }
}
