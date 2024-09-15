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

  const res = await fetch(`/a/l`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      g,
      clientGroupID,
      cookie,
    }),
  })

  const response: PullResponseOKV1 = await res.json()

  return {
    httpRequestInfo: {
      httpStatusCode: res.status,
      errorMessage: "",
    },
    response,
  }
}
