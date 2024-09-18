import { c } from "@/app/a/[[...route]]/hc"
import { deflate, inflate } from "pako"
import type { PullResponseOKV1, Puller } from "replicache"

export const puller: Puller = async (body) => {
  if (!("clientGroupID" in body)) {
    throw new Error("clientGroupID is required")
  }

  if (!navigator.onLine) {
    return {
      httpRequestInfo: {
        httpStatusCode: 200,
        errorMessage: "offline",
      },
    }
  }

  const { clientGroupID, cookie } = body

  const g = new URLSearchParams(location.search).get("g")!

  const compressed = deflate(
    JSON.stringify({
      g,
      clientGroupID,
      cookie,
    }),
  )

  const res = await c.o.$post(
    {},
    {
      init: { body: compressed },
    },
  )

  const response: PullResponseOKV1 = JSON.parse(
    inflate(await res.arrayBuffer(), { to: "string" }),
  )

  return {
    httpRequestInfo: {
      httpStatusCode: res.status,
      errorMessage: "",
    },
    response,
  }
}
