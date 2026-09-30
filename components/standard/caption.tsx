import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const captionVariants = cva("text-sm", {
  variants: {
    tone: {
      // Captions read quiet by default, so "default" and "muted" match.
      default: "text-muted-foreground",
      muted: "text-muted-foreground",
      danger: "text-destructive",
      uppercase: "text-xs tracking-wide text-muted-foreground uppercase",
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
