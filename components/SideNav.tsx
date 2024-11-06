"use client"

import { SideChannelButton } from "@/components/SideChannelButton"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { useChannels } from "@/hooks/useChannels"
import { filter, map, pipe, sort, toArray } from "@fxts/core"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible"
import { ChevronDown } from "lucide-react"

export function SideNav() {
  const { channels } = useChannels()

  return (
    <div className="flex flex-col gap-2 font-sans text-xs">
      <div className="flex flex-col">
        {pipe(
          channels,
          filter(([, v]) => v.type === 0),
          filter(([, c]) => c.parentId == null),
          sort(([, a], [_, b]) => a.position - b.position),
          map(([k, v]) => <SideChannelButton key={k} k={k} v={v} />),
          toArray,
        )}
      </div>
      {pipe(
        channels,
        filter(([, v]) => v.type === 4),
        sort(([, a], [_, b]) => a.position - b.position),
        map(([k, v]) =>
          pipe(
            channels,
            filter(([, v]) => v.type === 0),
            filter(([, c]) => v.discordId === c.parentId),
            toArray,
          ).length > 0 ? (
            <Collapsible key={k} defaultOpen className="">
              <SidebarGroup className="p-0">
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger className="group flex cursor-default gap-1 font-mono font-semibold uppercase">
                    <ChevronDown className="h-4 w-4 transition group-data-[state=closed]:rotate-[-90deg]" />
                    {v.name}
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    {pipe(
                      channels,
                      filter(([, v]) => v.type === 0),
                      filter(([, c]) => v.discordId === c.parentId),
                      sort(([, a], [_, b]) => a.position - b.position),
                      map(([k, v]) => (
                        <SideChannelButton key={k} k={k} v={v} />
                      )),
                      toArray,
                    )}
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          ) : null,
        ),
        toArray,
      )}
    </div>
  )
}
