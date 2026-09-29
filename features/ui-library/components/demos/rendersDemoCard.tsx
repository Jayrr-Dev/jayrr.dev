import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function RendersDemoCard({
  children,
  className,
  label,
}: {
  children: ReactNode
  className?: string
  label?: string
}) {
  return (
    <li className="w-72 max-w-full only:w-[min(100%,36rem)] only:[&>*]:max-w-none">
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
            <div className="flex min-w-0 w-full flex-col items-stretch">
              {children}
            </div>
          </div>
        ) : (
          <div className="flex w-full items-center">{children}</div>
        )}
      </div>
    </li>
  )
}
