import { PARTY_HOST } from "constants/urls"

type Params = {
  g: string
}

export const poke = async ({ g }: Params) => {
  const BASE_URL = PARTY_HOST

  const res = await fetch(`${BASE_URL}/parties/main/${g}`, {
    method: "POST",
    body: JSON.stringify({ message: "poke" }),
  })
  return
}
