"use client"

import { AppSidebar } from "@/components/AppSidebar"
import { FullScreenLoader } from "@/components/FullScreenLoader"
import { ModeToggle } from "@/components/ModeToggle"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { useMounted } from "@/hooks/use-mounted"
import type { PropsWithChildren } from "react"

type Props = PropsWithChildren

export default function Layout({ children }: Props) {
  const mounted = useMounted()

  if (!mounted) {
    return <FullScreenLoader />
  }

  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <main className="h-min w-full">
          <header className="sticky top-0 z-50 flex h-10 items-center border-border/40 border-b bg-background/95 px-1.5 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-border">
            <SidebarTrigger />
            <div className="grow" />
            <ModeToggle />
          </header>
          {children}
        </main>
      </SidebarProvider>
    </>
  )
}
