import { useChannels } from "@/hooks/useChannels"
import { useSearchParam } from "@/hooks/useSearchParams"
import { redirect } from "next/navigation"
import { useMemo } from "react"

export const useChannel = () => {
  const { channels } = useChannels()

  const { g, c } = useSearchParam()

  const channel = useMemo(
    () => channels.map(([, v]) => v).find((v) => v.id === c),
    [c],
  )

  if (!c) {
    const channel = channels
      .map(([, v]) => v)
      .filter((v) => v.type === 0 && v.parentId == null)[0]
    redirect(`/d?${g}/${channel.id}`)
  }

  return { channel }
}
