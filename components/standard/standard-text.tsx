import * as React from "react"
import { cn } from "cn"

function StandardText({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="standard-text"
      className={cn("text-sm leading-relaxed", className)}
      {...props}
    />
  )
}

export { StandardText }
