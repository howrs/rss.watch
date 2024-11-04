import { c } from "@/app/a/[[...route]]/hc"
import { client } from "@/components/QueryProvider"
import { deflate } from "pako"
import type { Pusher } from "replicache"

export const pusher: Pusher = async (body) => {
  if (!("clientGroupID" in body)) {
    throw new Error("clientGroupID is required")
  }

  if (!navigator.onLine) {
    client.setQueryData(["isOffline"], true)

    return {
      httpRequestInfo: {
        httpStatusCode: 200,
        errorMessage: "offline",
      },
    }
  }

  const { clientGroupID, mutations } = body

  const compressed = deflate(
    JSON.stringify({
      clientGroupID,
      mutations,
    }),
  )
  console.log("push: ", mutations)

  const res = await c.o.$post(
    {},
    {
      init: { body: compressed },
    },
  )

  return {
    httpRequestInfo: {
      httpStatusCode: res.status,
      errorMessage: "",
    },
  }
}
