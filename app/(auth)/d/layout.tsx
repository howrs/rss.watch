"use client"

import { AppSidebar } from "@/components/AppSidebar"
import { FullScreenLoader } from "@/components/FullScreenLoader"
import { ModeToggle } from "@/components/ModeToggle"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { useSyncChannels } from "@/hooks/useSyncChannels"
import { rep } from "@/lib/rc/RC"
import type { Channel } from "@prisma/client"
import { queryOptions, useQuery, useSuspenseQuery } from "@tanstack/react-query"
import type { PropsWithChildren } from "react"
import type { ReadTransaction } from "replicache"

type Props = PropsWithChildren

export default function Layout({ children }: Props) {
  // useSyncChannels()

  const { data } = useQuery(
    queryOptions({
      queryKey: ["loaded"],
      queryFn: () =>
        new Promise<boolean>(async (resolve) => {
          const query = async (tx: ReadTransaction) => {
            const hasGuild = await tx.has("guild")
            // const channels = await tx
            //   .scan<Omit<Channel, "createdAt" | "updatedAt">>({
            //     prefix: "channel/",
            //   })
            //   .toArray()
            // const hasChannels = channels.filter((v) => v.type === 0).length > 0

            return hasGuild
            // && hasChannels
          }
          const data = await rep.query(query)

          if (data) {
            resolve(true)
            return
          }

          const unsub = rep.subscribe(query, {
            onData: (data) => {
              if (data) {
                resolve(data)
                unsub()
              }
            },
          })
        }),
      // gcTime: 1000 * 60 * 5,
      staleTime: Infinity,
    }),
  )

  if (!data) {
    return <FullScreenLoader />
  }

  return (
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
  )
}
