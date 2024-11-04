import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev"
import { withContentCollections } from "@content-collections/next"

if (process.env.NODE_ENV === "development") {
  await setupDevPlatform({})
}

/** @type {import('next').NextConfig} */
const config = {
  async rewrites() {
    return [
      {
        source: "/p/:path*",
        destination: `https://:path*`,
        basePath: false,
      },
    ]
  },
  // reactStrictMode: false,
  compiler: {
    // removeConsole: true,
  },
}

export default withContentCollections(config)
