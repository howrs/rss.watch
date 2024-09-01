import { app } from "app/a/[[...route]]/app.ts"
import { db } from "prisma/db"

app.get("/test", async (c) => {
  const { prisma } = db
  const [guilds, users, clientGroups, channels, clients] =
    await prisma.$transaction([
      prisma.guild.findMany(),
      prisma.user.findMany(),
      prisma.clientGroup.findMany(),
      prisma.channel.findMany(),
      prisma.client.findMany(),
    ])

  return c.json({
    data: {
      clients,
      guilds,
      users,
      channels,
      clientGroups,
    },
    success: true,
  })
})

app.get("/clear", async (c) => {
  const { prisma } = db
  // clear all data
  await prisma.channel.deleteMany()
  await prisma.client.deleteMany()
  await prisma.clientGroup.deleteMany()
  await prisma.feed.deleteMany()
  await prisma.guild.deleteMany()
  await prisma.user.deleteMany()

  return c.json({
    success: true,
  })
})
