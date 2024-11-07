"use client"

import { FeedInput } from "@/app/(auth)/d/FeedInput"
import { FeedList } from "@/app/(auth)/d/FeedList"
import { StatusBar } from "@/components/StatusBar"
import { useWebhooks } from "@/hooks/useWebhooks"

export default function Page() {
  // const { online } = useNetworkState()
  // const { syncing } = useSyncing()

  useWebhooks()

  // useEffect(() => {
  //   !(async () => {
  //     const isOffline = client.getQueryData<boolean>(["isOffline"])

  //     if (isOffline && online) {
  //       const hasMutations =
  //         (await rep.experimentalPendingMutations()).length > 0

  //       if (hasMutations) {
  //         client.setQueryData(["isOffline"], false)
  //         rep.push({ now: true })
  //       }
  //     }
  //   })()
  // }, [online])

  return (
    <div className="flex flex-1 flex-col">
      <StatusBar />
      <div className="flex w-full max-w-screen-md flex-1 flex-col self-center font-mono">
        <FeedInput />
        <section className="px-1">
          <FeedList />
        </section>
        {/* <div className="flex h-12 gap-4">
          {!online && (
            <div>
              <CloudOff />
            </div>
          )}
          {online && syncing && <div>Syncing...</div>}
        </div> */}
      </div>
    </div>
  )
}
