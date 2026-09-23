"use client"

import * as React from "react"
import { cn } from "cn"

import { Badge } from "@/components/standard/badge"

export type ToggleableBadgeItem = {
  id: string
  label: string
}

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
  const [uncontrolled, setUncontrolled] = React.useState(
    defaultValue ?? items[0]?.id
  )
  const [uncontrolledMany, setUncontrolledMany] = React.useState<string[]>([])
  const selected = value ?? uncontrolled
  const selectedMany = values ?? uncontrolledMany

  function select(id: string) {
    if (multiple) {
      const exists = selectedMany.includes(id)
      const next = exists
        ? selectedMany.filter((item) => item !== id)
        : [...selectedMany, id]
      if (values === undefined) {
        setUncontrolledMany(next)
      }
      onValuesChange?.(next)
      return
    }
    if (value === undefined) {
      setUncontrolled(id)
    }
    onValueChange?.(id)
  }

  return (
    <div
      data-slot="toggleable-badges"
      className={cn("flex flex-wrap gap-1.5", className)}
    >
      {items.map((item) => {
        const isOn = multiple
          ? selectedMany.includes(item.id)
          : item.id === selected
        const tone = isOn ? "default" : "outline"

        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={isOn}
            onClick={() => select(item.id)}
            className="rounded-full"
          >
            <Badge tone={tone}>{item.label}</Badge>
          </button>
        )
      })}
    </div>
  )
}

export { ToggleableBadges }
