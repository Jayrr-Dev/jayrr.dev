import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function RendersDemoCard({
  children,
  className,
  label,
  fill,
}: {
  children: ReactNode
  className?: string
  label?: string
  /** When it is the only card, grow to the full width instead of 36rem. */
  fill?: boolean
}) {
  return (
    <div
      data-slot="demo-card"
      data-fill={fill || undefined}
      className="w-full min-w-0"
    >
      <div
        className={cn(
          "flex min-h-28 w-full flex-col justify-center rounded-xl border border-border bg-muted/20 p-3",
          className
        )}
      >
        {label ? (
          <div className="flex w-full flex-col items-stretch gap-3">
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {label}
            </span>
            <div className="flex w-full min-w-0 flex-col items-start *:max-w-full">
              {children}
            </div>
          </div>
        ) : (
          <div className="flex w-full items-center">{children}</div>
        )}
      </div>
    </div>
  )
}
