"use client"

import * as React from "react"
import { cn } from "cn"

import { FieldLabel } from "@/components/standard/field-label"
import { Row } from "@/components/standard/row"

function Switch({
  className,
  checked,
  defaultChecked,
  onCheckedChange,
  onClick,
  ...props
}: Omit<React.ComponentProps<"button">, "onChange"> & {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
}) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultChecked ?? false)
  const isOn = checked ?? uncontrolled

  function toggle(event: React.MouseEvent<HTMLButtonElement>) {
    onClick?.(event)
    if (event.defaultPrevented) {
      return
    }
    const next = !isOn
    if (checked === undefined) {
      setUncontrolled(next)
    }
    onCheckedChange?.(next)
  }

  return (
    <button
      data-slot="switch"
      data-checked={isOn}
      type="button"
      role="switch"
      {...props}
      aria-checked={isOn}
      className={cn(
        "relative h-5 w-8 shrink-0 rounded-full bg-muted transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[checked=true]:bg-primary",
        className
      )}
      onClick={toggle}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 size-4 rounded-full bg-background transition-transform",
          isOn ? "translate-x-3" : "translate-x-0"
        )}
      />
    </button>
  )
}

function LabelledSwitch({
  className,
  label,
  id,
  ...props
}: React.ComponentProps<typeof Switch> & { label: string }) {
  const autoId = React.useId()
  const switchId = id ?? autoId

  return (
    <Row data-slot="labelled-switch" className={className}>
      <Switch id={switchId} {...props} />
      <FieldLabel
        htmlFor={switchId}
        className={cn(
          "cursor-pointer",
          props.disabled && "cursor-not-allowed opacity-50"
        )}
      >
        {label}
      </FieldLabel>
    </Row>
  )
}

export { LabelledSwitch, Switch }
