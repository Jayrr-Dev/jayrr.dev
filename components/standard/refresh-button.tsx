import { RefreshCwIcon } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/standard/button"

/** Outline refresh action whose icon spins while `refreshing`. */
function RefreshButton({
  className,
  iconOnly = false,
  refreshing = false,
  loading,
  children,
  ...props
}: React.ComponentProps<typeof Button> & {
  iconOnly?: boolean
  refreshing?: boolean
}) {
  return (
    <Button
      data-slot="refresh-button"
      data-refreshing={refreshing || undefined}
      tone="outline"
      size="sm"
      shape={iconOnly ? "circle" : undefined}
      iconOnly={iconOnly}
      aria-label="Refresh"
      leading={<RefreshCwIcon aria-hidden className="size-3.5" />}
      loading={refreshing ? "spin-icon" : loading}
      className={cn(iconOnly && "size-8", className)}
      {...props}
    >
      {iconOnly ? null : (children ?? "Refresh")}
    </Button>
  )
}

export { RefreshButton }
