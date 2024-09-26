import { useData } from "@/hooks/useData"
import type { User } from "@prisma/client"
import { COOKIE } from "constants/cookie"
import Cookies from "js-cookie"
import type { ReadTransaction } from "replicache"

export const useMe = () => {
  const { data } = useData(["me"], (tx: ReadTransaction) => {
    const userId = Cookies.get(COOKIE.USER_ID)
    return tx.get<Omit<User, "createdAt" | "updatedAt">>(`user/${userId}`)
  })

  return { me: data! }
}
