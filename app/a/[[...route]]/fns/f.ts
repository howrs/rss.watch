import { humanHeaders } from "@/app/a/[[...route]]/fns/headers"
import { fromEntries, map, pipe, toArray } from "@fxts/core"
import { parseSetCookie, splitSetCookieString } from "cookie-es"
import { type FetchResponse, ofetch } from "ofetch"

const Cookie = new Map<string, Record<string, string>>()

export const f = async (url: string): Promise<FetchResponse<string>> => {
  const res = await ofetch.raw<string>(url, {
    parseResponse: (txt) => txt,
    timeout: 30_000,
    ignoreResponseError: true,
    headers: {
      ...humanHeaders,
      ...(Cookie.get(url)
        ? {
            Cookie: new URLSearchParams(Cookie.get(url)).toString(),
          }
        : {}),
    },
    redirect: "manual",
  })

  if (`${res.status}`.startsWith("3")) {
    const setCookie =
      res.headers.get("set-cookie") || res.headers.get("Set-Cookie")

    if (setCookie) {
      const cookies = pipe(
        splitSetCookieString(setCookie),
        map(parseSetCookie),
        toArray,
        map(({ name, value }) => [name, value] as const),
        fromEntries,
      )

      Cookie.set(url, {
        ...Cookie.get(url),
        ...cookies,
      })
    }

    const Location = res.headers.get("Location")

    if (!Location) {
      throw new Error("No Location Header")
    }

    const isRelative = !Location.startsWith("http")

    if (Location.startsWith("//")) {
      return f(`https:${Location}`)
    }

    if (isRelative) {
      const { origin } = new URL(url)
      const newURL = `${origin}${Location}`

      return f(newURL)
    }

    return f(Location)
  }

  // TODO: 429 handling

  return res
}
