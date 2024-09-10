import { c } from "@/app/a/[[...route]]/hc"
import { getMe } from "@/app/a/[[...route]]/oauth/getMe"
import { getOAuth2Token } from "@/app/a/[[...route]]/oauth/getOAuth2Token"
import { base16 } from "@scure/base"
import { EncryptJWT } from "jose"
import Cookies from "js-cookie"
import Head from "next/head"
import Script from "next/script"
import { isProd } from "utils/isProd"
import { isServer } from "utils/isServer"
import { object, safeParse, string } from "valibot"

// const schema = object({
//   code: string(),
//   guild_id: string(),
// })

// if (!isServer()) {
//   !(async () => {
//     const searchParams = new URLSearchParams(location.search)

//     const result = safeParse(schema, {
//       code: searchParams.get("code"),
//       guild_id: searchParams.get("guild_id"),
//     })

//     if (
//       !result.success
//       //  || !SECRET
//     ) {
//       location.href = "/"
//       return
//     }

//     const { code, guild_id } = result.output

//     const res = await getOAuth2Token(code)
//     const { access_token, token_type, expires_in, guild } = res

//     const r = await c.guild.$put({
//       json: {
//         id: guild_id,
//         name: guild.name,
//       },
//     })

//     const me = await getMe(res)
//     const { id, avatar, username } = me

//     const rand = crypto.getRandomValues(new Uint8Array(32))

//     const encoded = base16.encode(rand)

//     console.log({
//       rand,
//       encoded,
//       decoded: base16.decode(encoded),
//     })

//     const jwt = await new EncryptJWT({ guild_id, access_token })
//       .setProtectedHeader({ alg: "dir", enc: "A128CBC-HS256" })
//       .setExpirationTime(`${expires_in}s`)
//       .encrypt(rand)

//     Cookies.set("access_token", jwt, {
//       expires: expires_in / 60 / 60 / 24,
//       sameSite: "strict",
//       secure: isProd(),
//     })

//     // location.href = `/dashboard`
//   })()
// }

// export default function Page() {
//   return <div className="hidden">a</div>
// }

export default function DiscordLogin() {
  return (
    <>
      <Head>
        <title>Discord Login</title>
      </Head>
      <Script src="/scripts/discord-oauth.js" type="text/javascript" />
    </>
  )
}
