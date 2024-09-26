import { del } from "@/lib/rc/mutations/del"
import { putChannel } from "@/lib/rc/mutations/putChannel"
import { putFeed } from "@/lib/rc/mutations/putFeed"
import { putWebhook } from "@/lib/rc/mutations/putWebhook"

export const mutators = {
  putChannel,
  delChannel: del,
  putWebhook,
  putFeed,
  delFeed: del,
  // delWebhook: del,
  // syncChannels,
} as const

export type Mutations = keyof typeof mutators
