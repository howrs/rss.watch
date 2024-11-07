import { JWTSchema } from "@/app/a/[[...route]]/oauth/discord"
import { getEntityKey } from "@/lib/rc/getEntityKey"
import { fromEntries, map, pipe, toArray } from "@fxts/core"
import { COOKIE } from "constants/cookie"
import { JWT_SECRET } from "constants/secrets"
import type { Context } from "hono"
import { jwtDecrypt } from "jose"
import { cookies } from "next/headers"
import { deflate, inflate } from "pako"
import { db } from "prisma/db"
import type { PatchOperation, PullResponseOKV1 } from "replicache"
import { nullable, number, object, parse, string } from "valibot"

const lSchema = object({
  clientGroupID: string(),
  cookie: nullable(number()),
})

export const l = async (c: Context) => {
  const { req, redirect, json } = c
  const { prisma } = db

  const body = parse(
    lSchema,
    JSON.parse(inflate(await req.arrayBuffer(), { to: "string" })),
  )

  const { cookie, clientGroupID } = body

  const prevVersion = cookie ?? 0

  const ck = await cookies()

  const userId = ck.get(COOKIE.USER_ID)?.value
  const token = ck.get(COOKIE.TOKEN)?.value

  if (!token || !userId) {
    return c.redirect("/")
  }

  const { payload } = await jwtDecrypt(token, JWT_SECRET)

  const { g: guildId } = parse(JWTSchema, payload)

  const [guild, users] = await Promise.all([
    prisma.guild.findUnique({
      where: {
        id: guildId,
      },
      include: {
        ClientGroup: {
          where: {
            id: clientGroupID,
            guildId,
          },
          include: {
            Client: {
              where: {
                version: {
                  gt: prevVersion,
                },
              },
              select: {
                id: true,
                lastMutationID: true,
              },
            },
          },
        },
        Channel: {
          where: {
            version: {
              gt: prevVersion,
            },
            ...(prevVersion === 0 ? { deleted: false } : {}),
          },
          select: {
            id: true,
            type: true,
            name: true,
            parentId: true,
            position: true,
            discordId: true,
            deleted: true,
          },
        },
        Feed: {
          where: {
            version: {
              gt: prevVersion,
            },
            ...(prevVersion === 0 ? { deleted: false } : {}),
          },
          select: {
            id: true,
            type: true,
            value: true,
            faviconUrl: true,
            xmlUrl: true,
            channelId: true,
            order: true,
            enabled: true,
            deleted: true,
          },
        },
        Webhook: {
          where: {
            version: {
              gt: prevVersion,
            },
            ...(prevVersion === 0 ? { deleted: false } : {}),
          },
          select: {
            id: true,
            url: true,
            channelId: true,
            deleted: true,
          },
        },
      },
    }),
    prisma.user.findMany({
      where: {
        GuildToUser: {
          some: {
            guildId,
          },
        },
        version: {
          gt: prevVersion,
        },
        ...(prevVersion === 0 ? { deleted: false } : {}),
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        deleted: true,
      },
    }),
  ])

  if (!guild) {
    return json({ error: "Guild not found" })
  }

  const clients = guild.ClientGroup[0]?.Client ?? []
  const channels = guild.Channel ?? []
  const feeds = guild.Feed ?? []
  // const users = guild.User ?? []
  const webhooks = guild.Webhook ?? []

  const totalCount =
    2 + [...clients, ...feeds, ...users, ...channels, ...webhooks].length

  console.error({ totalRead: totalCount })

  const compressed = deflate(
    JSON.stringify({
      cookie: guild.version,
      lastMutationIDChanges: pipe(
        clients,
        map(({ id, lastMutationID }) => [id, lastMutationID] as const),
        fromEntries,
      ),
      patch: [
        ...pipe(
          [...feeds, ...users, ...channels, ...webhooks],
          map(({ deleted, id, ...data }) =>
            deleted
              ? ({
                  op: "del",
                  key: getEntityKey({ id, ...data }),
                } satisfies PatchOperation)
              : ({
                  op: "put",
                  key: getEntityKey({ id, ...data }),
                  value: {
                    id,
                    ...data,
                  },
                } satisfies PatchOperation),
          ),
          toArray,
        ),
        ...(prevVersion === 0
          ? [
              {
                op: "put",
                key: `guild`,
                value: {
                  id: guild.id,
                  discordId: guild.discordId,
                  name: guild.name,
                  icon: guild.icon,
                  version: guild.version,
                },
              } satisfies PatchOperation,
            ]
          : []),
      ],
    } satisfies PullResponseOKV1),
  )

  return c.newResponse(compressed)
}
