"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { cn } from "cn"

import { Button } from "@/components/standard/button"

function Sheet({
  className,
  title,
  trigger = "Open sheet",
  children,
}: {
  className?: string
  title: string
  trigger?: string
  children?: React.ReactNode
}) {
  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger asChild>
        <Button tone="outline">{trigger}</Button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <DialogPrimitive.Content
          className={cn(
            "fixed top-0 right-0 z-50 flex h-full w-72 flex-col gap-3 border-l border-border bg-background p-4 shadow-lg",
            className
          )}
        >
          <DialogPrimitive.Title className="text-sm font-semibold">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            {title}
          </DialogPrimitive.Description>
          <div className="min-h-0 flex-1">{children}</div>
          <DialogPrimitive.Close asChild>
            <Button tone="outline">Close</Button>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export { Sheet }
