import { poke } from "@/lib/poke"
import { indexBy, pipe } from "@fxts/core"
import { app } from "app/a/[[...route]]/app.ts"
import { db } from "prisma/db"
import { any, array, number, object, parse, string } from "valibot"

const pushRequest = object({
  guildId: string(),
  profileID: string(),
  clientGroupID: string(),
  pushVersion: number(),
  mutations: array(
    object({
      clientID: string(),
      id: number(),
      name: string(),
      timestamp: number(),
      args: any(),
    }),
  ),
})

app.post("/p", async (c) => {
  const { prisma } = db

  const body = await c.req.json()

  const { profileID, clientGroupID, mutations, pushVersion, guildId } = parse(
    pushRequest,
    { ...body, guildId: c.req.query("g") },
  )

  const defaultClientGroup = {
    id: clientGroupID,
    guildId,
    userId: profileID,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const clientG = await prisma.clientGroup.findUnique({
    where: {
      id: clientGroupID,
    },
    include: {
      guild: true,
      Client: {
        where: {
          id: {
            in: mutations.map((m) => m.clientID),
          },
        },
      },
    },
  })

  const guild = clientG?.guild
  const clientGroup = clientG || defaultClientGroup
  const clients = clientG?.Client || []

  const indexedClients = pipe(
    clients,
    indexBy((c) => c.id),
  )

  if (!guild || guild.id !== guildId) {
    return c.json({
      error: "Guild not found",
    })
  }

  const prevVersion = guild.version
  const nextVersion = prevVersion + 1
  const lastMutationIDs = new Map<string, number>([])

  for (const mutation of mutations) {
    const { id, name, clientID, args } = mutation

    const defaultClient = {
      id: clientID,
      clientGroupID: clientGroup.id,
      lastMutationID: 0,
      lastModifiedVersion: prevVersion,
    }

    const client = indexedClients[clientID] || defaultClient

    if (!client) {
      throw new Error(`Client not found: ${clientID}`)
    }

    const nextMutationID = client.lastMutationID + 1

    lastMutationIDs.set(clientID, nextMutationID)

    if (id < nextMutationID) {
      console.log(`Mutation ${id} has already been processed - skipping`)
      continue
    }
    if (id > nextMutationID) {
      console.warn(`Mutation ${id} is from the future - aborting`)
      break
    }

    if (name === "createChannel") {
      await prisma.channel
        .create({
          data: {
            id: args.id,
            type: args.type,
            name: args.name,
            parentId: args.parentId,
            position: args.position,
            guildId,
            lastModifiedVersion: nextVersion,
          },
        })
        .catch(console.log)
    } else if (name === "deleteChannel") {
      await prisma.channel
        .update({
          where: {
            id: args.split("/")[1],
          },
          data: {
            deleted: true,
            lastModifiedVersion: nextVersion,
          },
        })
        .catch(console.log)
    }

    client.lastMutationID = nextMutationID
  }

  await prisma.$transaction([
    prisma.guild.upsert({
      create: {
        id: guildId,
        name: "test guild",
        version: nextVersion,
      },
      update: {
        version: nextVersion,
      },
      where: {
        id: guildId,
      },
    }),
    prisma.clientGroup.upsert({
      where: {
        id: clientGroup.id,
      },
      create: {
        id: clientGroup.id,
        guild: {
          connect: {
            id: guildId,
          },
        },
        user: {
          connectOrCreate: {
            where: {
              id: profileID,
            },
            create: {
              id: profileID,
              username: "test",
            },
          },
        },
      },
      update: {
        guild: {
          connect: {
            id: guildId,
          },
        },
        user: {
          connectOrCreate: {
            where: {
              id: profileID,
            },
            create: {
              id: profileID,
              username: "test",
            },
          },
        },
      },
    }),
    ...mutations.map(({ clientID }) =>
      prisma.client.upsert({
        where: {
          id: clientID,
        },
        create: {
          id: clientID,
          clientGroupId: clientGroup.id,
          lastMutationID: lastMutationIDs.get(clientID) || 0,
          lastModifiedVersion: nextVersion,
        },
        update: {
          lastMutationID: lastMutationIDs.get(clientID) || 0,
          lastModifiedVersion: nextVersion,
        },
      }),
    ),
  ])

  poke(guildId)

  return c.json({
    success: true,
  })
})
