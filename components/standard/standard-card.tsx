import * as React from "react"
import { cn } from "cn"

function StandardCard({
  className,
  title,
  meta,
  children,
  ...props
}: React.ComponentProps<"article"> & {
  title: string
  meta?: string
}) {
  return (
    <article
      data-slot="standard-card"
      className={cn(
        "flex w-full flex-col rounded-xl border border-border bg-card",
        className
      )}
      {...props}
    >
      <header className="border-b border-border px-3 py-2 text-center text-sm font-semibold">
        {title}
      </header>
      {meta ? (
        <p className="px-3 pt-2 text-xs text-muted-foreground">{meta}</p>
      ) : null}
      <div className="px-3 py-2 text-sm">{children}</div>
    </article>
  )
}

export { StandardCard }
