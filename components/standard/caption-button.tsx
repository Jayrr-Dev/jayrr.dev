"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

import { Toggle } from "@/components/standard/toggle"

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

/** @deprecated Use <Toggle iconOnly shape aria-label> */
function CaptionButton({
  className,
  label,
  shape = "circle",
  size = "default",
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof captionButtonVariants> & {
    label: string
    pressed?: boolean
    defaultPressed?: boolean
    onPressedChange?: (pressed: boolean) => void
  }) {
  return (
    <Toggle
      data-slot="caption-button"
      iconOnly
      shape={shape ?? "circle"}
      size={size ?? "default"}
      aria-label={label}
      // Keeps the original caption look and box sizes (sm 24px, lg 40px).
      className={cn(captionButtonVariants({ shape, size }), className)}
      {...props}
    />
  )
}

/**
 * @deprecated Use a plain `flex gap-1` container. Kept only so imports keep
 * working; slated for removal.
 */
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
