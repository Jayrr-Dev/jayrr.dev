"use client"

import * as React from "react"
import { cn } from "cn"

import { ChoiceLabel } from "@/components/standard/choice-label"

function Checkbox({
  className,
  label,
  description,
  invalid,
  size = "default",
  appearance = "default",
  indeterminate = false,
  ref,
  ...props
}: Omit<React.ComponentProps<"input">, "type" | "size"> & {
  /** Renders a clickable label next to the box. */
  label?: React.ReactNode
  description?: React.ReactNode
  /** Shows the error style. Same as passing aria-invalid. */
  invalid?: boolean
  size?: "sm" | "default"
  /** card: a bordered tile around box and label, highlighted while checked. Needs a label. */
  appearance?: "default" | "card"
  /** Shows the mixed state, e.g. for a "select all" over a partial selection. */
  indeterminate?: boolean
}) {
  // indeterminate only exists as a DOM property, so set it on the node.
  const setRefs = React.useCallback(
    (node: HTMLInputElement | null) => {
      if (node) {
        node.indeterminate = indeterminate
      }
      if (typeof ref === "function") {
        ref(node)
      } else if (ref) {
        ref.current = node
      }
    },
    [ref, indeterminate]
  )

  const box = (
    <input
      ref={setRefs}
      data-slot="checkbox"
      data-size={size}
      data-indeterminate={indeterminate || undefined}
      type="checkbox"
      className={cn(
        "shrink-0 rounded-sm border border-input accent-primary outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 aria-invalid:ring-destructive/40",
        size === "sm" ? "size-3.5" : "size-4",
        label ? (size === "sm" ? "mt-px" : "mt-0.5") : className
      )}
      {...props}
      aria-invalid={invalid || props["aria-invalid"] || undefined}
    />
  )

  if (!label) {
    return box
  }

  return (
    <ChoiceLabel
      slot="checkbox-label"
      className={className}
      size={size}
      appearance={appearance}
      control={box}
      label={label}
      description={description}
    />
  )
}

export { Checkbox }
