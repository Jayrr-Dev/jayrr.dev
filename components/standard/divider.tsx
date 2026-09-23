import * as React from "react"
import { cn } from "cn"

function Divider({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<"div"> & {
  orientation?: "horizontal" | "vertical"
}) {
  return (
    <div
      data-slot="divider"
      data-orientation={orientation}
      role="separator"
      className={cn(
        "shrink-0 bg-border",
        orientation === "vertical" ? "h-full w-px self-stretch" : "h-px w-full",
        className
      )}
      {...props}
    />
  )
}

export { Divider }
