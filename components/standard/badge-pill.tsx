import * as React from "react"
import { cn } from "cn"

import { Badge } from "@/components/standard/badge"

function BadgePill({
  className,
  ...props
}: React.ComponentProps<typeof Badge>) {
  return (
    <Badge
      data-slot="badge-pill"
      className={cn("rounded-full px-3", className)}
      {...props}
    />
  )
}

function CircleBadge({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="circle-badge"
      className={cn(
        "inline-grid h-[1.5em] min-w-[1.5em] shrink-0 place-items-center rounded-full bg-primary px-[0.25em] text-[0.75em] font-semibold leading-none text-primary-foreground tabular-nums",
        className
      )}
      {...props}
    />
  )
}

function BadgeIcon({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Badge>) {
  return (
    <Badge
      data-slot="badge-icon"
      className={cn("gap-1", className)}
      {...props}
    >
      {children}
    </Badge>
  )
}

export { BadgeIcon, BadgePill, CircleBadge }
