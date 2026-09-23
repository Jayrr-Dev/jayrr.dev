import * as React from "react"
import { cn } from "cn"

function CardBar({
  className,
  title,
  description,
  ...props
}: React.ComponentProps<"button"> & {
  title: string
  description?: string
}) {
  return (
    <button
      data-slot="card-bar"
      type="button"
      className={cn(
        "flex w-full flex-col items-start gap-0.5 rounded-xl border border-border bg-card px-3 py-2 text-left hover:bg-muted",
        className
      )}
      {...props}
    >
      <span className="text-sm font-medium">{title}</span>
      {description ? (
        <span className="text-xs text-muted-foreground">{description}</span>
      ) : null}
    </button>
  )
}

function BentoGrid({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="bento-grid"
      className={cn("grid grid-cols-2 gap-2", className)}
      {...props}
    />
  )
}

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

export { BentoGrid, CardBar, StandardCard }
