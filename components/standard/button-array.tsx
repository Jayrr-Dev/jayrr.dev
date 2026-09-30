"use client"

import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "cn"

import { badgeVariants } from "@/components/standard/badge"
import { useControllableState } from "@/hooks/use-controllable-state"

export type ButtonArrayItem = {
  id: string
  label: string
  /** Shown before the label. */
  icon?: React.ReactNode
  /** Small number after the label, e.g. how many rows a filter matches. */
  count?: number
}

export type ButtonArrayAppearance =
  | "badge"
  | "segmented"
  | "underlined"
  | "slider"
export type ButtonArrayType = "single" | "multiple"
export type ButtonArraySize = "sm" | "default"

const buttonArrayVariants = cva("gap-1", {
  variants: {
    appearance: {
      badge: "flex-wrap",
      segmented:
        "gap-0 divide-x divide-input overflow-hidden rounded-lg border border-input",
      underlined: "flex-wrap",
      slider: "rounded-full bg-muted p-1",
    },
    block: {
      true: "flex w-full flex-nowrap [&>*]:flex-1 [&>*]:justify-center",
      false: "inline-flex",
    },
  },
  defaultVariants: {
    appearance: "badge",
    block: false,
  },
})

const buttonArrayItemVariants = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      appearance: {
        // Badge pills; the tone comes from badgeVariants.
        badge: "hover:opacity-90",
        segmented:
          "px-3 font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground aria-checked:bg-muted aria-checked:text-foreground aria-pressed:bg-muted aria-pressed:text-foreground",
        underlined:
          "border-b-2 border-transparent px-2 pb-1 text-muted-foreground hover:text-foreground aria-pressed:border-foreground aria-pressed:text-foreground aria-selected:border-foreground aria-selected:text-foreground",
        slider:
          "rounded-full text-xs text-muted-foreground aria-checked:bg-background aria-checked:text-foreground aria-checked:shadow-sm aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-sm",
      },
      size: {
        sm: "",
        default: "",
      },
    },
    compoundVariants: [
      { appearance: "badge", size: "default", className: "h-7 px-3" },
      { appearance: "segmented", size: "sm", className: "h-6 text-xs" },
      { appearance: "segmented", size: "default", className: "h-7 text-sm" },
      { appearance: "underlined", size: "sm", className: "text-xs" },
      { appearance: "underlined", size: "default", className: "text-sm" },
      { appearance: "slider", size: "sm", className: "px-2 py-0.5" },
      { appearance: "slider", size: "default", className: "px-3 py-1" },
    ],
    defaultVariants: {
      appearance: "badge",
      size: "default",
    },
  }
)

const ARROW_KEYS = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"]

type ButtonArrayProps = Omit<
  React.ComponentProps<"div">,
  "defaultValue" | "onChange" | "children"
> & {
  items: ButtonArrayItem[]
  /** `multiple` lets several items be on at once; state moves to `values`. */
  type?: ButtonArrayType
  value?: string
  defaultValue?: string
  onValueChange?: (id: string) => void
  values?: string[]
  defaultValues?: string[]
  onValuesChange?: (ids: string[]) => void
  appearance?: ButtonArrayAppearance
  /** @deprecated Use appearance */
  variant?: "badge" | "underlined" | "slider"
  size?: ButtonArraySize
  /** Stretches the array to its container, sharing the width between items. */
  block?: boolean
}

/**
 * A row of buttons where one (`type="single"`) or several
 * (`type="multiple"`) are on. Semantics follow the look: single + underlined
 * is a tablist, other single arrays are a radio group (arrow keys move the
 * pick), and multiple arrays are aria-pressed toggle buttons.
 */
function ButtonArray({
  className,
  items,
  type = "single",
  value,
  defaultValue,
  onValueChange,
  values,
  defaultValues,
  onValuesChange,
  appearance: appearanceProp,
  variant,
  size = "default",
  block = false,
  ...props
}: ButtonArrayProps) {
  const appearance = appearanceProp ?? variant ?? "badge"
  const multiple = type === "multiple"
  const [selected, setSelected] = useControllableState({
    value,
    defaultValue: defaultValue ?? items[0]?.id ?? "",
    onChange: onValueChange,
  })
  const [selectedMany, setSelectedMany] = useControllableState<string[]>({
    value: values,
    defaultValue: defaultValues ?? [],
    onChange: onValuesChange,
  })

  const role = multiple
    ? "group"
    : appearance === "underlined"
      ? "tablist"
      : "radiogroup"
  const itemRole = multiple ? undefined : role === "tablist" ? "tab" : "radio"

  function toggle(id: string) {
    if (multiple) {
      setSelectedMany((previous) =>
        previous.includes(id)
          ? previous.filter((item) => item !== id)
          : [...previous, id]
      )
      return
    }
    setSelected(id)
  }

  // Single arrays keep one tab stop; arrow keys move and select, as radios and
  // tabs do.
  function onItemKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (multiple || !ARROW_KEYS.includes(event.key)) {
      return
    }
    const buttons = Array.from(
      event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
        "[data-slot=button-array-item]:not(:disabled)"
      ) ?? []
    )
    const index = buttons.indexOf(event.currentTarget)
    if (index < 0 || buttons.length === 0) {
      return
    }
    event.preventDefault()
    let next = index
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % buttons.length
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + buttons.length) % buttons.length
    if (event.key === "Home") next = 0
    if (event.key === "End") next = buttons.length - 1
    const target = buttons[next]
    target?.focus()
    target?.click()
  }

  const hasSelection = items.some((item) => item.id === selected)

  return (
    <div
      data-slot="button-array"
      data-appearance={appearance}
      data-variant={appearance}
      data-type={type}
      data-size={size}
      role={role}
      className={cn(buttonArrayVariants({ appearance, block }), className)}
      {...props}
    >
      {items.map((item, index) => {
        const isOn = multiple
          ? selectedMany.includes(item.id)
          : item.id === selected
        const tabStop = isOn || (!hasSelection && index === 0)

        return (
          <button
            key={item.id}
            type="button"
            data-slot="button-array-item"
            data-state={isOn ? "on" : "off"}
            role={itemRole}
            aria-pressed={multiple ? isOn : undefined}
            aria-checked={itemRole === "radio" ? isOn : undefined}
            aria-selected={itemRole === "tab" ? isOn : undefined}
            tabIndex={multiple || tabStop ? 0 : -1}
            className={cn(
              appearance === "badge" &&
                badgeVariants({ tone: isOn ? "default" : "outline" }),
              buttonArrayItemVariants({ appearance, size })
            )}
            onClick={() => toggle(item.id)}
            onKeyDown={onItemKeyDown}
          >
            {item.icon}
            {item.label}
            {item.count !== undefined ? (
              <span
                data-slot="button-array-count"
                className="rounded-full bg-current/10 px-1.5 text-[10px] leading-4 font-medium tabular-nums"
              >
                {item.count}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

export { ButtonArray, buttonArrayVariants }
export type { ButtonArrayProps }
