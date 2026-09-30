import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const paragraphVariants = cva("text-pretty", {
  variants: {
    size: {
      default: "leading-7",
      // Compact body text for dense UI (dates, totals, helper lines).
      sm: "text-sm leading-relaxed",
      lead: "text-xl text-muted-foreground",
      muted: "text-sm text-muted-foreground",
    },
    tone: {
      default: "",
      muted: "text-muted-foreground",
    },
    // Cap the paragraph at N lines with an ellipsis.
    lineClamp: {
      1: "line-clamp-1",
      2: "line-clamp-2",
      3: "line-clamp-3",
      4: "line-clamp-4",
    },
    // One line, cut off with an ellipsis.
    truncate: {
      true: "truncate",
      false: "",
    },
  },
  defaultVariants: {
    size: "default",
    tone: "default",
  },
})

function Paragraph({
  className,
  size = "default",
  tone = "default",
  lineClamp,
  truncate = false,
  ...props
}: React.ComponentProps<"p"> & VariantProps<typeof paragraphVariants>) {
  return (
    <p
      data-slot="paragraph"
      data-size={size}
      data-tone={tone}
      className={cn(
        paragraphVariants({ size, tone, lineClamp, truncate }),
        className
      )}
      {...props}
    />
  )
}

export { Paragraph, paragraphVariants }
