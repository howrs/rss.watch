import { useSearchParam } from "@/hooks/useSearchParams"
import { RC } from "@/lib/rc/RC"
import type { mutators } from "@/lib/rc/mutators"
import { useSuspenseQuery } from "@tanstack/react-query"
import { COOKIE } from "constants/cookie"
import { PARTY_HOST } from "constants/urls"
import Cookies from "js-cookie"
import { redirect } from "next/navigation"
import PartySocket from "partysocket"
import type { Replicache } from "replicache"
import { isServer } from "utils/isServer"

export const useRCache = () => {
  const { g } = useSearchParam()

  const { data: r } = useSuspenseQuery({
    queryKey: ["replicache"],
    queryFn: async () => {
      if (isServer()) {
        return {} as Replicache<typeof mutators>
      }

      const userId = Cookies.get(COOKIE.USER_ID)

      if (!userId) {
        return redirect("/")
      }

      const ws = new PartySocket({
        host: new URL(PARTY_HOST).host,
        room: g,
      })

      ws.onopen = () => {
        console.log("connected")
      }

      ws.onmessage = (e) => {
        const { data } = e
        if (typeof data === "string" && data.includes("poke")) {
          r.pull()
        }
      }

      const r = RC(g)

      return r
    },
    gcTime: Infinity,
    staleTime: Infinity,
  })

  return {
    r,
    m: r.mutate,
  }
}
