"use client"

import * as React from "react"
import { cn } from "cn"

import { ButtonBack } from "@/components/standard/button-link"
import { InfoIcon } from "@/components/standard/info-icon"

function PageHeader({
  className,
  title,
  info,
  backLabel,
  onBack,
  children,
}: {
  className?: string
  title: string
  info?: string
  backLabel?: string
  onBack?: () => void
  children?: React.ReactNode
}) {
  return (
    <header
      data-slot="page-header"
      className={cn(
        "flex w-full items-center justify-between gap-3 border-b border-foreground px-4 py-2",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        {backLabel ? (
          <ButtonBack href="#back" onClick={onBack} />
        ) : null}
        <h2 className="text-xs font-semibold leading-none">{title}</h2>
        {info ? <InfoIcon label={`${title} help`} body={info} /> : null}
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </header>
  )
}

function ControlBar({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="control-bar"
      className={cn(
        "flex w-full flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/40 px-2 py-1.5",
        className
      )}
      {...props}
    />
  )
}

function TabNavigation({
  className,
  items,
  value,
  defaultValue,
  onValueChange,
}: {
  className?: string
  items: { id: string; label: string }[]
  value?: string
  defaultValue?: string
  onValueChange?: (id: string) => void
}) {
  const [uncontrolled, setUncontrolled] = React.useState(
    defaultValue ?? items[0]?.id
  )
  const selected = value ?? uncontrolled

  function select(id: string) {
    if (value === undefined) {
      setUncontrolled(id)
    }
    onValueChange?.(id)
  }

  return (
    <nav
      data-slot="tab-navigation"
      className={cn("flex gap-3 border-b border-border", className)}
    >
      {items.map((item) => {
        const isOn = item.id === selected

        return (
          <button
            key={item.id}
            type="button"
            className={cn(
              "border-b-2 pb-1 text-sm",
              isOn
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground"
            )}
            onClick={() => select(item.id)}
          >
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}

export { ControlBar, PageHeader, TabNavigation }
