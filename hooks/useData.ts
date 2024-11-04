import { rep } from "@/lib/rc/RC"
import {
  type QueryKey,
  queryOptions,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { useEffect } from "react"
import type { ReadTransaction } from "replicache"

export const useData = <R>(
  queryKey: QueryKey,
  tx: (tx: ReadTransaction) => Promise<R>,
) => {
  const query = useSuspenseQuery(
    queryOptions<R>({
      queryKey,
      queryFn: () => rep.query(tx),
    }),
  )

  useEffect(() => {
    const unsub = rep.subscribe(tx, {
      onData() {
        query.refetch()
      },
    })

    return () => {
      unsub()
    }
  }, [])

  return query
}
