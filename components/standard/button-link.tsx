import * as React from "react"
import { ChevronLeftIcon } from "lucide-react"
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

type ButtonBackVariant = "text" | "icon" | "icon-text"

function ButtonBack({
  className,
  href = "#back",
  variant = "text",
  children = "Back",
  ...props
}: React.ComponentProps<typeof ButtonLink> & {
  variant?: ButtonBackVariant
}) {
  const showIcon = variant !== "text"
  const showLabel = variant !== "icon"

  return (
    <ButtonLink
      data-slot="button-back"
      data-variant={variant}
      href={href}
      aria-label={showLabel ? undefined : typeof children === "string" ? children : "Back"}
      className={cn(
        "gap-1",
        variant === "icon" && "w-8 justify-center px-0",
        variant === "icon-text" && "pl-2",
        className
      )}
      {...props}
    >
      {showIcon ? <ChevronLeftIcon aria-hidden className="size-4 shrink-0" /> : null}
      {showLabel ? children : null}
    </ButtonLink>
  )
}

export { ButtonBack, ButtonLink }
export type { ButtonBackVariant }
