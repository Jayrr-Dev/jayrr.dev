import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const textFieldVariants = cva(
  "w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30",
  {
    variants: {
      size: {
        default: "h-8",
        sm: "h-7 text-xs",
        lg: "h-9",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

function TextField({
  className,
  size = "default",
  type = "text",
  ...props
}: Omit<React.ComponentProps<"input">, "size"> &
  VariantProps<typeof textFieldVariants>) {
  return (
    <input
      data-slot="text-field"
      data-size={size}
      type={type}
      className={cn(textFieldVariants({ size }), className)}
      {...props}
    />
  )
}

export { TextField, textFieldVariants }
