import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query"

export const syncing = queryOptions({
  queryKey: ["syncing"],
})

export const useSyncing = () => {
  const client = useQueryClient()
  const { queryKey } = syncing

  const { data } = useQuery({
    queryKey,
    queryFn: async () => {
      const syncing = client.getQueryData<boolean>(queryKey)
      return typeof syncing === "boolean" ? syncing : false
    },
  })

  return {
    syncing: data,
  }
}
