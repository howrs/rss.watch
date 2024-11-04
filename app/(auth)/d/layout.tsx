"use client"

import { AppSidebar } from "@/components/AppSidebar"
import { ModeToggle } from "@/components/ModeToggle"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { rep } from "@/lib/rc/RC"
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query"
import type { PropsWithChildren } from "react"

type Props = PropsWithChildren

export default function Layout({ children }: Props) {
  const { data } = useSuspenseQuery(
    queryOptions({
      queryKey: ["loaded"],
      queryFn: () =>
        new Promise<boolean>(async (resolve) => {
          const data = await rep.query((tx) => tx.has("guild"))

          if (data) {
            console.log("test")
            resolve(true)
            return
          }

          const unsub = rep.subscribe((tx) => tx.has("guild"), {
            onData: (data) => {
              if (data) {
                console.log("test2")
                resolve(data)
                unsub()
              }
            },
          })
        }),
    }),
  )

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
