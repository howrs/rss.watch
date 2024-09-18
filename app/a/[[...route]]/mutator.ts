import { delChannel } from "@/app/a/[[...route]]/mutations/delChannel"
import { putChannel } from "@/app/a/[[...route]]/mutations/putChannel"
import { putWebhook } from "@/app/a/[[...route]]/mutations/putWebhook"

export const mutator = {
  putChannel,
  delChannel,
  putWebhook,
} as const
