import type { NextRequest } from "next/server"

export const runtime = "edge"

export const GET = async (req: NextRequest) => {
  const url = req.nextUrl.searchParams.get("url")

  console.dir(url)

  if (!url) {
    return new Response("No url provided", { status: 400 })
  }

  const res = await fetch(url, {
    headers: {
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br, zstd",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      Priority: "u=0, i",
      "Sec-Ch-Ua":
        '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
      "Sec-Ch-Ua-Mobile": "?0",
      "Sec-Ch-Ua-Platform": '"macOS"',
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      "Upgrade-Insecure-Requests": "1",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
    },
  })

  const text = await res.text()

  return new Response(text, {
    headers: {
      // ...res.headers,
    },
  })
}
