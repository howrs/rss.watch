import { handle } from "hono/vercel"
import { app } from "./app.ts"

import "./l.ts"
import "./p.ts"
import "./guild.ts"
import "./test.ts"

export const runtime = "edge"

export const GET = handle(app)
export const POST = handle(app)
