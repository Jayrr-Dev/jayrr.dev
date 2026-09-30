import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

import { Divider } from "@/components/standard/divider"

const stackVariants = cva("flex", {
  variants: {
    direction: {
      column: "flex-col",
      row: "flex-row",
    },
    gap: {
      none: "gap-0",
      xs: "gap-0.5",
      sm: "gap-1",
      default: "gap-2",
      md: "gap-3",
      lg: "gap-4",
      xl: "gap-6",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
      baseline: "items-baseline",
    },
    justify: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
      around: "justify-around",
      evenly: "justify-evenly",
    },
    wrap: {
      true: "flex-wrap",
      false: "",
    },
  },
  defaultVariants: {
    direction: "column",
    gap: "default",
    wrap: false,
  },
})

function Stack({
  className,
  direction = "column",
  gap = "default",
  align,
  justify,
  wrap = false,
  divider = false,
  children,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof stackVariants> & {
    /** Draws a Divider between each child, across the stack direction. */
    divider?: boolean
  }) {
  const items = divider
    ? React.Children.toArray(children).flatMap((child, index) =>
        index === 0
          ? [child]
          : [
              <Divider
                key={`divider-${index}`}
                decorative
                orientation={direction === "row" ? "vertical" : "horizontal"}
                className={direction === "row" ? "h-auto" : undefined}
              />,
              child,
            ]
      )
    : children

  return (
    <div
      data-slot="stack"
      data-direction={direction}
      data-gap={gap}
      className={cn(
        stackVariants({ direction, gap, align, justify, wrap }),
        className
      )}
      {...props}
    >
      {items}
    </div>
  )
}

export { Stack, stackVariants }
