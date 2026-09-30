"use client"

import * as React from "react"
import { XIcon } from "lucide-react"
import { toast as sonner, Toaster as SonnerToaster, type ToasterProps } from "sonner"
import { cn } from "cn"

type ToastAction = {
  label: string
  onClick?: () => void
}

type ToastOptions = {
  tone?: "default" | "danger"
  /** `snackbar` follows Material 3: inverse surface, bottom-center, optional action. */
  variant?: "toast" | "snackbar"
  /** A single text action, e.g. Undo or Retry. Dismisses the toast when pressed. */
  action?: ToastAction
  /** Shows a close icon button. */
  dismissible?: boolean
  /** Snackbar only. Puts a long action label on its own line. */
  stackAction?: boolean
  /** In ms. Defaults to 2.4s for toasts, 4s for snackbars, 6s with an action. */
  duration?: number
}

/**
 * Where toasts appear. Mount once near the root of the app; any Sonner
 * Toaster works too, since standard toasts bring their own surface.
 */
function Toaster(props: ToasterProps) {
  return <SonnerToaster position="bottom-right" {...props} />
}

function ToastActions({
  action,
  dismissible,
  onDismiss,
  inverse,
  className,
}: {
  action?: ToastAction
  dismissible?: boolean
  onDismiss: () => void
  inverse: boolean
  className?: string
}) {
  if (!action && !dismissible) return null

  const hover = inverse
    ? "hover:bg-background/10 focus-visible:ring-background/50 active:bg-background/20"
    : "hover:bg-muted focus-visible:ring-ring/50 active:bg-muted/70"

  return (
    <div className={cn("flex shrink-0 items-center gap-1", className)}>
      {action ? (
        <button
          type="button"
          onClick={() => {
            action.onClick?.()
            onDismiss()
          }}
          className={cn(
            "h-9 rounded-sm px-3 font-medium outline-none focus-visible:ring-2",
            hover
          )}
        >
          {action.label}
        </button>
      ) : null}
      {dismissible ? (
        <button
          type="button"
          aria-label="Dismiss"
          onClick={onDismiss}
          className={cn(
            "grid size-9 place-items-center rounded-full opacity-80 outline-none hover:opacity-100 focus-visible:ring-2",
            hover
          )}
        >
          <XIcon className="size-4" />
        </button>
      ) : null}
    </div>
  )
}

/**
 * Shows a short message. Needs a Toaster mounted somewhere in the app.
 * Returns the toast id, for `toast.dismiss(id)`.
 */
function toast(message: React.ReactNode, options: ToastOptions = {}) {
  const {
    tone = "default",
    variant = "toast",
    action,
    dismissible = false,
    stackAction = false,
    duration,
  } = options
  const snackbar = variant === "snackbar"

  return sonner.custom(
    (id) => {
      const dismiss = () => sonner.dismiss(id)

      if (snackbar) {
        return (
          <div
            data-slot="snackbar"
            className={cn(
              "mx-auto flex w-max max-w-[min(42rem,calc(100vw-2rem))] min-w-[min(21.5rem,calc(100vw-2rem))] rounded-sm bg-foreground text-sm text-background shadow-lg",
              stackAction
                ? "flex-col items-stretch gap-1 py-2 pr-2 pl-4"
                : "min-h-12 items-center gap-2 py-1.5 pr-2 pl-4"
            )}
          >
            <span className={cn("flex-1", stackAction && "pt-2 pr-2")}>
              {message}
            </span>
            <ToastActions
              action={action}
              dismissible={dismissible}
              onDismiss={dismiss}
              inverse
              className={stackAction ? "self-end" : undefined}
            />
          </div>
        )
      }

      return (
        <div
          data-slot="toast"
          data-tone={tone}
          className={cn(
            "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm shadow-lg",
            tone === "danger"
              ? "bg-destructive text-white"
              : "border border-border bg-background text-foreground"
          )}
        >
          <span className="flex-1">{message}</span>
          <ToastActions
            action={action}
            dismissible={dismissible}
            onDismiss={dismiss}
            inverse={tone === "danger"}
          />
        </div>
      )
    },
    {
      duration: duration ?? (snackbar ? (action ? 6000 : 4000) : 2400),
      position: snackbar ? "bottom-center" : undefined,
      // Sonner pins toasts to the left of its 356px column, so a wider
      // snackbar drifts right. Center it; below 601px Sonner goes full width.
      className: snackbar
        ? "min-[601px]:left-1/2 min-[601px]:-translate-x-1/2"
        : undefined,
    }
  )
}

toast.dismiss = sonner.dismiss

export { Toaster, toast }
export type { ToastAction, ToastOptions }
