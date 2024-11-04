import NextImage from "next/image"
import type { ComponentProps } from "react"

type Props = {} & ComponentProps<typeof NextImage>

export const Image = ({ ...props }: Props) => {
  return (
    <NextImage
      //
      priority
      unoptimized
      {...props}
    />
  )
}
