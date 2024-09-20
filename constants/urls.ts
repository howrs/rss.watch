import { isLocal } from "@/utils/isLocal"

export const APP_NAME = `rss-watch`

export const HOST = `${APP_NAME}.pages.dev`

export const REDIRECT_PATH = `/oauth/discord`

export const PARTY_HOST =
  //
  // `https://rss-watch-party.howrs.partykit.dev`

  isLocal()
    ? `http://localhost:1999`
    : `https://rss-watch-party.howrs.partykit.dev`
