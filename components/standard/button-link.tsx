import * as React from "react"
import { ChevronLeftIcon } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/standard/button"
import type { Link } from "@/components/standard/link"

/** @deprecated Use <Button href tone="outline"> */
function ButtonLink({
  className,
  href,
  ...props
}: React.ComponentProps<typeof Link>) {
  return (
    <Button
      data-slot="button-link"
      // Without an href, Button falls back to a plain <button>.
      href={href}
      tone="outline"
      className={className}
      // Anchor props pass straight through; Button renders an <a> for href.
      {...(props as React.ComponentProps<typeof Button>)}
    />
  )
}

type ButtonBackVariant = "text" | "icon" | "icon-text"

/** @deprecated Use <Button href leading={<ChevronLeftIcon />}> */
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
  const icon = <ChevronLeftIcon aria-hidden className="size-4 shrink-0" />

  return (
    <Button
      data-slot="button-back"
      data-variant={variant}
      href={href}
      tone="outline"
      iconOnly={!showLabel}
      aria-label={
        showLabel ? undefined : typeof children === "string" ? children : "Back"
      }
      leading={showIcon && showLabel ? icon : undefined}
      className={cn("gap-1", variant === "icon-text" && "pl-2", className)}
      {...(props as React.ComponentProps<typeof Button>)}
    >
      {showLabel ? children : icon}
    </Button>
  )
}

export { ButtonBack, ButtonLink }
export type { ButtonBackVariant }
