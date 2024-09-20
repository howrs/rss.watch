import { app } from "@/app/a/[[...route]]/channels"
import { handle } from "hono/vercel"

export const runtime = "edge"

export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)

export type AppType = typeof app
