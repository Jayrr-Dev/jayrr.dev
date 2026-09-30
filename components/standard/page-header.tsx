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

export { PageHeader }

// Moved to their own files; re-exported so existing imports keep working.
export { ControlBar } from "@/components/standard/control-bar"
export { TabNavigation } from "@/components/standard/tab-navigation"
