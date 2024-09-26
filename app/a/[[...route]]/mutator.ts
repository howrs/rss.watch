import { delChannel } from "@/app/a/[[...route]]/mutations/delChannel"
import { delFeed } from "@/app/a/[[...route]]/mutations/delFeed"
import { putChannel } from "@/app/a/[[...route]]/mutations/putChannel"
import { putFeed } from "@/app/a/[[...route]]/mutations/putFeed"
import { putWebhook } from "@/app/a/[[...route]]/mutations/putWebhook"

export const mutator = {
  putChannel,
  delChannel,
  putWebhook,
  putFeed,
  delFeed,
} as const
