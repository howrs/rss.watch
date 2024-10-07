import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useChannel } from "@/hooks/useChannel"
import { useGuild } from "@/hooks/useGuild"
import Image from "next/image"

export function StatusBar() {
  const { guild } = useGuild()

  const { channel } = useChannel()

  return (
    <>
      <section className="flex h-10 items-center gap-1.5 border-b-[0.5px] px-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="flex gap-1.5">
                <Image
                  priority
                  src={`https://cdn.discordapp.com/icons/${guild.discordId}/${guild.icon}.webp?size=64`}
                  className="h-5 w-5 rounded-full"
                  unoptimized
                  width={128}
                  height={128}
                  alt={guild.name}
                />
                <span className="">{guild.name}</span>
              </BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{channel?.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </section>
    </>
  )
}
