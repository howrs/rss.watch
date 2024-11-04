import { useData } from "@/hooks/useData"
import { cookies } from "@/utils/cookie"
import type { User } from "@prisma/client"
import { COOKIE } from "constants/cookie"

export const useMe = () => {
  const userId = cookies.get(COOKIE.USER_ID)

  const { data } = useData(["me"], (tx) => {
    return tx.get<Omit<User, "createdAt" | "updatedAt">>(`user/${userId}`)
  })

  return { me: data! }
}
