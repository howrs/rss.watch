import { SideNav } from "@/components/SideNav"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useMe } from "@/hooks/useMe"
import { useSidePanel } from "@/hooks/useSidePanel"
import { useSyncChannels } from "@/hooks/useSyncChannels"
import { cn } from "@/lib/utils"
import { COOKIE } from "constants/cookie"
import Cookies from "js-cookie"
import { LogOut, PanelLeft } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

export const Header = () => {
  const { push } = useRouter()
  const {
    me: { avatar, name, id },
  } = useMe()

  useSyncChannels()

  const [open, setOpen] = useSidePanel()

  return (
    <header className="flex h-10 items-center border-b-[0.5px]">
      <Drawer direction="left" open={open} onOpenChange={setOpen}>
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
          className={cn(
            "h-full w-56 min-w-56 rounded-none border-t-0 border-b-0 border-l-0",
            "border-r-[0.5px]",
            "!duration-200 !ease-[cubic-bezier(.1,1,.2,1)]",
          )}
          asChild
        >
          <aside className="px-3">
            <DrawerTitle className="sr-only">Side Panel</DrawerTitle>
            <DrawerDescription className="sr-only" />
            <div className="h-10" />
            <div className="h-10">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="gap-1.5" variant="ghost">
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
                      Cookies.remove(COOKIE.TOKEN)
                      Cookies.remove(COOKIE.USER_ID)
                      setOpen(false)
                      push("/")
                    }}
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <SideNav />
          </aside>
        </DrawerContent>
      </Drawer>
    </header>
  )
}
