import { PARTY_HOST } from "constants/urls"

export const poke = async (roomId: string) => {
  const BASE_URL = PARTY_HOST

  const res = await fetch(`${BASE_URL}/parties/main/${roomId}`, {
    method: "POST",
    body: JSON.stringify({ message: "poke" }),
  })
  return
}
