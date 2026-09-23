import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const imageVariants = cva(
  "overflow-hidden rounded-lg bg-muted text-xs text-muted-foreground",
  {
    variants: {
      ratio: {
        wide: "aspect-video",
        square: "aspect-square",
        still: "aspect-[4/3]",
      },
    },
    defaultVariants: {
      ratio: "wide",
    },
  }
)

function Image({
  className,
  ratio = "wide",
  children,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof imageVariants>) {
  return (
    <div
      data-slot="image"
      data-ratio={ratio}
      className={cn(
        imageVariants({ ratio }),
        "flex w-full items-center justify-center",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Image, imageVariants }
