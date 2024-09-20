"use client"

import { FullScreenLoader } from "@/components/FullScreenLoader"
import { Header } from "@/components/Header"
import { useRCache } from "@/hooks/useRCache"
import { useIsClient } from "@uidotdev/usehooks"
import type { PropsWithChildren } from "react"
import { useSubscribe } from "replicache-react"

type Props = PropsWithChildren

export default function Layout({ children }: Props) {
  const isClient = useIsClient()

  if (!isClient) {
    return <FullScreenLoader />
  }

  return (
    <RCache>
      <Header />
      {children}
    </RCache>
  )
}

const RCache = ({ children }: PropsWithChildren) => {
  const { r } = useRCache()

  const isEmpty = useSubscribe(
    r,
    async (tx) => {
      return !(await tx.has("guild"))
    },
    { default: true },
  )

  if (isEmpty) {
    return <FullScreenLoader />
  }

  return <>{children}</>
}
