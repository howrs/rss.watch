import { getChannels } from "@/app/a/[[...route]]/fns/getChannels"
import { JWTSchema, app as route } from "@/app/a/[[...route]]/oauth/discord"
import { COOKIE } from "constants/cookie"
import { JWT_SECRET } from "constants/secrets"
import { jwtDecrypt } from "jose"
import { cookies } from "next/headers"
import { parse } from "valibot"

export const app = route.get("/channels", async (c) => {
  const token = (await cookies()).get(COOKIE.TOKEN)?.value!

  const { payload } = await jwtDecrypt(token, JWT_SECRET)

  const { guild_id } = parse(JWTSchema, payload)

  const channels = await getChannels(guild_id)

  return c.json(channels)
})
