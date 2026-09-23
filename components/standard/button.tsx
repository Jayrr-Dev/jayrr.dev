import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg px-3 text-sm font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      tone: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline:
          "border border-input bg-transparent hover:bg-muted hover:text-foreground",
        danger: "bg-destructive text-white hover:bg-destructive/90",
      },
      size: {
        sm: "h-7 px-2.5 text-xs",
        default: "h-8",
        lg: "h-9 px-4",
      },
    },
    defaultVariants: {
      tone: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  tone = "default",
  size = "default",
  type = "button",
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  return (
    <button
      data-slot="button"
      data-tone={tone}
      data-size={size}
      type={type}
      className={cn(buttonVariants({ tone, size }), className)}
      {...props}
    />
  )
}

export { Button, buttonVariants }
