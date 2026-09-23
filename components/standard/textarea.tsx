"use client"

import * as React from "react"
import { cn } from "cn"

function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "h-20 w-full rounded-lg border border-input bg-transparent px-2 py-1 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
