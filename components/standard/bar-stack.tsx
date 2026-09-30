import { cn } from "cn"

import { Progress } from "@/components/standard/progress"

/** @deprecated Use <Progress segments> */
function BarStack({
  className,
  segments,
}: {
  className?: string
  segments: { id: string; value: number; className?: string }[]
}) {
  // BarStack segments share the whole bar; Progress segments are out of max.
  const total = segments.reduce((sum, segment) => sum + segment.value, 0)

  return (
    <Progress
      data-slot="bar-stack"
      size="lg"
      max={total === 0 ? 1 : total}
      segments={segments}
      className={cn("w-full", className)}
    />
  )
}

export { BarStack }

// Moved to their own files; re-exported so existing imports keep working.
export { Alert } from "@/components/standard/alert"
export { BroadcastBanner } from "@/components/standard/broadcast-banner"
export { Kbd } from "@/components/standard/kbd"
export { LoadingState, Spinner } from "@/components/standard/loading-state"
