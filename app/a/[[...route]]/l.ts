import { fromEntries, map, pipe, toArray } from "@fxts/core"
import { Prisma } from "@prisma/client"
import { app } from "app/a/[[...route]]/app.ts"
// import { prisma } from "prisma/db"
import { db } from "prisma/db"
import type { ClientID, PatchOperation } from "replicache"
import { nullable, number, object, parse, string } from "valibot"

const pullRequest = object({
  profileID: string(),
  clientGroupID: string(),
  cookie: nullable(number()),
  schemaVersion: string(),
})

type PullResponse = {
  cookie: number
  lastMutationIDChanges: Record<ClientID, number>
  patch: PatchOperation[]
}

app.post("/l", async (c) => {
  const { prisma } = db
  const guildId = c.req.query("g")
  const body = await c.req.json()
  const { cookie, profileID, clientGroupID, schemaVersion } = parse(
    pullRequest,
    body,
  )
  const prevVersion = cookie ?? 0

  const defaultClientGroup = {
    id: body.clientGroupID,
    guildId,
    userId: profileID,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

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
              lastModifiedVersion: {
                gt: prevVersion,
              },
            },
          },
        },
      },
      Channel: {
        where: {
          lastModifiedVersion: {
            gt: prevVersion,
          },
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
          lastModifiedVersion: {
            gt: prevVersion,
          },
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

  // const clientGroup = clientG || defaultClientGroup

  if (!guild) {
    return c.json({
      error: "Guild not found",
    })
  }

  return c.json({
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
  } satisfies PullResponse)
})

const getEntityKey = (entity: any) => {
  if ("position" in entity) {
    return `channel/${entity.id}`
  }
  if ("value" in entity) {
    return `feed/${entity.id}`
  }

  throw new Error("Unknown entity")
}
