import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const symbolVariants = cva("inline-flex items-center justify-center", {
  variants: {
    size: {
      default: "size-6 [&_svg]:size-6",
      sm: "size-4 [&_svg]:size-4",
      lg: "size-8 [&_svg]:size-8",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

function Symbol({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof symbolVariants>) {
  return (
    <span
      data-slot="symbol"
      data-size={size}
      className={cn(symbolVariants({ size }), className)}
      {...props}
    />
  )
}

export { Symbol, symbolVariants }
