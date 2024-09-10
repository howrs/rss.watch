import { isServer } from "@/utils/isServer"
import { HOST } from "constants/urls"
import { isLocal } from "utils/isLocal"
import { isProd } from "utils/isProd"

export const getBaseURL = (): string => {
  if (isServer()) {
    if (isProd()) {
      return `https://${HOST}`
    } else if (isLocal()) {
      return `http://localhost:8080`
    }
  }

  if (globalThis.location.host.includes(HOST)) {
    return `http://${HOST}`
  }

  return globalThis.location.origin
}
