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
        "inline-flex size-6 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground",
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
