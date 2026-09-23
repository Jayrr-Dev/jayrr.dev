"use client"

import * as React from "react"
import { cn } from "cn"

import { Button } from "@/components/standard/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/standard/popover"

export type FilterSelectOption = {
  value: string
  label: string
  group?: string
}

function FilterSelect({
  className,
  options,
  value,
  defaultValue = "",
  onValueChange,
  placeholder = "Select",
  disabled = false,
}: {
  className?: string
  options: FilterSelectOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
}) {
  const [open, setOpen] = React.useState(false)
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const selected = value ?? uncontrolled
  const current = options.find((option) => option.value === selected)
  const groups = [...new Set(options.map((option) => option.group ?? ""))]

  function pick(next: string) {
    if (value === undefined) {
      setUncontrolled(next)
    }
    onValueChange?.(next)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          data-slot="filter-select"
          tone="outline"
          size="sm"
          disabled={disabled}
          className={cn("min-w-28 justify-between", className)}
        >
          {current?.label ?? placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-52 p-1">
        <button
          type="button"
          className="w-full rounded-md px-2 py-1 text-left text-xs text-muted-foreground hover:bg-muted"
          onClick={() => pick("")}
        >
          Clear
        </button>
        {groups.map((group) => (
          <div key={group || "all"} className="flex flex-col">
            {group ? (
              <p className="px-2 pt-2 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                {group}
              </p>
            ) : null}
            {options
              .filter((option) => (option.group ?? "") === group)
              .map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    "rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted",
                    option.value === selected ? "bg-muted" : undefined
                  )}
                  onClick={() => pick(option.value)}
                >
                  {option.label}
                </button>
              ))}
          </div>
        ))}
      </PopoverContent>
    </Popover>
  )
}

function MultiSelect({
  className,
  options,
  values,
  defaultValues = [],
  onValuesChange,
  placeholder = "Select",
  disabled = false,
}: {
  className?: string
  options: FilterSelectOption[]
  values?: string[]
  defaultValues?: string[]
  onValuesChange?: (values: string[]) => void
  placeholder?: string
  disabled?: boolean
}) {
  const [open, setOpen] = React.useState(false)
  const [uncontrolled, setUncontrolled] = React.useState(defaultValues)
  const selected = values ?? uncontrolled
  const label =
    selected.length === 0 ? placeholder : `${selected.length} selected`

  function toggle(next: string) {
    const exists = selected.includes(next)
    const updated = exists
      ? selected.filter((item) => item !== next)
      : [...selected, next]
    if (values === undefined) {
      setUncontrolled(updated)
    }
    onValuesChange?.(updated)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          data-slot="multi-select"
          tone="outline"
          size="sm"
          disabled={disabled}
          className={cn("min-w-28", className)}
        >
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-52 p-1">
        <button
          type="button"
          className="w-full rounded-md px-2 py-1 text-left text-xs text-muted-foreground hover:bg-muted"
          onClick={() => {
            if (values === undefined) {
              setUncontrolled([])
            }
            onValuesChange?.([])
          }}
        >
          Clear
        </button>
        {options.map((option) => {
          const isOn = selected.includes(option.value)
          return (
            <button
              key={option.value}
              type="button"
              className={cn(
                "w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted",
                isOn ? "bg-muted" : undefined
              )}
              onClick={() => toggle(option.value)}
            >
              {option.label}
            </button>
          )
        })}
      </PopoverContent>
    </Popover>
  )
}

function DatePicker({
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "type">) {
  return (
    <input
      data-slot="date-picker"
      type="date"
      className={cn(
        "h-8 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30",
        className
      )}
      {...props}
    />
  )
}

export { DatePicker, FilterSelect, MultiSelect }
