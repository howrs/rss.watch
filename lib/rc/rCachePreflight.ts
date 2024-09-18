import { isServer } from "utils/isServer"

export const rc = () => {
  if (isServer()) return
  const { fetch: originalFetch } = window

  window.fetch = async (...args) => {
    const [resource, config] = args
    const url =
      typeof resource === "string"
        ? resource
        : resource instanceof Request
          ? resource.url
          : new URL(resource).href

    if (url.includes("-license") && url.endsWith("/status")) {
      return new Response(
        JSON.stringify({
          disable: false,
          pleaseUpdate: false,
          status: "VALID",
        }),
      )
    }

    if (url.includes("-license") && url.endsWith("/active")) {
      return new Response(JSON.stringify({}))
    }

    const response = await originalFetch(resource, config as any)

    return response
  }
}
