"use client"

import { useIsClient } from "@uidotdev/usehooks"
import type { PropsWithChildren } from "react"

type Props = PropsWithChildren

export default function Layout({ children }: Props) {
  let isClient = useIsClient()

  if (!isClient) {
    return <div>Loading...</div>
  }

  return children
}
