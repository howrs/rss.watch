import Script from "next/script"

export default function DiscordLogin() {
  return (
    <>
      <Script src="/scripts/discord-oauth.js" type="text/javascript" />
    </>
  )
}
