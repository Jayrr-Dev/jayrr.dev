import * as React from "react"
import { cn } from "cn"

function FieldLabel({
  className,
  required = false,
  children,
  ...props
}: React.ComponentProps<"label"> & {
  /** Adds a required marker after the label text. */
  required?: boolean
}) {
  return (
    <label
      data-slot="field-label"
      className={cn("text-sm font-medium leading-none", className)}
      {...props}
    >
      {children}
      {required ? (
        <>
          <span aria-hidden className="ml-0.5 text-destructive">
            *
          </span>
          <span className="sr-only"> (required)</span>
        </>
      ) : null}
    </label>
  )
}

export { FieldLabel }
