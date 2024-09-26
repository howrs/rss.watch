import { useSharedState } from "@/hooks/useSharedState"

export function useSidePanel() {
  return useSharedState(["sidePanel"], false)
}
