import { handle } from "hono/vercel"
import { app } from "./app.ts"

export const runtime = "edge"

import "./l.ts"
import "./p.ts"
import "./guild.ts"
// import "./test.ts"

export const GET = handle(app)
export const POST = handle(app)
