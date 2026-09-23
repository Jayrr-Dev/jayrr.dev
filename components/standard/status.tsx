import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const statusVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      tone: {
        ready: "border-transparent bg-primary text-primary-foreground",
        draft: "border-transparent bg-secondary text-secondary-foreground",
        working: "border-border bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      tone: "ready",
    },
  }
)

function Status({
  className,
  tone = "ready",
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof statusVariants>) {
  return (
    <span
      data-slot="status"
      data-tone={tone}
      className={cn(statusVariants({ tone }), className)}
      {...props}
    />
  )
}

export { Status, statusVariants }
