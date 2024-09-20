import { SideNav } from "@/components/SideNav"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useMe } from "@/hooks/useMe"
import { PanelLeft } from "lucide-react"
import Image from "next/image"

export const Header = () => {
  const {
    me: { avatar, name, id },
  } = useMe()

  return (
    <header className="flex h-10 items-center">
      <Drawer direction="left">
        <DrawerTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="p-2 opacity-80 hover:bg-transparent hover:opacity-100"
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
        </DrawerTrigger>
        <DrawerContent
          className="h-full w-56 min-w-56 rounded-none border-none"
          style={{
            borderRight: "0.5px solid",
            borderColor: "lch(16.16 3.54 272)",
          }}
        >
          <nav className="px-3">
            <div className="h-10" />
            <div className="h-10">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="gap-1.5" variant="ghost">
                    <Image
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
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Billing</DropdownMenuItem>
                  <DropdownMenuItem>Team</DropdownMenuItem>
                  <DropdownMenuItem>Subscription</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <SideNav />
          </nav>
        </DrawerContent>
      </Drawer>
    </header>
  )
}
