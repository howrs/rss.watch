import { getEntityKey } from "@/lib/rc/getEntityKey"
import { fromEntries, map, pipe, toArray } from "@fxts/core"
import { COOKIE } from "constants/cookie"
import type { Context } from "hono"
import { cookies } from "next/headers"
import { deflate, inflate } from "pako"
import { db } from "prisma/db"
import type { PatchOperation, PullResponseOKV1 } from "replicache"
import { nullable, number, object, parse, string } from "valibot"

const lSchema = object({
  g: string(),
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

  const { cookie, clientGroupID, g: guildId } = body

  const prevVersion = cookie ?? 0

  const userId = cookies().get(COOKIE.USER_ID)?.value

  if (!userId) {
    return redirect("/")
  }

  const guild = await prisma.guild.findUnique({
    where: {
      id: guildId,
    },
    include: {
      User: {
        where: {
          // id: userId,
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
      },
      ClientGroup: {
        where: {
          id: clientGroupID,
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
          deleted: true,
        },
      },
    },
  })

  if (!guild) {
    return json({ error: "Guild not found" })
  }

  const clients = guild.ClientGroup[0]?.Client ?? []
  const channels = guild.Channel ?? []
  const feeds = guild.Feed ?? []
  const users = guild.User ?? []

  const totalCount = 2 + clients.length + channels.length + feeds.length

  console.error({
    totalCount,
    clients: clients.length,
    channels: channels.length,
    feeds: feeds.length,
  })

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
          [...channels, ...feeds, ...users],
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
        ...(guild.version > prevVersion
          ? [
              {
                op: "put",
                key: "guild",
                value: {
                  id: guild.id,
                  name: guild.name,
                },
              } satisfies PatchOperation,
            ]
          : []),
      ],
    } satisfies PullResponseOKV1),
  )

  return c.newResponse(compressed)
}
