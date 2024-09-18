import { app as route } from "@/app/a/[[...route]]/o"
import { vValidator } from "@hono/valibot-validator"
import { db } from "prisma/db"
import { object, string } from "valibot"

export const app = route.put(
  "/guild",
  vValidator(
    "json",
    object({
      id: string(),
      name: string(),
    }),
  ),
  async (c) => {
    const { req } = c
    const { prisma } = db
    const { id, name } = req.valid("json")

    const guild = await prisma.guild.upsert({
      where: {
        id,
      },
      create: {
        id,
        name,
        discordId: id,
      },
      update: {
        name,
      },
    })

    return c.json({
      data: guild,
      success: true,
    })
  },
)
