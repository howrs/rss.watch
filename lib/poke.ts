export const poke = async (roomId: string) => {
  const HOST =
    //
    `https://rss-watch-party.howrs.partykit.dev`
  // `http://localhost:1999`

  await fetch(`${HOST}/parties/main/${roomId}`, {
    method: "POST",
    body: JSON.stringify({ message: "poke" }),
  })
}
