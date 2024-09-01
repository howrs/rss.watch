import { getRequestContext } from "@cloudflare/next-on-pages"
import { PrismaD1 } from "@prisma/adapter-d1"
import { PrismaClient } from "@prisma/client"

export const db = new Proxy(
  {} as {
    prisma: PrismaClient<{
      adapter: PrismaD1
    }>
  },
  {
    get(target, prop, receiver) {
      const { env } = getRequestContext()

      const adapter = new PrismaD1(env.DB)

      const prisma = new PrismaClient({ adapter })

      return prisma
    },
  },
)
