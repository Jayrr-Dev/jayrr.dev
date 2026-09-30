"use client"

import * as React from "react"

import {
  TextField,
  type TextFieldProps,
} from "@/components/standard/text-field"
import type { FieldValidationProps } from "@/hooks/use-field-validation"

type SearchProps = Omit<React.ComponentProps<"input">, "type" | "size"> &
  Pick<TextFieldProps, "completion" | "completionKeys"> &
  FieldValidationProps & {
    size?: "sm" | "default" | "lg"
    /** Shows a clear button once there's a query. */
    clearable?: boolean
  }

/**
 * Search preset: a <TextField type="search"> that is not clearable by default,
 * styles its outer box through className and takes its aria-label from the
 * placeholder. Pass `completion` for ghost-text suggestions.
 */
function Search({
  className,
  size = "default",
  clearable = false,
  ...props
}: SearchProps) {
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
export type { SearchProps }
