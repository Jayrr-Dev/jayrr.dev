import * as React from "react"
import { cn } from "cn"

function DatePicker({
  className,
  invalid,
  ...props
}: Omit<React.ComponentProps<"input">, "type"> & {
  /** Shows the error style. Same as passing aria-invalid. */
  invalid?: boolean
}) {
  return (
    <input
      data-slot="date-picker"
      type="date"
      className={cn(
        "h-8 rounded-lg border border-input bg-transparent px-2 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
      aria-invalid={invalid || props["aria-invalid"] || undefined}
    />
  )
}

export { DatePicker }
