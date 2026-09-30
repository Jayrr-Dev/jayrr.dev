import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const headingVariants = cva("scroll-m-20 text-balance tracking-tight", {
  variants: {
    level: {
      1: "text-4xl font-extrabold",
      2: "border-b pb-2 text-3xl font-semibold",
      3: "text-2xl font-semibold",
    },
    tone: {
      default: "",
      muted: "text-muted-foreground",
    },
    // Cap the heading at N lines with an ellipsis.
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
    level: 1,
    tone: "default",
  },
})

function Heading({
  className,
  level = 1,
  tone = "default",
  lineClamp,
  truncate = false,
  ...props
}: React.ComponentProps<"h1"> & VariantProps<typeof headingVariants>) {
  const resolvedLevel = level === 2 || level === 3 ? level : 1
  const Tag = resolvedLevel === 2 ? "h2" : resolvedLevel === 3 ? "h3" : "h1"

  return (
    <Tag
      data-slot="heading"
      data-level={resolvedLevel}
      data-tone={tone}
      className={cn(
        headingVariants({ level: resolvedLevel, tone, lineClamp, truncate }),
        className
      )}
      {...props}
    />
  )
}

export { Heading, headingVariants }
