import { Hono } from "hono"

export const app = new Hono().basePath("/a")
