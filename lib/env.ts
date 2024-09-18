import { getRequestContext } from "@cloudflare/next-on-pages"

export const env = new Proxy<CloudflareEnv>({} as CloudflareEnv, {
  get(target, prop, receiver) {
    const { env } = getRequestContext()

    return env[prop as keyof CloudflareEnv]
  },
})
