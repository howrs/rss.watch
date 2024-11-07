"use client"

import { Button } from "@/components/ui/button"
import { discordLogin } from "@/lib/discordLogin"
import { getBaseURL } from "@/utils/getBaseURL"
import { DISCORD_CLIENT_ID } from "constants/discord"
import { REDIRECT_PATH } from "constants/urls"
import { useRouter } from "next/navigation"

export default function Page() {
  const { push } = useRouter()

  return (
    <div className="m-2 p-2 text-2xl">
      <div className="">
        <Button
          className="gap-1.5 bg-[#5865F2] text-foreground hover:bg-[#5865F2BB]"
          // asChild
          onClick={async () => {
            const result = await discordLogin({
              clientId: DISCORD_CLIENT_ID,
              redirectUrl: `${getBaseURL()}${REDIRECT_PATH}`,
              permissions: "536870912",
              responseType: "code",
              scope: ["identify", "bot"].join(" "),
              // integration_type: "1",
            })

            console.log(result)

            if ("code" in result) {
              push(
                `/a/oauth/discord?${new URLSearchParams({
                  code: result.code,
                })}`,
              )
            }
          }}
        >
          {/* <a href={href}> */}
          {/* <IconBrandDiscord className="aspect-square h-5 w-5" /> */}
          Continue with Discord
          {/* </a> */}
        </Button>
      </div>
    </div>
  )
}
