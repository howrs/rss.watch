import { useChannels } from "@/hooks/useChannels"
import { useGuild } from "@/hooks/useGuild"
import { separator, useSearchParam } from "@/hooks/useSearchParams"
import { redirect } from "next/navigation"
import { useMemo } from "react"

export const useChannel = (id?: string) => {
  const { guild } = useGuild()
  const { channels } = useChannels()

  const { c } = useSearchParam()

  const channel = useMemo(
    () => channels.map(([, v]) => v).find((v) => v.id === (id ?? c)),
    [c, channels],
  )

  if (!c && channels.length > 0) {
    const channel = channels
      .map(([, v]) => v)
      .filter((v) => v.type === 0 && v.parentId == null)[0]

    redirect(`/d#${guild.id}${separator}${channel.id}`)
  }

  return { channel }
}
