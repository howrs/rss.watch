import { useRCache } from "@/hooks/useRCache"
import type { User } from "@prisma/client"
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query"
import { COOKIE } from "constants/cookie"
import Cookies from "js-cookie"
import type { ReadTransaction } from "replicache"

export const useMe = () => {
  const { r } = useRCache()

  // const txFn = useCallback((tx: ReadTransaction) => {
  //   const userId = Cookies.get(COOKIE.USER_ID)
  //   return tx.get<Omit<User, "createdAt" | "updatedAt">>(`user/${userId}`)
  // }, [])

  const userQuery = queryOptions({
    queryKey: ["me"] as const,
    queryFn: () =>
      r.query((tx: ReadTransaction) => {
        const userId = Cookies.get(COOKIE.USER_ID)
        return tx.get<Omit<User, "createdAt" | "updatedAt">>(`user/${userId}`)
      }),
  })

  const { data } = useSuspenseQuery(userQuery)

  return { me: data! }
}
