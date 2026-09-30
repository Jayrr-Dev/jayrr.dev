import * as React from "react"
import { cn } from "cn"

import { Button } from "@/components/standard/button"

/** @deprecated Use <Button iconOnly aria-label> */
function ButtonIcon({
  className,
  label,
  children,
  ...props
}: React.ComponentProps<typeof Button> & { label: string }) {
  return (
    <Button
      data-slot="button-icon"
      iconOnly
      aria-label={label}
      size="sm"
      // Keeps the original 32px box with small text.
      className={cn("size-8", className)}
      {...props}
    >
      {children}
    </Button>
  )
}

export { ButtonIcon }
