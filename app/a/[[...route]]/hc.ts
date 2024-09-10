import type { AppType } from "@/app/a/[[...route]]/route"
import { getBaseURL } from "@/utils/getBaseURL"
import { hc } from "hono/client"

export const c = hc<AppType>(getBaseURL()).a
