"use client"

import * as React from "react"

import { TextField } from "@/components/standard/text-field"

/**
 * Search preset: a <TextField type="search"> that is not clearable by default,
 * styles its outer box through className and takes its aria-label from the
 * placeholder.
 */
function Search({
  className,
  size = "default",
  clearable = false,
  ...props
}: Omit<React.ComponentProps<"input">, "type" | "size"> & {
  size?: "sm" | "default" | "lg"
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

export { Search }
