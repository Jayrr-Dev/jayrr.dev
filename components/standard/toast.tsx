"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { XIcon } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/standard/button"

type ToastAction = {
  label: string
  onClick?: () => void
}

function ToastButton({
  message,
  tone = "default",
  variant = "toast",
  action,
  dismissible = false,
  stackAction = false,
  duration,
  children,
}: {
  message: string
  tone?: "default" | "danger"
  /** `snackbar` follows Material 3: inverse surface, bottom-center, optional action. */
  variant?: "toast" | "snackbar"
  /** Snackbar only. A single text action, e.g. Undo or Retry. */
  action?: ToastAction
  /** Snackbar only. Shows a close icon button. */
  dismissible?: boolean
  /** Snackbar only. Puts a long action label on its own line. */
  stackAction?: boolean
  duration?: number
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)
  const timeoutRef = React.useRef<number | undefined>(undefined)

  const isSnackbar = variant === "snackbar"
  const resolvedDuration =
    duration ?? (isSnackbar ? (action ? 6000 : 4000) : 2400)

  React.useEffect(() => () => window.clearTimeout(timeoutRef.current), [])

  function hide() {
    window.clearTimeout(timeoutRef.current)
    setOpen(false)
  }

  function show() {
    window.clearTimeout(timeoutRef.current)
    setOpen(true)
    timeoutRef.current = window.setTimeout(() => setOpen(false), resolvedDuration)
  }

  return (
    <>
      <Button tone="outline" size="sm" onClick={show}>
        {children}
      </Button>
      {open
        ? createPortal(
            isSnackbar ? (
              <div
                data-slot="snackbar"
                role="status"
                aria-live="polite"
                className={cn(
                  "fixed bottom-4 left-1/2 z-50 flex w-max max-w-[min(42rem,calc(100vw-2rem))] min-w-[min(21.5rem,calc(100vw-2rem))] -translate-x-1/2 rounded-sm bg-foreground text-sm text-background shadow-lg animate-in fade-in slide-in-from-bottom-2",
                  stackAction
                    ? "flex-col items-stretch gap-1 py-2 pr-2 pl-4"
                    : "min-h-12 items-center gap-2 py-1.5 pr-2 pl-4"
                )}
              >
                <span className={cn("flex-1", stackAction && "pt-2 pr-2")}>
                  {message}
                </span>
                {action || dismissible ? (
                  <div
                    className={cn(
                      "flex shrink-0 items-center gap-1",
                      stackAction && "self-end"
                    )}
                  >
                    {action ? (
                      <button
                        type="button"
                        onClick={() => {
                          action.onClick?.()
                          hide()
                        }}
                        className="h-9 rounded-sm px-3 font-medium text-background outline-none hover:bg-background/10 focus-visible:ring-2 focus-visible:ring-background/50 active:bg-background/20"
                      >
                        {action.label}
                      </button>
                    ) : null}
                    {dismissible ? (
                      <button
                        type="button"
                        aria-label="Dismiss"
                        onClick={hide}
                        className="grid size-9 place-items-center rounded-full text-background/80 outline-none hover:bg-background/10 hover:text-background focus-visible:ring-2 focus-visible:ring-background/50 active:bg-background/20"
                      >
                        <XIcon className="size-4" />
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : (
              <div
                data-slot="toast"
                role="status"
                className={cn(
                  "fixed right-4 bottom-4 z-50 rounded-lg px-3 py-2 text-sm shadow-lg",
                  tone === "danger"
                    ? "bg-destructive text-white"
                    : "border border-border bg-background"
                )}
              >
                {message}
              </div>
            ),
            document.body
          )
        : null}
    </>
  )
}

export { ToastButton }
export type { ToastAction }
