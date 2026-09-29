"use client"

import * as React from "react"
import { CircleCheckIcon } from "lucide-react"
import { cn } from "cn"

import { FieldLabel } from "@/components/standard/field-label"

type ControlProps = {
  id?: string
  "aria-describedby"?: string
  "aria-invalid"?: React.AriaAttributes["aria-invalid"]
  "aria-required"?: React.AriaAttributes["aria-required"]
}

/**
 * Wraps one control with a label, helper text and an error or success
 * message, and wires id, aria-describedby, aria-invalid and aria-required
 * onto the control for you.
 */
function FormField({
  className,
  label,
  required = false,
  helper,
  error,
  success,
  children,
}: {
  className?: string
  label?: React.ReactNode
  required?: boolean
  /** Guidance shown under the control. Hidden while an error shows. */
  helper?: React.ReactNode
  /** Error message. Also switches the control to its invalid style. */
  error?: React.ReactNode
  /** Confirmation shown when the value is valid. Ignored while an error shows. */
  success?: React.ReactNode
  children: React.ReactElement<ControlProps>
}) {
  const autoId = React.useId()
  const controlId = children.props.id ?? `${autoId}-control`
  const helperId = `${autoId}-helper`
  const messageId = `${autoId}-message`
  const hasError = Boolean(error)
  const showSuccess = !hasError && Boolean(success)
  const showHelper = !hasError && Boolean(helper)

  const describedBy =
    [
      children.props["aria-describedby"],
      showHelper ? helperId : null,
      hasError || showSuccess ? messageId : null,
    ]
      .filter(Boolean)
      .join(" ") || undefined

  const control = React.cloneElement(children, {
    id: controlId,
    "aria-describedby": describedBy,
    "aria-invalid": hasError || children.props["aria-invalid"] || undefined,
    "aria-required": required || children.props["aria-required"] || undefined,
  })

  return (
    <div
      data-slot="form-field"
      data-invalid={hasError || undefined}
      className={cn("flex w-full flex-col gap-1.5", className)}
    >
      {label ? (
        <FieldLabel htmlFor={controlId} required={required}>
          {label}
        </FieldLabel>
      ) : null}
      {control}
      {showHelper ? (
        <p id={helperId} className="text-xs text-muted-foreground">
          {helper}
        </p>
      ) : null}
      {hasError ? (
        <p id={messageId} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
      {showSuccess ? (
        <p
          id={messageId}
          className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400"
        >
          <CircleCheckIcon aria-hidden className="size-3.5 shrink-0" />
          {success}
        </p>
      ) : null}
    </div>
  )
}

export { FormField }
