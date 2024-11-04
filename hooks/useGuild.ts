import { useData } from "@/hooks/useData"
import { useSearchParam } from "@/hooks/useSearchParams"
import type { Guild } from "@prisma/client"
import { redirect } from "next/navigation"

export const useGuild = () => {
  const { data: guild } = useData(["guild"], (tx) => {
    return tx.get<Omit<Guild, "createdAt" | "updatedAt">>(`guild`)
  })

  const { g } = useSearchParam()

  if (guild && !g) {
    redirect(`/d#${guild.id}`)
  }

  return { guild: guild! }
}
