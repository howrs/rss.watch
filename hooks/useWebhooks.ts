import { useData } from "@/hooks/useData"
import type { Webhook } from "@prisma/client"

export const useWebhooks = () => {
  const { data: webhooks } = useData(["webhooks"], async (tx) => {
    return tx
      .scan<Omit<Webhook, "createdAt" | "updatedAt">>({
        prefix: "webhook/",
      })
      .entries()
      .toArray()
  })

  return { webhooks }
}
