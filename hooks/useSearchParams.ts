import { useSearchParams } from "next/navigation"

export const useSearchParam = () => {
  const s = decodeURIComponent(useSearchParams().toString().replace("=", ""))

  const g = s.split("/")[0]
  const c = s.split("/")[1]

  return { g, c }
}

export const getSearchParams = () => {
  const search = location.search.replace("?", "").replace("=", "")

  const g = search.split("/")[0]
  const c = search.split("/")[1]

  return {
    g,
    c,
  }
}
