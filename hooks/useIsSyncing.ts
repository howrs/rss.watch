import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query"

export const isSyncing = queryOptions({
  queryKey: ["isSyncing"],
})

export const useIsSyncing = () => {
  const client = useQueryClient()
  const { queryKey } = isSyncing

  const { data } = useQuery({
    queryKey,
    queryFn: async () => {
      return client.getQueryData<boolean>(queryKey)
    },
  })

  return {
    isSyncing: typeof data === "boolean" ? data : false,
  }
}
