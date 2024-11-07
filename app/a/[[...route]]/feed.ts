import { getFeedFromURL } from "@/app/a/[[...route]]/fns/getFeedFromURL"
import { app as route } from "@/app/a/[[...route]]/guild"
import { vValidator } from "@hono/valibot-validator"
import { object, string } from "valibot"

export const app = route.get(
  "/feed",
  vValidator(
    "query",
    object({
      url: string(),
    }),
  ),
  async (c) => {
    const { req } = c
    const { url } = req.valid("query")

    const json = await getFeedFromURL(url)

    return c.json({
      data: {
        json: json?.json,
        // feed: json?.fData,
      },
      success: true,
    })
  },
)

export type FeedInfo = {
  title: string
  url: string
  items: {
    title: string
    url: string
    date?: string
  }[]
}
