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
  ...props
}: Omit<React.ComponentProps<"button">, "onChange"> & {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
}) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultChecked ?? false)
  const isOn = checked ?? uncontrolled

  function toggle() {
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
      aria-checked={isOn}
      className={cn(
        "relative h-5 w-8 rounded-full bg-muted transition-colors data-[checked=true]:bg-primary",
        className
      )}
      onClick={toggle}
      {...props}
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
  ...props
}: React.ComponentProps<typeof Switch> & { label: string }) {
  return (
    <Row data-slot="labelled-switch" className={className}>
      <Switch {...props} />
      <FieldLabel>{label}</FieldLabel>
    </Row>
  )
}

export { LabelledSwitch, Switch }
