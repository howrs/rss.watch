import { isLocal } from "@/utils/isLocal"

export const poke = async (roomId: string) => {
  const HOST = isLocal()
    ? //
      `http://localhost:1999`
    : `https://rss-watch-party.howrs.partykit.dev`

  await fetch(`${HOST}/parties/main/${roomId}`, {
    method: "POST",
    body: JSON.stringify({ message: "poke" }),
  })
}
