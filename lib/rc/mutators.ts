import { createChannel } from "@/lib/rc/mutations/createChannel"
import { del } from "@/lib/rc/mutations/del"

export const mutators = {
  createChannel,
  deleteChannel: del,
}
