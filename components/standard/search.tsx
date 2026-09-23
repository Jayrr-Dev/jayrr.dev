import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { SearchIcon } from "lucide-react"
import { cn } from "cn"

const searchVariants = cva(
  "flex w-full items-center gap-2 rounded-lg border border-input px-2.5 dark:bg-input/30",
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
  ...props
}: Omit<React.ComponentProps<"input">, "type" | "size"> &
  VariantProps<typeof searchVariants>) {
  return (
    <label
      data-slot="search"
      data-size={size}
      className={cn(searchVariants({ size }), className)}
    >
      <SearchIcon
        className={cn(
          "shrink-0 text-muted-foreground",
          size === "sm" ? "size-3.5" : "size-4"
        )}
      />
      <input
        type="search"
        className={cn(
          "h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground",
          size === "sm" ? "text-xs" : "text-sm"
        )}
        {...props}
      />
    </label>
  )
}

export { Search, searchVariants }
