"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useChannel } from "@/hooks/useChannel"
import { useGuild } from "@/hooks/useGuild"
import { Image } from "components/Image"

export function StatusBar() {
  const { guild } = useGuild()

  return (
    <section className="sticky top-10 z-50 flex h-10 items-center gap-1.5 border-b-[0.5px] bg-background/95 px-2.5 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Breadcrumb>
        <BreadcrumbList className="font-mono text-xs">
          <BreadcrumbItem>
            <BreadcrumbPage className="flex gap-2.5">
              <Image
                src={`https://cdn.discordapp.com/icons/${guild.discordId}/${guild.icon}.webp?size=64`}
                className="h-5 w-5 rounded-full"
                width={128}
                height={128}
                alt={guild.name}
              />
              <span className="select-none self-center">{guild.name}</span>
            </BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <ChannelName />
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </section>
  )
}

const ChannelName = () => {
  const { channel } = useChannel()

  return <BreadcrumbPage className="select-none">{channel.name}</BreadcrumbPage>
}
