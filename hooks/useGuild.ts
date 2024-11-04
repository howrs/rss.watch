import { useData } from "@/hooks/useData"
import type { Guild } from "@prisma/client"

export const useGuild = () => {
  const { data: guild } = useData(["guild"], (tx) => {
    return tx.get<Omit<Guild, "createdAt" | "updatedAt">>(`guild`)
  })

  return { guild: guild! }
}
