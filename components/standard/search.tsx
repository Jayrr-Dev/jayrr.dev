"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { TextField } from "@/components/standard/text-field"

/** @deprecated Search renders <TextField type="search">; style it through TextField. */
const searchVariants = cva(
  "flex w-full items-center gap-2 rounded-lg border border-input px-2.5 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 has-disabled:cursor-not-allowed has-disabled:opacity-50 dark:bg-input/30",
  {
    variants: {
      size: {
        default: "h-8",
        sm: "h-7",
        lg: "h-9",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

/** @deprecated Use <TextField type="search"> */
function Search({
  className,
  size = "default",
  clearable = false,
  ...props
}: Omit<React.ComponentProps<"input">, "type" | "size"> &
  VariantProps<typeof searchVariants> & {
    /** Shows a clear button once there's a query. */
    clearable?: boolean
  }) {
  return (
    <TextField
      type="search"
      size={size}
      clearable={clearable}
      // Search's className has always styled the outer box.
      containerClassName={className}
      {...props}
      aria-label={
        props["aria-label"] ??
        (props["aria-labelledby"] ? undefined : (props.placeholder ?? "Search"))
      }
    />
  )
}

export { Search, searchVariants }
