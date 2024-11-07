import { useHash } from "@/hooks/useHash"
import { useMemo } from "react"

export const separator = "/"

export const useSearchParam = () => {
  const [hash] = useHash()
  const s = hash.replace("#", "")

  const g = s.split(separator)[0]
  const c = s.split(separator)[1]

  return useMemo(() => ({ g, c }), [hash])
}

export const getSearchParams = () => {
  const hash = location.hash.replace("#", "")

  const g = hash.split(separator)[0]
  const c = hash.split(separator)[1]

  return {
    g,
    c,
  }
}
