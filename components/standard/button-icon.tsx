import * as React from "react"
import { cn } from "cn"

import { Button } from "@/components/standard/button"

function ButtonIcon({
  className,
  label,
  children,
  ...props
}: React.ComponentProps<typeof Button> & { label: string }) {
  return (
    <Button
      data-slot="button-icon"
      aria-label={label}
      size="sm"
      className={cn("size-8 px-0", className)}
      {...props}
    >
      {children}
    </Button>
  )
}

export { ButtonIcon }
