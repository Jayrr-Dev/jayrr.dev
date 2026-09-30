import * as React from "react"
import { cn } from "cn"

function ControlBar({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="control-bar"
      className={cn(
        "flex w-full flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/40 px-2 py-1.5",
        className
      )}
      {...props}
    />
  )
}

export { ControlBar }
