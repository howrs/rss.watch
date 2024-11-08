import { useEffect, useState } from "react"

const isBrowser = typeof window !== "undefined"

export function on<T extends Window | Document | HTMLElement | EventTarget>(
  obj: T | null,
  ...args: Parameters<T["addEventListener"]> | [string, Function | null, ...any]
): void {
  if (obj?.addEventListener) {
    obj.addEventListener(
      ...(args as Parameters<HTMLElement["addEventListener"]>),
    )
  }
}

export function off<T extends Window | Document | HTMLElement | EventTarget>(
  obj: T | null,
  ...args:
    | Parameters<T["removeEventListener"]>
    | [string, Function | null, ...any]
): void {
  if (obj?.removeEventListener) {
    obj.removeEventListener(
      ...(args as Parameters<HTMLElement["removeEventListener"]>),
    )
  }
}

const patchHistoryMethod = (method: string) => {
  const history = window.history
  // @ts-ignore
  const original = history[method]

  // @ts-ignore
  history[method] = (state: any) => {
    const result = original.apply(this, state)
    const event = new Event(method.toLowerCase())
    ;(event as any).state = state

    window.dispatchEvent(event)

    return result
  }
}

if (isBrowser) {
  patchHistoryMethod("pushState")
  patchHistoryMethod("replaceState")
}

export interface LocationSensorState {
  trigger: string
  state?: any
  length?: number
  hash?: string
  host?: string
  hostname?: string
  href?: string
  origin?: string
  pathname?: string
  port?: string
  protocol?: string
  search?: string
}

const useLocationServer = (): LocationSensorState => ({
  trigger: "load",
  length: 1,
})

const buildState = (trigger: string) => {
  const { state, length } = window.history

  const {
    hash,
    host,
    hostname,
    href,
    origin,
    pathname,
    port,
    protocol,
    search,
  } = window.location

  return {
    trigger,
    state,
    length,
    hash,
    host,
    hostname,
    href,
    origin,
    pathname,
    port,
    protocol,
    search,
  }
}

const useLocationBrowser = (): LocationSensorState => {
  const [state, setState] = useState(buildState("load"))

  useEffect(() => {
    const onPopstate = () => setState(buildState("popstate"))
    const onPushstate = () => setState(buildState("pushstate"))
    const onReplacestate = () => setState(buildState("replacestate"))

    on(window, "popstate", onPopstate)
    on(window, "pushstate", onPushstate)
    on(window, "replacestate", onReplacestate)

    return () => {
      off(window, "popstate", onPopstate)
      off(window, "pushstate", onPushstate)
      off(window, "replacestate", onReplacestate)
    }
  }, [])

  return state
}

const hasEventConstructor = typeof Event === "function"

export const useLocation =
  isBrowser && hasEventConstructor ? useLocationBrowser : useLocationServer
