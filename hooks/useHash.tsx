import { useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

export const useHash = () => {
  const [hash, setHash] = useState(() => window.location.hash)
  const search = useSearchParams()

  const hashChangeHandler = useCallback(() => {
    setHash(window.location.hash)
  }, [])

  useEffect(() => {
    hashChangeHandler()
  }, [search])

  const updateHash = useCallback(
    (newHash: string) => {
      if (newHash !== hash) window.location.hash = newHash
    },
    [hash],
  )

  return [hash, updateHash] as const
}
