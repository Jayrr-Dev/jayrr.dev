import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

import { Heading } from "@/components/standard/heading"
import { Paragraph } from "@/components/standard/paragraph"

const headlineVariants = cva("flex w-full flex-col gap-10", {
  variants: {
    align: {
      // Stacked and centred; the trailing media sits below the copy.
      center: "items-center text-center",
      // Copy on the left, trailing media beside it from md.
      start: "items-start text-start md:grid md:grid-cols-2 md:items-center",
    },
  },
  defaultVariants: {
    align: "center",
  },
})

/**
 * One section of a landing page: one headline, one paragraph, one call to
 * action and one piece of media. The headline uses Heading's display style.
 */
function Headline({
  className,
  title,
  description,
  action,
  leading,
  trailing,
  level = 1,
  align = "center",
  ...props
}: Omit<React.ComponentProps<"section">, "title"> &
  VariantProps<typeof headlineVariants> & {
    /** The headline. Keep it to one idea and two lines (~70 characters). */
    title: React.ReactNode
    /** One supporting paragraph. */
    description?: React.ReactNode
    /** One call to action, usually a Button. */
    action?: React.ReactNode
    /** Above the headline: an eyebrow, badge or social proof. */
    leading?: React.ReactNode
    /** After the copy: one image, video or demo. */
    trailing?: React.ReactNode
    /** 1 for the page hero, 2 for every section after it. */
    level?: 1 | 2
  }) {
  const centered = align !== "start"

  return (
    <section
      data-slot="headline"
      data-align={align}
      className={cn(headlineVariants({ align }), className)}
      {...props}
    >
      <div
        data-slot="headline-copy"
        className={cn(
          "flex flex-col gap-5",
          centered ? "items-center" : "items-start"
        )}
      >
        {leading ? <div data-slot="headline-leading">{leading}</div> : null}
        <Heading level={level} display>
          {title}
        </Heading>
        {description ? (
          <Paragraph
            tone="muted"
            className="max-w-xl text-lg leading-relaxed"
          >
            {description}
          </Paragraph>
        ) : null}
        {action ? (
          <div
            data-slot="headline-action"
            className={cn(
              "flex flex-wrap gap-3 pt-2",
              centered && "justify-center"
            )}
          >
            {action}
          </div>
        ) : null}
      </div>
      {trailing ? (
        <div data-slot="headline-trailing" className="w-full">
          {trailing}
        </div>
      ) : null}
    </section>
  )
}

export { Headline, headlineVariants }
