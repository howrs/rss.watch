"use client"

import { Badge } from "@/components/ui/badge"
import { SidebarMenuButton } from "@/components/ui/sidebar"
import { useChannel } from "@/hooks/useChannel"
import { useFeeds } from "@/hooks/useFeeds"
import { separator, useSearchParam } from "@/hooks/useSearchParams"
import type { Channel } from "@prisma/client"
import { Hash } from "lucide-react"
import Link from "next/link"
import type { DeepReadonlyObject } from "replicache"

type Props = {
  k: string
  v: DeepReadonlyObject<Omit<Channel, "createdAt" | "updatedAt">>
}

export function SideChannelButton({ k, v }: Props) {
  const { g, c } = useSearchParam()

  const { feeds } = useFeeds(v.id)

  const numberOfEnabledFeeds = feeds.filter(([, f]) => f.enabled).length

  const numberOfDisabledFeeds = feeds.length - numberOfEnabledFeeds

  return (
    <SidebarMenuButton
      asChild
      isActive={v.id === c}
      key={k}
      className="flex cursor-default justify-start gap-1 hover:bg-sidebar-accent/60 active:bg-sidebar-accent/100"
    >
      <Link href={`/d#${g}${separator}${v.id}`}>
        <Hash className="h-4 w-4" />
        {v.name}
        <div className="grow" />
        <div className="flex gap-1.5">
          {numberOfDisabledFeeds > 0 && (
            <Badge
              className="h-4 w-fit bg-red-400 px-1.5 font-bold"
              variant="default"
            >
              {numberOfDisabledFeeds}
            </Badge>
          )}
          <Badge
            className="h-4 w-fit bg-green-400 px-1.5 font-bold"
            variant="default"
          >
            {numberOfEnabledFeeds}
          </Badge>
        </div>
      </Link>
    </SidebarMenuButton>
  )
}
