import type { getOAuth2Token } from "@/app/a/[[...route]]/oauth/getOAuth2Token"

export const getMe = async ({
  access_token,
  token_type,
}: Awaited<ReturnType<typeof getOAuth2Token>>) => {
  const me = await fetch(`https://discord.com/api/v10/users/@me`, {
    headers: {
      Authorization: `${token_type} ${access_token}`,
    },
  }).then<R>((r) => r.json())

  return me
}

export interface R {
  id: string
  username: string
  avatar: string
  discriminator: string
  public_flags: number
  flags: number
  banner: null
  accent_color: null
  global_name: string
  avatar_decoration_data: null
  banner_color: null
  clan: null
  mfa_enabled: boolean
  locale: string
  premium_type: number
}
