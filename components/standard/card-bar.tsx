import * as React from "react"
import { cn } from "cn"

function CardBar({
  className,
  title,
  description,
  leading,
  trailing,
  selected,
  size = "default",
  ...props
}: React.ComponentProps<"button"> & {
  title: string
  description?: string
  /** Content before the text, e.g. an icon, avatar or thumbnail. */
  leading?: React.ReactNode
  /** Content after the text, e.g. a chevron, badge or count. */
  trailing?: React.ReactNode
  /** Marks the bar as the chosen one in a list; sets aria-pressed. */
  selected?: boolean
  size?: "sm" | "default"
}) {
  const isSmall = size === "sm"

  return (
    <button
      data-slot="card-bar"
      data-size={size}
      data-selected={selected || undefined}
      aria-pressed={selected}
      type="button"
      className={cn(
        "flex w-full items-center rounded-xl border border-border bg-card text-left outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
        isSmall ? "gap-2 rounded-lg px-2.5 py-1.5" : "gap-3 px-3 py-2",
        selected && "border-primary bg-primary/5 ring-1 ring-primary hover:bg-primary/10",
        className
      )}
      {...props}
    >
      {leading != null ? (
        <span
          data-slot="card-bar-leading"
          className="flex shrink-0 items-center text-muted-foreground"
        >
          {leading}
        </span>
      ) : null}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className={cn("font-medium", isSmall ? "text-xs" : "text-sm")}>
          {title}
        </span>
        {description ? (
          <span className="text-xs text-muted-foreground">{description}</span>
        ) : null}
      </span>
      {trailing != null ? (
        <span
          data-slot="card-bar-trailing"
          className="flex shrink-0 items-center text-muted-foreground"
        >
          {trailing}
        </span>
      ) : null}
    </button>
  )
}

export { CardBar }
