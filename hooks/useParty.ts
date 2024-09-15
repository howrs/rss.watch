import type { mutators } from "@/lib/rc/mutators"
import { PARTY_HOST } from "constants/urls"
import usePartySocket from "partysocket/react"
import type { Replicache } from "replicache"

type Params = {
  r: Replicache<typeof mutators>
  g: string
}

export const useParty = ({ r, g }: Params) => {
  return usePartySocket({
    host: new URL(PARTY_HOST).host,
    room: g,
    onOpen() {
      console.log("connected")
    },
    onMessage(e) {
      const { data } = e
      if (typeof data === "string" && data.includes("poke")) {
        console.log("pulling..")
        r.pull()
      }
    },
    onError(e) {
      console.log("error")
    },
  })
}
