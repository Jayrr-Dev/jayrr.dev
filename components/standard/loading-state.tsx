import * as React from "react"
import { cn } from "cn"

function Spinner({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="spinner"
      className={cn(
        "size-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground",
        className
      )}
      {...props}
    />
  )
}

function LoadingState({
  className,
  label = "Loading",
}: {
  className?: string
  label?: string
}) {
  return (
    <div
      data-slot="loading-state"
      className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}
    >
      <Spinner />
      {label}
    </div>
  )
}

export { LoadingState, Spinner }
