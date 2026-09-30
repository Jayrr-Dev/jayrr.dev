"use client"

import * as React from "react"
import { cn } from "cn"

import { Button } from "@/components/standard/button"
import {
  Sheet as SheetRoot,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

type SheetSide = "top" | "right" | "bottom" | "left"
type SheetSize = "sm" | "md" | "lg" | "full"

// Width for side sheets, height cap for top and bottom ones. Prefixed with
// the side so they win over the ui sheet's own data-[side] sizes.
const SHEET_SIZE_CLASS: Record<SheetSize, string> = {
  sm: "data-[side=left]:w-[min(18rem,100vw)] data-[side=right]:w-[min(18rem,100vw)] data-[side=left]:sm:max-w-none data-[side=right]:sm:max-w-none data-[side=top]:max-h-[40dvh] data-[side=bottom]:max-h-[40dvh]",
  md: "data-[side=left]:w-[min(24rem,100vw)] data-[side=right]:w-[min(24rem,100vw)] data-[side=left]:sm:max-w-none data-[side=right]:sm:max-w-none data-[side=top]:max-h-[60dvh] data-[side=bottom]:max-h-[60dvh]",
  lg: "data-[side=left]:w-[min(36rem,100vw)] data-[side=right]:w-[min(36rem,100vw)] data-[side=left]:sm:max-w-none data-[side=right]:sm:max-w-none data-[side=top]:max-h-[80dvh] data-[side=bottom]:max-h-[80dvh]",
  full: "data-[side=left]:w-screen data-[side=right]:w-screen data-[side=left]:sm:max-w-none data-[side=right]:sm:max-w-none data-[side=top]:h-dvh data-[side=bottom]:h-dvh",
}

function Sheet({
  className,
  title,
  description,
  trigger = "Open sheet",
  side = "right",
  size = "sm",
  footer,
  open,
  defaultOpen,
  onOpenChange,
  children,
}: {
  className?: string
  title: string
  /** Shown under the title. Screen readers get the title when it is left out. */
  description?: string
  /** A string renders an outline button; pass an element to use your own. */
  trigger?: React.ReactNode
  side?: SheetSide
  size?: SheetSize
  /**
   * Pinned under the body, e.g. Save and Cancel buttons. Leave it out for the
   * default Close button, or pass null for no footer.
   */
  footer?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}) {
  const triggerNode =
    typeof trigger === "string" ? (
      <Button tone="outline">{trigger}</Button>
    ) : (
      trigger
    )

  const footerNode =
    footer === undefined ? (
      <SheetClose asChild>
        <Button tone="outline">Close</Button>
      </SheetClose>
    ) : (
      footer
    )

  return (
    <SheetRoot open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{triggerNode}</SheetTrigger>
      <SheetContent
        data-size={size}
        side={side}
        className={cn("gap-0", SHEET_SIZE_CLASS[size], className)}
      >
        <SheetHeader className="pr-12">
          <SheetTitle className="text-sm font-semibold">{title}</SheetTitle>
          <SheetDescription className={description ? undefined : "sr-only"}>
            {description ?? title}
          </SheetDescription>
        </SheetHeader>
        <div
          data-slot="sheet-body"
          className="min-h-0 flex-1 overflow-y-auto px-4"
        >
          {children}
        </div>
        {footerNode != null ? (
          <SheetFooter className="border-t border-border">{footerNode}</SheetFooter>
        ) : null}
      </SheetContent>
    </SheetRoot>
  )
}

export { Sheet }
export type { SheetSide, SheetSize }
