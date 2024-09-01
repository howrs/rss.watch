import { app } from "app/a/[[...route]]/app.ts"
// import { prisma } from "prisma/db"
import { db } from "prisma/db"
import { object, parse, string } from "valibot"

const schema = object({
  name: string(),
})

app.post("/guild", async (c) => {
  const { prisma } = db
  const body = await c.req.json()

  const { name } = parse(schema, body)

  const guild = await prisma.guild.create({
    data: {
      id: crypto.randomUUID(),
      name,
    },
  })

  return c.json({
    data: guild,
    success: true,
  })
})

app.post("/user", async (c) => {
  const { prisma } = db
  // const body = await c.req.json()

  // const { name } = parse(schema, body)

  const user = await prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      username: "test",
    },
  })

  return c.json({
    data: user,
    success: true,
  })
})
