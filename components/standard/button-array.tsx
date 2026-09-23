"use client"

import * as React from "react"
import { cn } from "cn"

import { Button } from "@/components/standard/button"

export type ButtonArrayItem = {
  id: string
  label: string
}

function ButtonArray({
  className,
  items,
  value,
  defaultValue,
  onValueChange,
  variant = "badge",
}: {
  className?: string
  items: ButtonArrayItem[]
  value?: string
  defaultValue?: string
  onValueChange?: (id: string) => void
  variant?: "badge" | "underlined" | "slider"
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
    <div
      data-slot="button-array"
      data-variant={variant}
      role="tablist"
      className={cn(
        "inline-flex flex-wrap gap-1",
        variant === "slider" ? "rounded-full bg-muted p-1" : undefined,
        className
      )}
    >
      {items.map((item) => {
        const isOn = item.id === selected

        if (variant === "underlined" || variant === "slider") {
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isOn}
              className={cn(
                variant === "slider"
                  ? cn(
                      "rounded-full px-3 py-1 text-xs",
                      isOn ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                    )
                  : cn(
                      "border-b-2 px-2 pb-1 text-sm",
                      isOn
                        ? "border-foreground text-foreground"
                        : "border-transparent text-muted-foreground"
                    )
              )}
              onClick={() => select(item.id)}
            >
              {item.label}
            </button>
          )
        }

        const tone = isOn ? "default" : "outline"

        return (
          <Button
            key={item.id}
            role="tab"
            aria-selected={isOn}
            tone={tone}
            size="sm"
            onClick={() => select(item.id)}
          >
            {item.label}
          </Button>
        )
      })}
    </div>
  )
}

export { ButtonArray }
