import * as React from "react"
import { cn } from "cn"

import { Card } from "@/components/standard/card"

// Reproduces the old look on top of Card: a centred title over a full-width
// rule, then the meta line and the body, each with their own padding.
const STANDARD_CARD_CLASS = cn(
  "gap-0",
  "*:data-[slot=card-header]:gap-0",
  "[&>[data-slot=card-header]>[data-slot=card-title]]:border-b [&>[data-slot=card-header]>[data-slot=card-title]]:border-border [&>[data-slot=card-header]>[data-slot=card-title]]:px-3 [&>[data-slot=card-header]>[data-slot=card-title]]:py-2 [&>[data-slot=card-header]>[data-slot=card-title]]:text-center [&>[data-slot=card-header]>[data-slot=card-title]]:text-sm",
  "[&>[data-slot=card-header]>[data-slot=card-meta]]:px-3 [&>[data-slot=card-header]>[data-slot=card-meta]]:pt-2"
)

/** @deprecated Use <Card title meta padding="none"> */
function StandardCard({
  className,
  title,
  meta,
  children,
  ...props
}: React.ComponentProps<"article"> & {
  title: string
  meta?: string
}) {
  return (
    <Card
      data-slot="standard-card"
      padding="none"
      title={title}
      meta={meta || undefined}
      className={cn(STANDARD_CARD_CLASS, className)}
      {...props}
    >
      <div className="px-3 py-2 text-sm">{children}</div>
    </Card>
  )
}

export { StandardCard }
