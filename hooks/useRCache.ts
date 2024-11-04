import { useSearchParam } from "@/hooks/useSearchParams"
import { rep } from "@/lib/rc/RC"
import type { mutators } from "@/lib/rc/mutators"
import { cookies } from "@/utils/cookie"
import { useSuspenseQuery } from "@tanstack/react-query"
import { COOKIE } from "constants/cookie"
import { PARTY_HOST } from "constants/urls"
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

      const userId = cookies.get(COOKIE.USER_ID)

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

      const r = rep

      await new Promise((resolve) => {
        const un = r.subscribe(
          async (tx) => {
            return tx.has("guild")
          },
          (r) => {
            if (r) {
              un()
              resolve(r)
            }
          },
        )
      })

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
