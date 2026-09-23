"use client"

import * as React from "react"
import { cn } from "cn"
import { Tooltip as TooltipPrimitive } from "radix-ui"

function Tooltip({
  label,
  body,
  tone = "default",
  children,
}: {
  label: string
  body: string
  tone?: "default" | "danger"
  children?: React.ReactNode
}) {
  return (
    <TooltipPrimitive.Provider delayDuration={200}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {children ?? (
            <button
              type="button"
              className="rounded-md border border-border px-2 py-1 text-xs"
            >
              {label}
            </button>
          )}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            sideOffset={6}
            className={cn(
              "z-50 max-w-xs rounded-md px-2 py-1 text-xs shadow-md",
              tone === "danger"
                ? "bg-destructive text-white"
                : "bg-foreground text-background"
            )}
          >
            {body}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}

export { Tooltip }
