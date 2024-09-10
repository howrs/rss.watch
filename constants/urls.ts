import { isLocal } from "@/utils/isLocal"

export const HOST = `rss.watch`

export const REDIRECT_PATH = `/oauth/discord`

export const PARTY_HOST =
  //
  // `https://rss-watch-party.howrs.partykit.dev`

  isLocal()
    ? `http://localhost:1999`
    : `https://rss-watch-party.howrs.partykit.dev`
