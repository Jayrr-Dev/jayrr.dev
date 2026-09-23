import * as React from "react"
import { cn } from "cn"

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="radio-group"
      role="radiogroup"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function Radio({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="radio"
      type="radio"
      className={cn(
        "size-4 shrink-0 accent-primary outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Radio, RadioGroup }
