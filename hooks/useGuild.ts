import { useData } from "@/hooks/useData"
import { getSearchParams } from "@/hooks/useSearchParams"
import type { Guild } from "@prisma/client"
import { redirect } from "next/navigation"

export const useGuild = () => {
  const { data: guild } = useData(["guild"], (tx) => {
    return tx.get<Omit<Guild, "createdAt" | "updatedAt">>(`guild`)
  })

  if (!guild) {
    const { g } = getSearchParams()
    redirect(`/d#${g}`)
  }

  return { guild }
}
