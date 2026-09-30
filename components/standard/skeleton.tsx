import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

import { Skeleton as SkeletonBlock } from "@/components/ui/skeleton"

const skeletonVariants = cva("", {
  variants: {
    shape: {
      // A line of text.
      text: "h-3 w-full rounded",
      // An avatar or icon.
      circle: "size-10 rounded-full",
      // A card, image or block of content.
      rect: "h-16 w-full rounded-lg",
    },
  },
})

function Skeleton({
  className,
  shape,
  lines,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof skeletonVariants> & {
    /** Stacked text lines; the last one is shorter, like a paragraph end. */
    lines?: number
  }) {
  if (lines !== undefined && lines > 0) {
    return (
      <div
        data-slot="skeleton-lines"
        className={cn("flex w-full flex-col gap-2", className)}
        {...props}
      >
        {Array.from({ length: lines }, (_, index) => (
          <SkeletonBlock
            key={index}
            className={cn(
              skeletonVariants({ shape: "text" }),
              index === lines - 1 && lines > 1 && "w-2/3"
            )}
          />
        ))}
      </div>
    )
  }

  return (
    <SkeletonBlock
      data-shape={shape ?? undefined}
      className={cn(skeletonVariants({ shape }), className)}
      {...props}
    />
  )
}

export { Skeleton, skeletonVariants }
