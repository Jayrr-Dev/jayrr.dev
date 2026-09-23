"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const captionButtonVariants = cva(
  "inline-flex items-center justify-center border border-border bg-background text-foreground hover:bg-muted data-[pressed=true]:bg-muted",
  {
    variants: {
      shape: {
        circle: "rounded-full",
        square: "rounded-md",
      },
      size: {
        sm: "size-6",
        default: "size-8",
        lg: "size-10",
      },
    },
    defaultVariants: {
      shape: "circle",
      size: "default",
    },
  }
)

function CaptionButton({
  className,
  label,
  pressed,
  defaultPressed = false,
  onPressedChange,
  shape = "circle",
  size = "default",
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof captionButtonVariants> & {
    label: string
    pressed?: boolean
    defaultPressed?: boolean
    onPressedChange?: (pressed: boolean) => void
  }) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultPressed)
  const isOn = pressed ?? uncontrolled

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    props.onClick?.(event)
    if (event.defaultPrevented) {
      return
    }
    const next = !isOn
    if (pressed === undefined) {
      setUncontrolled(next)
    }
    onPressedChange?.(next)
  }

  return (
    <button
      data-slot="caption-button"
      data-pressed={isOn}
      data-shape={shape}
      data-size={size}
      type="button"
      aria-label={label}
      aria-pressed={isOn}
      className={cn(captionButtonVariants({ shape, size }), className)}
      {...props}
      onClick={handleClick}
    >
      {children}
    </button>
  )
}

function CaptionsArray({
  className,
  children,
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="captions-array"
      className={cn("inline-flex items-center gap-1", className)}
    >
      {children}
    </div>
  )
}

export { CaptionButton, CaptionsArray, captionButtonVariants }
