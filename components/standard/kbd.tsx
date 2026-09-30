import * as React from "react"
import { cn } from "cn"

function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]",
        className
      )}
      {...props}
    />
  )
}

export { Kbd }
