import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const captionVariants = cva("text-muted-foreground", {
  variants: {
    tone: {
      default: "text-sm",
      uppercase: "text-xs tracking-wide uppercase",
    },
  },
  defaultVariants: {
    tone: "default",
  },
})

function Caption({
  className,
  tone = "default",
  ...props
}: React.ComponentProps<"p"> & VariantProps<typeof captionVariants>) {
  return (
    <p
      data-slot="caption"
      data-tone={tone}
      className={cn(captionVariants({ tone }), className)}
      {...props}
    />
  )
}

export { Caption, captionVariants }
