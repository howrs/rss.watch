import { client } from "@/components/QueryProvider"
import { getSearchParams } from "@/hooks/useSearchParams"
import { syncing } from "@/hooks/useSyncing"
import { mutators } from "@/lib/rc/mutators"
import { puller } from "@/lib/rc/puller"
import { pusher } from "@/lib/rc/pusher"
import { rc } from "@/lib/rc/rCachePreflight"
import { cookies } from "@/utils/cookie"
import { isServer } from "@/utils/isServer"
import { COOKIE } from "constants/cookie"
import ms from "ms"
import { Replicache } from "replicache"

rc()

export const rep = (() => {
  if (isServer()) {
    return {} as Replicache<typeof mutators>
  }

  const { g } = getSearchParams()

  const userId = cookies.get(COOKIE.USER_ID)
  const name = `${g}:${userId}`

  const r = new Replicache({
    name,
    licenseKey: "l11c46dbbe3b14e5bae548f51cf9c2543",
    puller,
    pusher,
    pullInterval: ms("1m"),
    // pushDelay: ms("0.5s"),
    mutators,
    schemaVersion: "1",

    // logLevel: "debug",
  })

  r.onClientStateNotFound = null

  r.onSync = (isSyncing: boolean) => {
    client.setQueryData(syncing.queryKey, isSyncing)
  }

  return r
})()

export const m = rep.mutate

// export const RC = memoize((g: string) => {
//   const userId = Cookies.get(COOKIE.USER_ID)
//   const name = `${g}:${userId}`

//   const r = new Replicache({
//     name,
//     licenseKey: "l11c46dbbe3b14e5bae548f51cf9c2543",
//     puller,
//     pusher,
//     pullInterval: ms("1m"),
//     // pushDelay: ms("0.5s"),
//     mutators,
//     schemaVersion: "1",

//     // logLevel: "debug",
//   })

//   r.onClientStateNotFound = null

//   r.onSync = (isSyncing: boolean) => {
//     client.setQueryData(syncing.queryKey, isSyncing)
//   }

//   return r
// })
