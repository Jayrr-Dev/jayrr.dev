import * as React from "react"
import { cn } from "cn"

function Alert({
  className,
  title,
  children,
}: React.ComponentProps<"div"> & { title: string }) {
  return (
    <div
      data-slot="alert"
      className={cn(
        "w-full rounded-lg border border-border bg-muted/40 p-3",
        className
      )}
    >
      <p className="text-sm font-medium">{title}</p>
      <div className="text-sm text-muted-foreground">{children}</div>
    </div>
  )
}

export { Alert }
