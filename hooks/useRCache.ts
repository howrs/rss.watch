import { useParty } from "@/hooks/useParty"
import { RC } from "@/lib/rc/RC"
import type { mutators } from "@/lib/rc/mutators"
import { useSuspenseQuery } from "@tanstack/react-query"
import Cookies from "js-cookie"
import { redirect, useSearchParams } from "next/navigation"
import type { Replicache } from "replicache"
import { isServer } from "utils/isServer"

export const useRCache = () => {
  const search = useSearchParams()
  const g = search.get("g")!

  const { data: r } = useSuspenseQuery({
    queryKey: ["replicache"],
    queryFn: async () => {
      if (isServer()) {
        return {} as Replicache<typeof mutators>
      }

      const userId = Cookies.get("user_id")

      if (!userId) {
        return redirect("/")
      }

      const r = RC(g)

      return r
    },
  })

  useParty({ r, g })

  return {
    r,
    m: r.mutate,
  }
}
