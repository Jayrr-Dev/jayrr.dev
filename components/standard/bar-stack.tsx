import { cn } from "cn"

function BarStack({
  className,
  segments,
}: {
  className?: string
  segments: { id: string; value: number; className?: string }[]
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0)

  return (
    <div
      data-slot="bar-stack"
      className={cn("flex h-3 w-full overflow-hidden rounded-full bg-muted", className)}
    >
      {segments.map((segment) => {
        const width = total === 0 ? 0 : (segment.value / total) * 100

        return (
          <span
            key={segment.id}
            className={cn("h-full bg-primary", segment.className)}
            style={{ width: `${width}%` }}
          />
        )
      })}
    </div>
  )
}

export { BarStack }

// Moved to their own files; re-exported so existing imports keep working.
export { Alert } from "@/components/standard/alert"
export { BroadcastBanner } from "@/components/standard/broadcast-banner"
export { Kbd } from "@/components/standard/kbd"
export { LoadingState, Spinner } from "@/components/standard/loading-state"
