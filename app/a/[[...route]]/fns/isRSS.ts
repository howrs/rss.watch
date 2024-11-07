import { parseRSS } from "@/app/a/[[...route]]/fns/parseRSS"

export const isRSS = async (txt?: string) => {
  if (!txt) return false
  const { success } = await parseRSS(txt)
  return success
}

export const RSS_SUFFIXES = [
  "/rss",
  ".rss",
  "/rss/",
  ".rss/",
  "/rss.xml",
  "/atom",
  ".atom",
  "/atom/",
  ".atom/",
  "/atom.xml",
  "/feed",
  // ".feed",
  "/feed/",
  // ".feed/",
  "/feed.xml",
]
