import { mutator } from "@/app/a/[[...route]]/mutator"
import { poke } from "@/lib/poke"
import { mutators } from "@/lib/rc/mutators"
import { indexBy, keys, pipe } from "@fxts/core"
import type { Prisma } from "@prisma/client"
import { COOKIE } from "constants/cookie"
import type { Context } from "hono"
import { cookies } from "next/headers"
import { inflate } from "pako"
import { db } from "prisma/db"
import { any, array, number, object, parse, picklist, string } from "valibot"

const pSchema = object({
  g: string(),
  clientGroupID: string(),
  mutations: array(
    object({
      clientID: string(),
      id: number(),
      name: picklist([...keys(mutators)]),
      timestamp: number(),
      args: any(),
    }),
  ),
})

export const p = async (c: Context) => {
  const { req } = c
  const { prisma } = db

  const body = parse(
    pSchema,
    JSON.parse(inflate(await req.arrayBuffer(), { to: "string" })),
  )

  const { clientGroupID, mutations, g: guildId } = body

  const userId = cookies().get(COOKIE.USER_ID)?.value

  if (!userId) {
    return c.redirect("/")
  }

  const defaultClientGroup = {
    id: clientGroupID,
    guildId,
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const sqls: Prisma.PrismaPromise<any>[] = []

  const guild = await prisma.guild.findUnique({
    where: {
      id: guildId,
    },
    include: {
      ClientGroup: {
        where: {
          id: {
            equals: clientGroupID,
          },
        },
        include: {
          Client: {
            where: {
              id: {
                in: [...new Set(mutations.map((m) => m.clientID))],
              },
            },
          },
        },
      },
    },
  })

  if (!guild) {
    return c.json({ error: "Guild not found" })
  }

  const clientGroup = guild.ClientGroup[0] || defaultClientGroup
  const clients = guild.ClientGroup[0]?.Client || []

  const indexedClients = pipe(
    clients,
    indexBy((c) => c.id),
  )

  const prevVersion = guild.version
  const nextVersion = prevVersion + 1
  const lastMutationIDs = new Map<string, number>([])

  for (const mutation of mutations) {
    const { id, name, clientID, args } = mutation

    const defaultClient = {
      id: clientID,
      clientGroupID: clientGroup.id,
      lastMutationID: 0,
      version: prevVersion,
    }

    const client = indexedClients[clientID] || defaultClient

    // if (mutation.id > 1 && !indexedClients[clientID]) {
    //   console.error("Client not found", clientID)
    //   return c.json({ error: "ClientStateNotFound" })
    // }

    const nextMutationID = client.lastMutationID + 1

    lastMutationIDs.set(client.id, nextMutationID)

    if (id < nextMutationID) {
      console.warn(`Mutation ${id} has already been processed - skipping`)
      continue
    }
    if (id > nextMutationID) {
      console.warn(`Mutation ${id} is from the future - aborting`)
      break
    }

    sqls.push(...mutator[name]({ guildId, version: nextVersion, args }))

    client.lastMutationID = nextMutationID
  }

  const sqlss: Prisma.PrismaPromise<any>[] = [
    prisma.guild.updateMany({
      where: {
        id: guildId,
      },
      data: {
        version: nextVersion,
      },
    }),
    ...(guild?.ClientGroup[0]
      ? []
      : // prisma.clientGroup.updateMany({
        //     where: {
        //       id: clientGroup.id,
        //     },
        //     data: {
        //       guildId,
        //       userId,
        //     },
        //   })
        [
          prisma.clientGroup.create({
            data: {
              id: clientGroup.id,
              guildId,
              userId,
            },
          }),
        ]),

    ...[...new Set(mutations.map((c) => c.clientID))].map((id) =>
      indexedClients[id]
        ? prisma.client.updateMany({
            where: {
              id,
            },
            data: {
              clientGroupId: clientGroup.id,
              lastMutationID: lastMutationIDs.get(id) || 0,
              version: nextVersion,
            },
          })
        : prisma.client.create({
            data: {
              id,
              clientGroupId: clientGroup.id,
              lastMutationID: lastMutationIDs.get(id) || 0,
              version: nextVersion,
            },
          }),
    ),
  ]

  sqls.push(...sqlss)

  await prisma.$transaction(sqls)

  await Promise.all([poke({ g: guildId }).catch(console.warn)])

  const reads = 2 + clients.length
  const writes = 1 + clients.length + mutations.length

  console.error({
    reads,
    writes,
  })

  return c.text("")
}
