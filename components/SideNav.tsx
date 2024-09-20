"use client"

import { Button } from "@/components/ui/button"
import { useChannels } from "@/hooks/useChannels"
import { useSyncChannels } from "@/hooks/useSyncChannels"
import { filter, map, pipe, sort, toArray } from "@fxts/core"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible"
import { ChevronDown, Hash } from "lucide-react"

export function SideNav() {
  const { channels } = useChannels()

  useSyncChannels()

  return (
    <div className="flex flex-col font-mono text-xs">
      <div className="flex flex-col">
        {pipe(
          channels,
          filter(([, v]) => v.type === 0),
          filter(([, c]) => c.parentId == null),
          sort(([, a], [_, b]) => a.position - b.position),
          map(([k, v]) => (
            <Button key={k} variant="ghost" className="justify-start gap-1">
              <Hash className="h-4 w-4" />
              {v.name}
            </Button>
          )),
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
            filter(([, c]) => v.id === c.parentId),
            toArray,
          ).length > 0 ? (
            <Collapsible key={k} defaultOpen className="my-3">
              <CollapsibleTrigger className="group flex gap-1 uppercase">
                <ChevronDown className="h-4 w-4 transition group-data-[state=closed]:rotate-[-90deg]" />
                {v.name}
              </CollapsibleTrigger>
              <CollapsibleContent className="flex flex-col py-1">
                {pipe(
                  channels,
                  filter(([, v]) => v.type === 0),
                  filter(([, c]) => v.id === c.parentId),
                  sort(([, a], [_, b]) => a.position - b.position),
                  map(([k, v]) => (
                    <Button
                      key={k}
                      variant="ghost"
                      className="justify-start gap-1"
                    >
                      <Hash className="h-4 w-4" />
                      {v.name}
                    </Button>
                  )),
                  toArray,
                )}
              </CollapsibleContent>
            </Collapsible>
          ) : null,
        ),
        toArray,
      )}
    </div>
  )
}
