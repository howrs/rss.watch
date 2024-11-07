import Parser from "rss-parser"

const parser = new Parser()

export const parseRSS = async (txt: string | undefined) => {
  if (!txt) {
    return {
      success: false,
      error: "No data",
    } as const
  }

  try {
    const rss = await parser.parseString(txt)

    return {
      success: true,
      data: {
        ...rss,
        items: rss.items.sort(
          (a, b) =>
            new Date(b.isoDate ?? b.pubDate ?? "").getTime() -
            new Date(a.isoDate ?? a.pubDate ?? "").getTime(),
        ),
      },
    } as const
  } catch (e) {
    return {
      success: false,
      error: e,
    } as const
  }
}
