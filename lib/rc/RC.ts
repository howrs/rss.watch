import { client } from "@/components/QueryProvider"
import { syncing } from "@/hooks/useSyncing"
import { mutators } from "@/lib/rc/mutators"
import { puller } from "@/lib/rc/puller"
import { pusher } from "@/lib/rc/pusher"
import { rc } from "@/lib/rc/rCachePreflight"
import { memoize } from "@fxts/core"
import Cookies from "js-cookie"
import ms from "ms"
import { Replicache } from "replicache"

rc()

export const RC = memoize((g: string) => {
  const userId = Cookies.get("user_id")

  const r = new Replicache({
    name: `${userId}:${g}`,
    licenseKey: "l11c46dbbe3b14e5bae548f51cf9c2543",
    // logLevel: "debug",
    puller,
    pusher,
    pullInterval: ms("1m"),
    // pushDelay: ms("0.5s"),
    mutators,
    schemaVersion: "1",
  })

  r.onClientStateNotFound = null

  r.onSync = (isSyncing: boolean) => {
    client.setQueryData(syncing.queryKey, isSyncing)
  }

  return r
})
