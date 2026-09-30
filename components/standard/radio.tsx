import * as React from "react"
import { cn } from "cn"

import { ChoiceLabel } from "@/components/standard/choice-label"

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
  size = "default",
  appearance = "default",
  ...props
}: Omit<React.ComponentProps<"input">, "type" | "size"> & {
  /** Renders a clickable label next to the circle. */
  label?: React.ReactNode
  description?: React.ReactNode
  /** Shows the error style. Same as passing aria-invalid. */
  invalid?: boolean
  size?: "sm" | "default"
  /** card: a bordered tile around circle and label, highlighted while checked. Needs a label. */
  appearance?: "default" | "card"
}) {
  const circle = (
    <input
      data-slot="radio"
      data-size={size}
      type="radio"
      className={cn(
        "shrink-0 accent-primary outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 aria-invalid:ring-destructive/40",
        size === "sm" ? "size-3.5" : "size-4",
        label ? (size === "sm" ? "mt-px" : "mt-0.5") : className
      )}
      {...props}
      aria-invalid={invalid || props["aria-invalid"] || undefined}
    />
  )

  if (!label) {
    return circle
  }

  return (
    <ChoiceLabel
      slot="radio-label"
      className={className}
      size={size}
      appearance={appearance}
      control={circle}
      label={label}
      description={description}
    />
  )
}

export { Radio, RadioGroup }
