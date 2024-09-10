import { PARTY_HOST } from "constants/urls"

export const poke = async (roomId: string) => {
  const res = await fetch(
    `https://rss-watch-party.howrs.partykit.dev/parties/main/${roomId}`,
    {
      method: "POST",
      body: JSON.stringify({ message: "poke" }),
    },
  )
  return
}
