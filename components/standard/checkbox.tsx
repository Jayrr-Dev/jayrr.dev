import * as React from "react"
import { cn } from "cn"

function Checkbox({
  className,
  label,
  description,
  invalid,
  ...props
}: Omit<React.ComponentProps<"input">, "type"> & {
  /** Renders a clickable label next to the box. */
  label?: React.ReactNode
  description?: React.ReactNode
  /** Shows the error style. Same as passing aria-invalid. */
  invalid?: boolean
}) {
  const box = (
    <input
      data-slot="checkbox"
      type="checkbox"
      className={cn(
        "size-4 shrink-0 rounded-sm border border-input accent-primary outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 aria-invalid:ring-destructive/40",
        label ? "mt-0.5" : className
      )}
      {...props}
      aria-invalid={invalid || props["aria-invalid"] || undefined}
    />
  )

  if (!label) {
    return box
  }

  return (
    <label
      data-slot="checkbox-label"
      className={cn(
        "-mx-2 flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 text-sm has-disabled:cursor-not-allowed has-disabled:opacity-50",
        className
      )}
    >
      {box}
      <span className="flex flex-col gap-0.5 leading-snug">
        <span>{label}</span>
        {description ? (
          <span className="text-xs text-muted-foreground">{description}</span>
        ) : null}
      </span>
    </label>
  )
}

export { Checkbox }
