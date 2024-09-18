import { putChannel } from "@/lib/rc/mutations/putChannel"
import { del } from "@/lib/rc/mutations/del"
import { syncChannels } from "@/lib/rc/mutations/syncChannels"
import { putWebhook } from "@/lib/rc/mutations/putWebhook"

export const mutators = {
  putChannel,
  delChannel: del,
  putWebhook,
  // delWebhook: del,
  // syncChannels,
} as const

export type Mutations = keyof typeof mutators
