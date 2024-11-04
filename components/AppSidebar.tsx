"use client"

import { SideNav } from "@/components/SideNav"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import { useMe } from "@/hooks/useMe"
import { useSyncChannels } from "@/hooks/useSyncChannels"
import { cookies } from "@/utils/cookie"
import { Image } from "components/Image"
import { COOKIE } from "constants/cookie"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export function AppSidebar() {
  const { push } = useRouter()
  const {
    me: { avatar, name, id },
  } = useMe()

  useSyncChannels()

  const { setOpen } = useSidebar()

  return (
    <Sidebar
      //
      className="ease-snappy"
      variant="floating"
      // collapsible="none"
    >
      <SidebarHeader className="">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-fit gap-1.5" variant="ghost">
              <Image
                priority
                src={`https://cdn.discordapp.com/avatars/${id}/${avatar}.webp?size=64`}
                className="h-4 w-4 rounded-full"
                unoptimized
                width={128}
                height={128}
                alt={name}
              />
              {name}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-1.5"
              onClick={() => {
                cookies.remove(COOKIE.TOKEN)
                cookies.remove(COOKIE.USER_ID)
                setOpen(false)
                push("/")
              }}
            >
              <LogOut className="h-3.5 w-3.5" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SideNav />
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}
