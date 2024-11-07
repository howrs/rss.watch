import { isServer } from "@/utils/isServer"
import { identity } from "@fxts/core"
import { ofetch } from "ofetch"

const ENABLE_CACHE = false

export const getContentFromURL = async (url: string): Promise<string> => {
  let result: string | null = null

  if (ENABLE_CACHE) {
    result = await getContentFromCache(url)
  }

  if (!result) {
    result = await getContentWithFetch(url)
  }

  return result
}

const getContentFromCache = async (url: string): Promise<string> => {
  const content = await ofetch<string>(
    `https://raw.githubusercontent.com/${url}`,
    { parseResponse: identity },
  )

  return content
}

const getContentWithFetch = async (url: string): Promise<string> => {
  const result = await ofetch<string>(
    isServer() ? url : `/p/${url.replace("https://", "")}`,
    { parseResponse: identity },
  )

  return result
}
