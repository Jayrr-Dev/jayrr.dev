import * as React from "react"
import { cn } from "cn"

function BroadcastBanner({
  className,
  title,
  children,
}: React.ComponentProps<"div"> & { title: string }) {
  return (
    <div
      data-slot="broadcast-banner"
      className={cn(
        "w-full rounded-lg border border-border bg-primary/10 px-3 py-2 text-sm",
        className
      )}
    >
      <p className="font-medium">{title}</p>
      {children}
    </div>
  )
}

export { BroadcastBanner }
