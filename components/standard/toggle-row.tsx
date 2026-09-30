import * as React from "react"
import { cn } from "cn"

function ToggleRow({
  className,
  label,
  children,
}: {
  className?: string
  label: string
  children: React.ReactNode
}) {
  return (
    <div
      data-slot="toggle-row"
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-lg border border-border px-3 py-2",
        className
      )}
    >
      <span className="text-sm">{label}</span>
      {children}
    </div>
  )
}

export { ToggleRow }
