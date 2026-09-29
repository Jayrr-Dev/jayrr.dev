"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { SearchIcon, XIcon } from "lucide-react"
import { cn } from "cn"

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

function Search({
  className,
  size = "default",
  clearable = false,
  ref,
  ...props
}: Omit<React.ComponentProps<"input">, "type" | "size"> &
  VariantProps<typeof searchVariants> & {
    /** Shows a clear button once there's a query. */
    clearable?: boolean
  }) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [hasValue, setHasValue] = React.useState(
    Boolean(props.value ?? props.defaultValue)
  )
  const filled =
    props.value !== undefined ? String(props.value).length > 0 : hasValue

  function setRefs(node: HTMLInputElement | null) {
    inputRef.current = node
    if (typeof ref === "function") {
      ref(node)
    } else if (ref) {
      ref.current = node
    }
  }

  function clear() {
    const el = inputRef.current
    if (!el) {
      return
    }
    // Go through the native setter so React fires onChange for controlled inputs.
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(el, "")
    el.dispatchEvent(new Event("input", { bubbles: true }))
    el.focus()
  }

  return (
    <label
      data-slot="search"
      data-size={size}
      className={cn(searchVariants({ size }), className)}
    >
      <SearchIcon
        aria-hidden
        className={cn(
          "shrink-0 text-muted-foreground",
          size === "sm" ? "size-3.5" : "size-4"
        )}
      />
      <input
        ref={setRefs}
        type="search"
        aria-label={
          props["aria-label"] ??
          (props["aria-labelledby"] ? undefined : props.placeholder ?? "Search")
        }
        className={cn(
          "h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed md:text-sm",
          size === "sm" && "md:text-xs",
          clearable && "[&::-webkit-search-cancel-button]:appearance-none"
        )}
        {...props}
        onChange={(event) => {
          setHasValue(event.target.value.length > 0)
          props.onChange?.(event)
        }}
      />
      {clearable && filled && !props.disabled ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={clear}
          className="-mr-1.5 flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <XIcon aria-hidden className={size === "sm" ? "size-3.5" : "size-4"} />
        </button>
      ) : null}
    </label>
  )
}

export { Search, searchVariants }
