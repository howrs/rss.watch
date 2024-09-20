"use client"

import { client } from "@/components/QueryProvider"
import { useRCache } from "@/hooks/useRCache"
import { useSyncing } from "@/hooks/useSyncing"
import { useNetworkState } from "@uidotdev/usehooks"
import { CloudOff } from "lucide-react"
import { useEffect } from "react"

export default function Page() {
  const { r, m } = useRCache()

  const { online } = useNetworkState()
  const { syncing } = useSyncing()

  useEffect(() => {
    !(async () => {
      const isOffline = client.getQueryData<boolean>(["isOffline"])

      if (isOffline && online) {
        const hasMutations = (await r.experimentalPendingMutations()).length > 0

        if (hasMutations) {
          client.setQueryData(["isOffline"], false)
          r.push({ now: true })
        }
      }
    })()
  }, [online])

  return (
    <div className="m-2 p-2 text-2xl">
      <div className="flex h-12 gap-4">
        {!online && (
          <div>
            <CloudOff />
          </div>
        )}
        {online && syncing && <div>Syncing...</div>}
      </div>
    </div>
  )
}
