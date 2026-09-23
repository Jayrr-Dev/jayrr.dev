import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const stackVariants = cva("flex flex-col", {
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

function Stack({
  className,
  gap = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof stackVariants>) {
  return (
    <div
      data-slot="stack"
      data-gap={gap}
      className={cn(stackVariants({ gap }), className)}
      {...props}
    />
  )
}

export { Stack, stackVariants }
