"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { Dialog as DialogPrimitive } from "radix-ui"
import { CircleMinus, CircleStop, CircleX, Maximize2 } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/standard/button"

type DialogControl = "minimize" | "maximize" | "close"

// "inline" sits beside the title; "gutter" pins smaller controls into the
// card's corner padding so the title keeps its full width.
type DialogControlsPlacement = "inline" | "gutter"

type DialogSize = "sm" | "md" | "lg" | "xl" | "full"

const DIALOG_SIZE_CLASS: Record<DialogSize, string> = {
  sm: "w-[min(100%,20rem)]",
  md: "w-[min(100%,24rem)]",
  lg: "w-[min(100%,32rem)]",
  xl: "w-[min(100%,42rem)]",
  // Fills the viewport less a margin; maximize still goes edge to edge.
  full: "h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-none",
}

const DIALOG_DOCK_ID = "standard-dialog-dock"

const DIALOG_DOCK_CLASS =
  "pointer-events-none fixed right-3 bottom-3 z-50 flex flex-col-reverse items-end gap-2"

const DIALOG_CONTROL_CLASS =
  "group inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-sm text-muted-foreground opacity-70 transition-opacity outline-none hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring"

const DIALOG_CONTROL_ICON_CLASS = "pointer-events-none size-4 transition-colors"

const DIALOG_CONTROLS_PLACEMENT_CLASS: Record<DialogControlsPlacement, string> =
  {
    inline: "top-3 right-3",
    gutter: "top-1 right-1.5 [&_button]:size-3.5 [&_svg]:size-3",
  }

// One shared corner dock, so minimized dialogs stack without a provider.
// Created on the first minimize (an event, so never during render or SSR).
function ensuresDialogDock() {
  let node = document.getElementById(DIALOG_DOCK_ID)
  if (!node) {
    node = document.createElement("div")
    node.id = DIALOG_DOCK_ID
    node.className = DIALOG_DOCK_CLASS
    document.body.appendChild(node)
  }
  return node
}

