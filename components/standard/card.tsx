import * as React from "react"
import { cn } from "cn"

function Card({ className, ...props }: React.ComponentProps<"article">) {
  return (
    <article
      data-slot="card"
      className={cn(
        "flex w-full flex-col gap-3 rounded-xl border border-border bg-card p-4 text-card-foreground has-[>[data-slot=card-left],>[data-slot=card-right]]:flex-row has-[>[data-slot=card-left],>[data-slot=card-right]]:gap-0 has-[>[data-slot=card-left],>[data-slot=card-right]]:overflow-hidden has-[>[data-slot=card-left],>[data-slot=card-right]]:p-0",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"header">) {
  return (
    <header
      data-slot="card-header"
      className={cn("flex flex-col gap-1", className)}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="card-title"
      className={cn("text-base font-semibold", className)}
      {...props}
    />
  )
}

function CardBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-body"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  )
}

function CardMain({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-main"
      className={cn("flex min-w-0 flex-1 flex-col gap-3 p-4", className)}
      {...props}
    />
  )
}

function CardLeft({ className, ...props }: React.ComponentProps<"aside">) {
  return (
    <aside
      data-slot="card-left"
      className={cn(
        "flex shrink-0 flex-col gap-2 border-r border-border bg-muted/50 p-4",
        className
      )}
      {...props}
    />
  )
}

function CardRight({ className, ...props }: React.ComponentProps<"aside">) {
  return (
    <aside
      data-slot="card-right"
      className={cn(
        "flex shrink-0 flex-col gap-2 border-l border-border bg-muted/50 p-4",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardLeft,
  CardMain,
  CardRight,
  CardTitle,
}
