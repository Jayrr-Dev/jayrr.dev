"use client"

import * as React from "react"
import { cn } from "cn"

import { Button } from "@/components/standard/button"
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
          <Button href="#back" tone="outline" className="gap-1" onClick={onBack}>
            Back
          </Button>
        ) : null}
        <h2 className="text-xs font-semibold leading-none">{title}</h2>
        {info ? <InfoIcon label={`${title} help`} body={info} /> : null}
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </header>
  )
}

export { PageHeader }
