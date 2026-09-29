import { RefreshCwIcon } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/standard/button"

function RefreshButton({
  className,
  iconOnly = false,
  refreshing = false,
  ...props
}: React.ComponentProps<typeof Button> & {
  iconOnly?: boolean
  refreshing?: boolean
}) {
  return (
    <Button
      data-slot="refresh-button"
      data-icon-only={iconOnly || undefined}
      data-refreshing={refreshing || undefined}
      tone="outline"
      size="sm"
      aria-label="Refresh"
      aria-busy={refreshing || undefined}
      className={cn(iconOnly && "size-8 rounded-full px-0", className)}
      {...props}
    >
      <RefreshCwIcon
        className={cn("size-3.5", refreshing && "animate-spin")}
      />
      {iconOnly ? null : "Refresh"}
    </Button>
  )
}

export { RefreshButton }
