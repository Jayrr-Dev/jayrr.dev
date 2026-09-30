import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

// Presence colours are their own set so red "busy" never reads as a
// NotificationBadge. Offline is hollow, so the state is not colour-only.
const indicatorVariants = cva("inline-block shrink-0 rounded-full", {
  variants: {
    status: {
      online: "bg-success",
      away: "bg-warning",
      busy: "bg-destructive",
      offline:
        "bg-background shadow-[inset_0_0_0_2px] shadow-muted-foreground/60",
    },
    size: {
      sm: "size-2",
      default: "size-2.5",
      lg: "size-3.5",
    },
  },
  defaultVariants: {
    status: "online",
    size: "default",
  },
})

const STATUS_LABELS = {
  online: "Online",
  away: "Away",
  busy: "Busy",
  offline: "Offline",
} as const

/**
 * Presence dot. Wrap an avatar to pin it to the bottom-right corner, or render
 * it alone to sit inline; `showLabel` prints the status beside the dot.
 */
function Indicator({
  className,
  status = "online",
  size = "default",
  label,
  showLabel = false,
  children,
}: VariantProps<typeof indicatorVariants> & {
  className?: string
  label?: string
  showLabel?: boolean
  children?: React.ReactNode
}) {
  const text = label ?? STATUS_LABELS[status ?? "online"]

  const dot = (
    <span
      aria-hidden="true"
      data-slot="indicator"
      data-status={status}
      className={cn(
        indicatorVariants({ status, size }),
        children
          ? "absolute right-0 bottom-0 ring-2 ring-background"
          : undefined,
        className
      )}
    />
  )

  if (children) {
    return (
      <span data-slot="indicator-anchor" className="relative inline-flex">
        {children}
        {dot}
        <span className="sr-only">{text}</span>
      </span>
    )
  }

  return (
    <span
      data-slot="indicator-inline"
      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
    >
      {dot}
      <span className={showLabel ? undefined : "sr-only"}>{text}</span>
    </span>
  )
}

export { Indicator, indicatorVariants }
