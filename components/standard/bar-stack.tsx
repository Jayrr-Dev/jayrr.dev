import * as React from "react"
import { cn } from "cn"

function BarStack({
  className,
  segments,
}: {
  className?: string
  segments: { id: string; value: number; className?: string }[]
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0)

  return (
    <div
      data-slot="bar-stack"
      className={cn("flex h-3 w-full overflow-hidden rounded-full bg-muted", className)}
    >
      {segments.map((segment) => {
        const width = total === 0 ? 0 : (segment.value / total) * 100

        return (
          <span
            key={segment.id}
            className={cn("h-full bg-primary", segment.className)}
            style={{ width: `${width}%` }}
          />
        )
      })}
    </div>
  )
}

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

function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]",
        className
      )}
      {...props}
    />
  )
}

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

export { Alert, BarStack, BroadcastBanner, Kbd, LoadingState, Spinner }
