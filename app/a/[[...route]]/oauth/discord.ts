import { app as route } from "@/app/a/[[...route]]/guild"
import { getMe } from "@/app/a/[[...route]]/oauth/getMe"
import { getOAuth2Token } from "@/app/a/[[...route]]/oauth/getOAuth2Token"
import { nanoid } from "@/utils/ids"
import { isProd } from "@/utils/isProd"
import { vValidator } from "@hono/valibot-validator"
import { COOKIE } from "constants/cookie"
import { JWT_SECRET } from "constants/secrets"
import { EncryptJWT } from "jose"
import { cookies } from "next/headers"
import { db } from "prisma/db"
import { object, string } from "valibot"

export const JWTSchema = object({
  guild_id: string(),
  access_token: string(),
})

export const app = route.get(
  "/oauth/discord",
  vValidator(
    "query",
    object({
      code: string(),
    }),
    ({ success }, { redirect }) => {
      if (!success) {
        return redirect("/")
      }
    },
  ),
  async (c) => {
    const { req } = c
    const { prisma } = db
    const { code } = req.valid("query")

    const res = await getOAuth2Token(code)

    const {
      access_token,
      token_type,
      expires_in,
      guild: { id, name },
    } = res

    const me = await getMe(res)
    const { avatar, username } = me

    const [guild, user] = await Promise.all([
      prisma.guild
        .findUnique({
          where: { discordId: id },
        })
        .then(
          (g) =>
            g ||
            prisma.guild.create({
              data: {
                id: nanoid(),
                discordId: id,
                name,
              },
            }),
        ),

      prisma.user
        .findUnique({
          where: { id: me.id },
        })
        .then(
          (u) =>
            u ||
            prisma.user.create({
              data: {
                id: me.id,
                name: username,
                avatar,
                version: 1,
                Guild: {
                  connectOrCreate: {
                    where: { discordId: id },
                    create: {
                      id: nanoid(),
                      discordId: id,
                      name,
                    },
                  },
                },
              },
            }),
        ),
    ])

    const token = await new EncryptJWT({
      // userId: user.id,
      access_token,
      guild_id: id,
    })
      .setProtectedHeader({ alg: "dir", enc: "A128CBC-HS256" })
      .setExpirationTime(`${expires_in}s`)
      .encrypt(JWT_SECRET)

    cookies().set(COOKIE.TOKEN, token, {
      maxAge: expires_in,
      sameSite: "strict",
      secure: isProd(),
      httpOnly: true,
    })

    cookies().set(COOKIE.USER_ID, user.id, {
      maxAge: expires_in,
      sameSite: "strict",
      secure: isProd(),
      httpOnly: false,
    })

    return c.redirect(
      `/dash?${new URLSearchParams({
        g: guild.id,
      })}`,
    )
  },
)
