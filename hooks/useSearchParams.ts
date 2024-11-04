import { useSearchParams } from "next/navigation"

export const separator = "="

export const useSearchParam = () => {
  const s = decodeURIComponent(
    useSearchParams().toString(),
    // .replace("=", "")
  )

  const g = s.split(separator)[0]
  const c = s.split(separator)[1]

  return { g, c }
}

export const getSearchParams = () => {
  const search = location.search.replace("?", "")
  // .replace("=", "")

  const g = search.split(separator)[0]
  const c = search.split(separator)[1]

  return {
    g,
    c,
  }
}
