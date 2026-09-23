import * as React from "react"
import { cn } from "cn"

function Checkbox({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="checkbox"
      type="checkbox"
      className={cn(
        "size-4 shrink-0 rounded-sm border border-input accent-primary outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Checkbox }
