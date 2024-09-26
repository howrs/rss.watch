import { useChannel } from "@/hooks/useChannel"
import { useGuild } from "@/hooks/useGuild"
import { ChevronRight } from "lucide-react"
import Image from "next/image"

export function StatusBar() {
  const { guild } = useGuild()

  const { channel } = useChannel()

  return (
    <>
      <section className="flex h-10 items-center gap-1.5 border-b-[0.5px] px-4">
        <Image
          priority
          src={`https://cdn.discordapp.com/icons/${guild.discordId}/${guild.icon}.webp?size=64`}
          className="h-5 w-5 rounded-full"
          unoptimized
          width={128}
          height={128}
          alt={guild.name}
        />
        <span className="font-medium font-sans">{guild.name}</span>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium font-sans">{channel?.name}</span>
      </section>
    </>
  )
}
