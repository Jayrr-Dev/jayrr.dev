import * as React from "react"
import { cn } from "cn"

function Code({ className, ...props }: React.ComponentProps<"code">) {
  return (
    <code
      data-slot="code"
      className={cn(
        "relative rounded bg-muted px-2 py-1 font-mono text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Code }
