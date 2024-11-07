import { useChannel } from "@/hooks/useChannel"
import { useWebhooks } from "@/hooks/useWebhooks"
import { useMemo } from "react"

export const useWebhook = (channelId?: string) => {
  const { channel } = useChannel()

  const { webhooks } = useWebhooks()

  const webhook = useMemo(
    () =>
      webhooks
        .map(([, v]) => v)
        .filter((v) => v.channelId === (channelId ?? channel.id))[0],
    [webhooks, channelId, channel.id],
  )

  return { webhook }
}
