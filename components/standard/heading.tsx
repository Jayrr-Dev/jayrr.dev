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
    // Marketing headline: heavy, tight, solid line height, and never wider
    // than ~70 characters. Sizes come from the level (see compoundVariants).
    display: {
      true: "max-w-250 font-display font-extrabold leading-none tracking-[-0.4px]",
      false: "",
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
  compoundVariants: [
    // 40px on mobile, 60px from md: the hero headline.
    { display: true, level: 1, class: "text-[2.5rem] md:text-6xl" },
    // 32px on mobile, 48px from md: one per section.
    { display: true, level: 2, class: "border-b-0 pb-0 text-[2rem] md:text-5xl" },
    { display: true, level: 3, class: "text-2xl md:text-4xl" },
  ],
  defaultVariants: {
    level: 1,
    display: false,
    tone: "default",
  },
})

function Heading({
  className,
  level = 1,
  display = false,
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
      data-display={display ? true : undefined}
      data-tone={tone}
      className={cn(
        headingVariants({
          level: resolvedLevel,
          display,
          tone,
          lineClamp,
          truncate,
        }),
        className
      )}
      {...props}
    />
  )
}

// The one place a headline takes a colour: a number or figure it leads with
// ("Save 12 hours a week"). Everything else stays at full contrast.
function HeadingHighlight({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="heading-highlight"
      className={cn("text-primary", className)}
      {...props}
    />
  )
}

export { Heading, HeadingHighlight, headingVariants }
