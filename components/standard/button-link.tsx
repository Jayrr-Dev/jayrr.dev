import * as React from "react"
import { cn } from "cn"

import { Link } from "@/components/standard/link"

function ButtonLink({
  className,
  ...props
}: React.ComponentProps<typeof Link>) {
  return (
    <Link
      data-slot="button-link"
      className={cn(
        "inline-flex h-8 items-center rounded-lg border border-input px-3 text-sm no-underline hover:bg-muted",
        className
      )}
      {...props}
    />
  )
}

function ButtonBack({
  className,
  href = "#back",
  ...props
}: React.ComponentProps<typeof ButtonLink>) {
  return (
    <ButtonLink
      data-slot="button-back"
      href={href}
      className={cn("gap-1", className)}
      {...props}
    >
      Back
    </ButtonLink>
  )
}

export { ButtonBack, ButtonLink }