function Dialog({
  className,
  title,
  description,
  trigger = "Open",
  children,
  open,
  onOpenChange,
  controls = [],
  defaultMaximized = false,
  controlsPlacement = "inline",
  size = "md",
}: {
  className?: string
  title: string
  description?: string
  trigger?: React.ReactNode
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  controls?: DialogControl[]
  defaultMaximized?: boolean
  controlsPlacement?: DialogControlsPlacement
  /** Width of the card. `full` fills the viewport less a margin. */
  size?: DialogSize
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const [isMinimized, setIsMinimized] = React.useState(false)
  const [isMaximized, setIsMaximized] = React.useState(defaultMaximized)
  const [dock, setDock] = React.useState<HTMLElement | null>(null)
  const [previousOpen, setPreviousOpen] = React.useState(open)

  const isOpen = open ?? uncontrolledOpen
  const canMinimize = controls.includes("minimize")
  const canMaximize = controls.includes("maximize")
  const canClose = controls.includes("close")
  const hasControls = canMinimize || canMaximize || canClose
  const isMinimizedActive = isOpen && isMinimized

  const setOpen = (nextOpen: boolean) => {
    if (!nextOpen) {
      setIsMinimized(false)
      setIsMaximized(defaultMaximized)
    }
    if (open === undefined) {
      setUncontrolledOpen(nextOpen)
    }
    onOpenChange?.(nextOpen)
  }

  // A parent closing a controlled dialog also clears the minimized state.
  if (open !== previousOpen) {
    setPreviousOpen(open)
    if (open === false) {
      setIsMinimized(false)
    }
  }

  const minimize = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
    setDock(ensuresDialogDock())
    setIsMinimized(true)
  }

  const blockWhileMinimized = (event: Event) => {
    if (isMinimizedActive) {
      event.preventDefault()
    }
  }

  const triggerNode =
    typeof trigger === "string" ? (
      <Button tone="outline">{trigger}</Button>
    ) : (
      trigger
    )

  const maximizeLabel = isMaximized ? "Restore" : "Maximize"

  return (
    <DialogPrimitive.Root
      open={isOpen}
      onOpenChange={setOpen}
      modal={!isMinimizedActive}
    >
      <DialogPrimitive.Trigger asChild>{triggerNode}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <DialogPrimitive.Content
          inert={isMinimizedActive || undefined}
          data-size={size}
          data-maximized={isMaximized ? "" : undefined}
          data-minimized={isMinimizedActive ? "" : undefined}
          onEscapeKeyDown={blockWhileMinimized}
          onInteractOutside={blockWhileMinimized}
          className={cn(
            "fixed top-1/2 left-1/2 z-50 max-h-[calc(100dvh-2rem)] min-w-72 -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-border bg-background p-4 text-foreground shadow-lg",
            DIALOG_SIZE_CLASS[size],
            className,
            isMaximized &&
              "top-0 left-0 h-dvh max-h-none w-screen max-w-none translate-x-0 translate-y-0 rounded-none border-0",
            isMinimizedActive && "pointer-events-none invisible"
          )}
        >
          {hasControls ? (
            <div
              data-slot="dialog-controls"
              data-placement={controlsPlacement}
              className={cn(
                "absolute flex items-center",
                DIALOG_CONTROLS_PLACEMENT_CLASS[controlsPlacement]
              )}
            >
              {canMinimize ? (
                <button
                  type="button"
                  aria-label="Minimize"
                  className={DIALOG_CONTROL_CLASS}
                  onClick={minimize}
                >
                  <CircleMinus
                    aria-hidden
                    className={cn(
                      DIALOG_CONTROL_ICON_CLASS,
                      "group-hover:text-blue-600 dark:group-hover:text-blue-400"
                    )}
                  />
                </button>
              ) : null}
              {canMaximize ? (
                <button
                  type="button"
                  aria-label={maximizeLabel}
                  aria-pressed={isMaximized}
                  className={DIALOG_CONTROL_CLASS}
                  onClick={() => setIsMaximized((current) => !current)}
                >
                  <CircleStop
                    aria-hidden
                    className={cn(
                      DIALOG_CONTROL_ICON_CLASS,
                      "group-hover:text-blue-600 dark:group-hover:text-blue-400"
                    )}
                  />
                </button>
              ) : null}
              {canClose ? (
                <DialogPrimitive.Close
                  aria-label="Close"
                  className={DIALOG_CONTROL_CLASS}
                >
                  <CircleX
                    aria-hidden
                    className={cn(
                      DIALOG_CONTROL_ICON_CLASS,
                      "group-hover:text-red-600 dark:group-hover:text-red-400"
                    )}
                  />
                </DialogPrimitive.Close>
              ) : null}
            </div>
          ) : null}
          <DialogPrimitive.Title
            className={cn(
              "text-base font-semibold",
              hasControls && controlsPlacement === "inline" && "pr-20"
            )}
          >
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
          {children ? (
            <div className="mt-3 flex flex-col gap-3">{children}</div>
          ) : null}
          {canClose ? null : (
            <DialogPrimitive.Close asChild>
              <Button tone="outline" size="sm" className="mt-3">
                Close
              </Button>
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
      {isMinimizedActive && dock
        ? createPortal(
            <button
              type="button"
              title={title}
              aria-label={`Restore dialog: ${title}`}
              onClick={() => setIsMinimized(false)}
              className="group pointer-events-auto flex h-8 max-w-44 cursor-pointer items-center gap-1.5 rounded-full border border-border bg-background px-3 text-xs font-medium text-foreground shadow-md transition-shadow outline-none hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Maximize2 aria-hidden className="size-3 shrink-0" />
              <span className="truncate">{title}</span>
            </button>,
            dock
          )
        : null}
    </DialogPrimitive.Root>
  )
}

export { Dialog }
export type { DialogControl, DialogControlsPlacement, DialogSize }
