"use client"

import * as React from "react"
import { cn } from "cn"

function TabNavigation({
  className,
  items,
  value,
  defaultValue,
  onValueChange,
}: {
  className?: string
  items: { id: string; label: string }[]
  value?: string
  defaultValue?: string
  onValueChange?: (id: string) => void
}) {
  const [uncontrolled, setUncontrolled] = React.useState(
    defaultValue ?? items[0]?.id
  )
  const selected = value ?? uncontrolled

  function select(id: string) {
    if (value === undefined) {
      setUncontrolled(id)
    }
    onValueChange?.(id)
  }

  return (
    <nav
      data-slot="tab-navigation"
      className={cn("flex gap-3 border-b border-border", className)}
    >
      {items.map((item) => {
        const isOn = item.id === selected

        return (
          <button
            key={item.id}
            type="button"
            className={cn(
              "border-b-2 pb-1 text-sm",
              isOn
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground"
            )}
            onClick={() => select(item.id)}
          >
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}

export { TabNavigation }
