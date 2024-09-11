import { isServer } from "utils/isServer"

export const isLocal = () => {
  if (isServer()) {
    return process.env.NODE_ENV === "development"
  }

  return globalThis.location.host.includes("localhost")
}
