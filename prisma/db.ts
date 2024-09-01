import { getRequestContext } from "@cloudflare/next-on-pages"
import { PrismaD1 } from "@prisma/adapter-d1"
import { PrismaClient } from "@prisma/client"

const { env } = getRequestContext()

const adapter = new PrismaD1(env.DB)

export const prisma = new PrismaClient({ adapter })
