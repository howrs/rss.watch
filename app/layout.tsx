import "app/globals.css"

import { ggSans } from "@/app/fonts/ggSans"
import { cn } from "@/lib/utils"
import { Providers } from "components/Providers"
import { HOST } from "constants/urls"
import type { Metadata } from "next"
import type { ReactNode } from "react"

type Props = {
  children: ReactNode
}

export const generateMetadata = async (): Promise<Metadata> => {
  const title = "Template"
  const description = "A Next.js template"

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://${HOST}`,
      siteName: title,
    },
  }
}

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en" className={cn("dark", ggSans.variable)}>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </head>
      <body className="flex h-dvh flex-col antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
