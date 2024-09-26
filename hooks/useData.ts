import { useRCache } from "@/hooks/useRCache"
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
  const { r } = useRCache()

  const query = useSuspenseQuery(
    queryOptions<R>({
      queryKey,
      queryFn: () => r.query(tx),
    }),
  )

  useEffect(() => {
    const unsub = r.subscribe(tx, {
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
