import { handle } from 'hono/vercel'
import { app } from './app.ts'

import './hello.ts'

export const runtime = 'edge'

export const GET = handle(app)
export const POST = handle(app)
