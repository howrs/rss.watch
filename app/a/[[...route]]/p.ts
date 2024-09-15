import { app as route } from "@/app/a/[[...route]]/l"
import { poke } from "@/lib/poke"
import { indexBy, pipe } from "@fxts/core"
import { vValidator } from "@hono/valibot-validator"
import type { Prisma } from "@prisma/client"
import { cookies } from "next/headers"
import { db } from "prisma/db"
import { any, array, number, object, string } from "valibot"

export const app = route.post(
  "/p",
  vValidator(
    "json",
    object({
      g: string(),
      clientGroupID: string(),
      mutations: array(
        object({
          clientID: string(),
          id: number(),
          name: string(),
          timestamp: number(),
          args: any(),
        }),
      ),
    }),
  ),
  async (c) => {
    const { prisma } = db

    const { clientGroupID, mutations, g: guildId } = c.req.valid("json")

    const userId = cookies().get("user_id")?.value

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

      if (name === "createChannel") {
        sqls.push(
          prisma.channel.createMany({
            data: {
              id: args.id,
              type: args.type,
              name: args.name,
              parentId: args.parentId,
              position: args.position,
              guildId,
              version: nextVersion,
            },
          }),
        )
      } else if (name === "deleteChannel") {
        sqls.push(
          prisma.channel.updateMany({
            where: {
              id: args.split("/")[1],
            },
            data: {
              deleted: true,
              version: nextVersion,
            },
          }),
        )
      }

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
  },
)
