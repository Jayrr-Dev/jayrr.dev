"use client"

import { cn } from "cn"

import { ButtonArray } from "@/components/standard/button-array"

export type ToggleableBadgeItem = {
  id: string
  label: string
}

/** @deprecated Use <ButtonArray appearance="badge"> (with type="multiple" for multiple) */
function ToggleableBadges({
  className,
  items,
  value,
  defaultValue,
  onValueChange,
  multiple = false,
  values,
  onValuesChange,
}: {
  className?: string
  items: ToggleableBadgeItem[]
  value?: string
  defaultValue?: string
  onValueChange?: (id: string) => void
  multiple?: boolean
  values?: string[]
  onValuesChange?: (ids: string[]) => void
}) {
  return (
    <ButtonArray
      data-slot="toggleable-badges"
      appearance="badge"
      size="sm"
      type={multiple ? "multiple" : "single"}
      items={items}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      values={values}
      onValuesChange={onValuesChange}
      className={cn("flex gap-1.5", className)}
    />
  )
}

export { ToggleableBadges }
