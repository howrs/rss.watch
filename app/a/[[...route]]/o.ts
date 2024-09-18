import { app as route } from "@/app/a/[[...route]]/app"
import { inflate } from "pako"
import { p } from "@/app/a/[[...route]]/p"
import { l } from "@/app/a/[[...route]]/l"

export const app = route.post("/o", async (c) => {
  const json = JSON.parse(inflate(await c.req.arrayBuffer(), { to: "string" }))

  if ("mutations" in json) {
    return p(c)
  } else if ("cookie" in json) {
    return l(c)
  }
})
