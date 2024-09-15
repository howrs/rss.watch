import { client } from "@/components/QueryProvider"
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

  const g = new URLSearchParams(location.search).get("g")!

  const res = await fetch(`/a/p`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      g,
      clientGroupID,
      mutations,
    }),
  })

  return {
    httpRequestInfo: {
      httpStatusCode: res.status,
      errorMessage: "",
    },
  }
}
