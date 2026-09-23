import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const paragraphVariants = cva("text-pretty", {
  variants: {
    size: {
      default: "leading-7",
      lead: "text-xl text-muted-foreground",
      muted: "text-sm text-muted-foreground",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

function Paragraph({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"p"> & VariantProps<typeof paragraphVariants>) {
  return (
    <p
      data-slot="paragraph"
      data-size={size}
      className={cn(paragraphVariants({ size }), className)}
      {...props}
    />
  )
}

export { Paragraph, paragraphVariants }
