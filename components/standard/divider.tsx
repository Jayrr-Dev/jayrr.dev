"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

import { Separator } from "@/components/ui/separator"

const dividerVariants = cva("shrink-0", {
  variants: {
    orientation: {
      horizontal: "h-px w-full",
      vertical: "h-full w-px self-stretch",
    },
    tone: {
      default: "bg-border",
      strong: "bg-foreground/40",
      dashed: "border-dashed border-border bg-transparent",
    },
  },
  compoundVariants: [
    { tone: "dashed", orientation: "horizontal", className: "h-0 border-t" },
    { tone: "dashed", orientation: "vertical", className: "w-0 border-l" },
  ],
  defaultVariants: {
    orientation: "horizontal",
    tone: "default",
  },
})

function Divider({
  className,
  orientation = "horizontal",
  tone = "default",
  label,
  decorative = false,
  asChild,
  ...props
}: React.ComponentProps<typeof Separator> &
  VariantProps<typeof dividerVariants> & {
    /** Text centred in a horizontal line, e.g. "or". */
    label?: React.ReactNode
  }) {
  const resolvedOrientation = orientation ?? "horizontal"

  if (label !== undefined && resolvedOrientation === "horizontal") {
    const line = cn(dividerVariants({ orientation: "horizontal", tone }), "flex-1")

    return (
      <div
        data-slot="divider"
        data-orientation="horizontal"
        data-tone={tone}
        role={decorative ? "none" : "separator"}
        className={cn(
          "flex w-full items-center gap-3 text-xs text-muted-foreground",
          className
        )}
        {...props}
      >
        <Separator decorative className={line} />
        <span className="shrink-0">{label}</span>
        <Separator decorative className={line} />
      </div>
    )
  }

  return (
    <Separator
      data-slot="divider"
      data-tone={tone}
      orientation={resolvedOrientation}
      decorative={decorative}
      asChild={asChild}
      className={cn(
        dividerVariants({ orientation: resolvedOrientation, tone }),
        className
      )}
      {...props}
    />
  )
}

export { Divider, dividerVariants }

// The ui Separator, for callers that want the plain primitive.
export { Separator }
