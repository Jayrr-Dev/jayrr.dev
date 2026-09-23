import { RefreshCwIcon } from "lucide-react"

import { Button } from "@/components/standard/button"

function RefreshButton({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      data-slot="refresh-button"
      tone="outline"
      size="sm"
      aria-label="Refresh"
      className={className}
      {...props}
    >
      <RefreshCwIcon className="size-3.5" />
      Refresh
    </Button>
  )
}

export { RefreshButton }
