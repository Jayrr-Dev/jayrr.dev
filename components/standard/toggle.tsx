"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

import { useControllableState } from "@/hooks/use-controllable-state"

const TOGGLE_BOX = {
  sm: "size-7",
  default: "size-8",
  lg: "size-9",
} as const

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-1.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[pressed=true]:bg-muted data-[pressed=true]:text-foreground",
  {
    variants: {
      tone: {
        outline: "border border-input hover:bg-muted",
        ghost:
          "border border-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
      },
      size: {
        sm: "h-7 px-2.5 text-xs",
        default: "h-8 px-3",
        lg: "h-9 px-4",
      },
      shape: {
        default: "rounded-lg",
        circle: "rounded-full",
        square: "rounded-md",
      },
      iconOnly: {
        true: "px-0",
        false: "",
      },
    },
    compoundVariants: (
      Object.keys(TOGGLE_BOX) as (keyof typeof TOGGLE_BOX)[]
    ).map((size) => ({ size, iconOnly: true, class: TOGGLE_BOX[size] })),
    defaultVariants: {
      tone: "outline",
      size: "default",
      shape: "default",
      iconOnly: false,
    },
  }
)

/**
 * Two-state button. Controlled with `pressed`, or keeps its own state seeded
 * by `defaultPressed`. Icon-only toggles take an `aria-label`.
 */
function Toggle({
  className,
  pressed,
  defaultPressed = false,
  onPressedChange,
  tone = "outline",
  size = "default",
  shape = "default",
  iconOnly = false,
  type = "button",
  ...props
}: React.ComponentProps<"button"> &
  Omit<VariantProps<typeof toggleVariants>, "iconOnly"> & {
    pressed?: boolean
    defaultPressed?: boolean
    onPressedChange?: (pressed: boolean) => void
    /** Square toggle that holds only an icon; give it an `aria-label`. */
    iconOnly?: boolean
  }) {
  const [isOn, setOn] = useControllableState({
    value: pressed,
    defaultValue: defaultPressed,
    onChange: onPressedChange,
  })

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    props.onClick?.(event)
    if (event.defaultPrevented) {
      return
    }
    setOn(!isOn)
  }

  return (
    <button
      data-slot="toggle"
      data-pressed={isOn}
      data-tone={tone}
      data-size={size}
      data-shape={shape}
      data-icon-only={iconOnly || undefined}
      type={type}
      aria-pressed={isOn}
      className={cn(
        toggleVariants({ tone, size, shape, iconOnly }),
        className
      )}
      {...props}
      onClick={handleClick}
    />
  )
}

export { Toggle, toggleVariants }
