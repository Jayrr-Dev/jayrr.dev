import * as React from "react"
import { cn } from "cn"

function Progress({
  className,
  value = 0,
  max = 100,
  ...props
}: React.ComponentProps<"progress">) {
  return (
    <progress
      data-slot="progress"
      value={value}
      max={max}
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-muted [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-primary",
        className
      )}
      {...props}
    />
  )
}

export { Progress }
