import * as React from "react"
import { cn } from "cn"

function RadioGroup({
  className,
  legend,
  children,
  ...props
}: React.ComponentProps<"fieldset"> & {
  /** Visible group label, rendered as a native legend. */
  legend?: React.ReactNode
}) {
  return (
    <fieldset
      data-slot="radio-group"
      className={cn("flex min-w-0 flex-col gap-2", className)}
      {...props}
    >
      {legend ? (
        <legend className="mb-1 text-sm font-medium leading-none">
          {legend}
        </legend>
      ) : null}
      {children}
    </fieldset>
  )
}

function Radio({
  className,
  label,
  description,
  invalid,
  ...props
}: Omit<React.ComponentProps<"input">, "type"> & {
  /** Renders a clickable label next to the circle. */
  label?: React.ReactNode
  description?: React.ReactNode
  /** Shows the error style. Same as passing aria-invalid. */
  invalid?: boolean
}) {
  const circle = (
    <input
      data-slot="radio"
      type="radio"
      className={cn(
        "size-4 shrink-0 accent-primary outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 aria-invalid:ring-destructive/40",
        label ? "mt-0.5" : className
      )}
      {...props}
      aria-invalid={invalid || props["aria-invalid"] || undefined}
    />
  )

  if (!label) {
    return circle
  }

  return (
    <label
      data-slot="radio-label"
      className={cn(
        "-mx-2 flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 text-sm has-disabled:cursor-not-allowed has-disabled:opacity-50",
        className
      )}
    >
      {circle}
      <span className="flex flex-col gap-0.5 leading-snug">
        <span>{label}</span>
        {description ? (
          <span className="text-xs text-muted-foreground">{description}</span>
        ) : null}
      </span>
    </label>
  )
}

export { Radio, RadioGroup }
