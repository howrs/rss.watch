"use client"

import { FullScreenLoader } from "@/components/FullScreenLoader"
import { useMounted } from "@/hooks/use-mounted"
import type { PropsWithChildren } from "react"

type Props = PropsWithChildren

export default function Layout({ children }: Props) {
  const mounted = useMounted()

  if (!mounted) {
    return <FullScreenLoader />
  }

  return <>{children}</>
}
