import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const rowVariants = cva("flex items-center", {
  variants: {
    gap: {
      sm: "gap-1",
      default: "gap-2",
      lg: "gap-4",
    },
  },
  defaultVariants: {
    gap: "default",
  },
})

function Row({
  className,
  gap = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof rowVariants>) {
  return (
    <div
      data-slot="row"
      data-gap={gap}
      className={cn(rowVariants({ gap }), className)}
      {...props}
    />
  )
}

export { Row, rowVariants }
