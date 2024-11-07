import "./dom-polyfill"

import type { FeedInfo } from "@/app/a/[[...route]]/feed"
import { f } from "@/app/a/[[...route]]/fns/f"
import { getFeedFromHtml } from "@/app/a/[[...route]]/fns/getFeedFromHtml"
import { RSS_SUFFIXES, isRSS } from "@/app/a/[[...route]]/fns/isRSS"
import { parseRSS } from "@/app/a/[[...route]]/fns/parseRSS"
import {
  concurrent,
  filter,
  map,
  pipe,
  toArray,
  toAsync,
  uniq,
} from "@fxts/core"
import { sha256 } from "@noble/hashes/sha256"
import { bytesToHex } from "@noble/hashes/utils"
import { load } from "cheerio"

export const MAX_ITEMS = 30

export const getFeedFromURL = async (url: string) => {
  const hash = bytesToHex(sha256(url))

  let res = await f(`https://${url}`).catch((e) => "error" as const)

  if (res === "error") {
    // Network error
    console.error(`Error fetching: ${url}`)
    return
  }

  if (!res.ok) {
    // server down
    console.error(`Server down: ${res.status} ${res.statusText} ${url}`)

    // res = await fetch(`http://localhost:8080/t/p?url=http://${url}`);
    return
  }

  const data = res._data

  if (!data) {
    // no data
    console.error(`No data: ${url}`)

    return
  }

  const isCloudflareBlocked = data.includes(`<title>Just a moment...</title>`)

  if (isCloudflareBlocked) {
    console.error(`Cloudflare blocked: ${url}`)
    return
  }

  let json: FeedInfo | undefined
  let sel: string | undefined
  let fData: string | undefined

  // const buf = textToArrayBuffer(data)
  // console.log(data)
  // console.log("-----------------")
  // console.log(new TextDecoder("UTF-8").decode(buf))

  const $ = load(data)
  const As = [...$("a")]
  const feedURL = $(
    'link[type="application/rss+xml"], link[type="application/atom+xml"]',
  ).attr("href")

  const feed = (await isRSS(data))
    ? `https://${url}`
    : feedURL
      ? feedURL.startsWith("http")
        ? feedURL
        : `https://${url}${feedURL}`
      : (
          await pipe(
            As,
            map((k) => k.attribs.href),
            // (arr) => [...arr, ...(feedURL ? [feedURL] : [])],
            filter((k) => !!k),
            filter((k) => RSS_SUFFIXES.some((suffix) => k.endsWith(suffix))),
            map((k) => (k.startsWith("http") ? k : `https://${url}${k}`)),
            uniq,
            // fetch
            toAsync,
            filter((k) => f(k).then(({ _data }) => isRSS(_data))),
            concurrent(50),
            toArray,
          )
        )[0]

  let parseFailed = false

  // fetch
  if (feed) {
    const feedURL = feed.startsWith("http")
      ? feed
      : `${new URL(`https://${url}`).origin}${feed}`

    const res = await f(feedURL)

    fData = res._data

    console.log(`Saved Feed! ${hash} - ${url}`)

    const { success, data: rss, error } = await parseRSS(fData)

    if (!success) {
      console.error(`Error parsing feed: ${feedURL}`)
      console.error(error)

      parseFailed = true
    } else {
      json = {
        title: rss.title ?? url,
        url: `https://${url}`,
        items: rss.items.slice(0, MAX_ITEMS).map((item) => ({
          title: item.title ?? "",
          url: item.link?.startsWith("http")
            ? item.link
            : new URL(item.link || "", `https://${url}`).href,
          date: item.pubDate
            ? new Date(item.pubDate ?? "").toISOString()
            : undefined,
        })),
      }
    }
  }

  if (!feed || parseFailed) {
    const result = await getFeedFromHtml({
      url: `https://${url}`,
      text: data,
      // sel: selector,
      hash,
    })

    json = result.json
    sel = result.sel
  }

  return {
    hash,
    data,
    json,
    sel,
    fData,
  }
}
