import localFont from "next/font/local"

export const ggSans = localFont({
  src: [
    {
      path: "./GG-Sans-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./GG-Sans-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./GG-Sans-SemiBold.woff2",
      weight: "600",
      style: "italic",
    },
    {
      path: "./GG-Sans-Bold.woff2",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-gg-sans",
})
