"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { cn } from "cn"

import { Button } from "@/components/standard/button"

function Dialog({
  className,
  title,
  description,
  trigger = "Open",
  children,
  open,
  onOpenChange,
}: {
  className?: string
  title: string
  description?: string
  trigger?: React.ReactNode
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const triggerNode =
    typeof trigger === "string" ? (
      <Button tone="outline">{trigger}</Button>
    ) : (
      trigger
    )

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Trigger asChild>{triggerNode}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <DialogPrimitive.Content
          className={cn(
            "fixed top-1/2 left-1/2 z-50 w-[min(100%,24rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-background p-4 text-foreground shadow-lg",
            className
          )}
        >
          <DialogPrimitive.Title className="text-base font-semibold">
            {title}
          </DialogPrimitive.Title>
          {description ? (
            <DialogPrimitive.Description className="mt-1 text-sm text-muted-foreground">
              {description}
            </DialogPrimitive.Description>
          ) : (
            <DialogPrimitive.Description className="sr-only">
              {title}
            </DialogPrimitive.Description>
          )}
          {children ? <div className="mt-3 flex flex-col gap-3">{children}</div> : null}
          <DialogPrimitive.Close asChild>
            <Button tone="outline" size="sm" className="mt-3">
              Close
            </Button>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export { Dialog }
