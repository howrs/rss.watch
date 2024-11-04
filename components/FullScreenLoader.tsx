import { Pulse } from "@/components/Pulse"

export const FullScreenLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex h-dvh w-full items-center justify-center bg-background">
      <Pulse className="h-10 w-10" />
    </div>
  )
}
