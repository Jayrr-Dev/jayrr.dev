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
  },
  defaultVariants: {
    level: 1,
  },
})

function Heading({
  className,
  level = 1,
  ...props
}: React.ComponentProps<"h1"> & VariantProps<typeof headingVariants>) {
  if (level === 2) {
    return (
      <h2
        data-slot="heading"
        data-level={level}
        className={cn(headingVariants({ level }), className)}
        {...props}
      />
    )
  }

  if (level === 3) {
    return (
      <h3
        data-slot="heading"
        data-level={level}
        className={cn(headingVariants({ level }), className)}
        {...props}
      />
    )
  }

  return (
    <h1
      data-slot="heading"
      data-level={1}
      className={cn(headingVariants({ level: 1 }), className)}
      {...props}
    />
  )
}

export { Heading, headingVariants }
