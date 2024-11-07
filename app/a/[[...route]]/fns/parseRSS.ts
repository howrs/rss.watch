import { parseFeed } from "htmlparser2"

export const parseRSS = async (txt: string | undefined) => {
  if (!txt) {
    return {
      success: false,
      error: "No data",
    } as const
  }

  try {
    const rss = parseFeed(txt, {
      xmlMode: true,
    })

    if (!rss) {
      throw new Error("Failed to parse RSS")
    }

    return {
      success: true,
      data: {
        ...rss,
        items: rss.items
          .sort(
            (a, b) =>
              new Date(b.pubDate ?? "").getTime() -
              new Date(a.pubDate ?? "").getTime(),
          )
          .map((item) => ({
            ...item,
            link: item.link ?? item.id,
          })),
      },
    } as const
  } catch (e) {
    return {
      success: false,
      error: e,
    } as const
  }
}
