import { fromEntries, map, pipe, toArray } from "@fxts/core"
import { vValidator } from "@hono/valibot-validator"
import { app as route } from "app/a/[[...route]]/app.ts"
import { db } from "prisma/db"
import type { PatchOperation, PullResponseOKV1 } from "replicache"
import { nullable, number, object, parse, string } from "valibot"

export const app = route.post(
  "/l",
  vValidator(
    "json",
    object({
      profileID: string(),
      clientGroupID: string(),
      cookie: nullable(number()),
      schemaVersion: string(),
    }),
  ),
  vValidator(
    "query",
    object({
      g: string(),
    }),
  ),
  async ({ req, json }) => {
    const { prisma } = db
    const { g: guildId } = req.valid("query")
    const { cookie, profileID, clientGroupID, schemaVersion } =
      req.valid("json")

    const prevVersion = cookie ?? 0

    // const defaultClientGroup = {
    //   id: clientGroupID,
    //   guildId,
    //   userId: profileID,
    //   createdAt: new Date(),
    //   updatedAt: new Date(),
    // }

    const guild = await prisma.guild.findUnique({
      where: {
        id: guildId,
      },
      include: {
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

    const clients = guild?.ClientGroup[0]?.Client ?? []
    const channels = guild?.Channel ?? []
    const feeds = guild?.Feed ?? []

    if (!guild) {
      return json({
        error: "Guild not found",
      })
    }

    const totalCount = 2 + clients.length + channels.length + feeds.length

    console.error({
      totalCount,
      clients: clients.length,
      channels: channels.length,
      feeds: feeds.length,
    })

    return json({
      cookie: guild.version,
      lastMutationIDChanges: pipe(
        clients,
        map(({ id, lastMutationID }) => [id, lastMutationID] as const),
        fromEntries,
      ),
      patch: pipe(
        [...channels, ...feeds],
        map(
          ({ deleted, id, ...data }) =>
            ({
              op: deleted ? "del" : "put",
              key: getEntityKey({ id, ...data }),
              value: {
                id,
                deleted,
                ...data,
              },
            }) satisfies PatchOperation,
        ),
        toArray,
      ),
    } satisfies PullResponseOKV1)
  },
)

const getEntityKey = (entity: any) => {
  if ("position" in entity) {
    return `channel/${entity.id}`
  }
  if ("value" in entity) {
    return `feed/${entity.id}`
  }

  throw new Error("Unknown entity")
}
