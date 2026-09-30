"use client"

import * as React from "react"

import { Button } from "@/components/standard/button"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { useControllableState } from "@/hooks/use-controllable-state"

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as PromiseLike<unknown>).then === "function"
  )
}

// An alert dialog (role="alertdialog"): focus starts on Cancel, Escape
// cancels, and clicking the backdrop does nothing, so a destructive action is
// never taken by accident.
function ConfirmDialog({
  className,
  title,
  description,
  trigger = "Confirm",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  requireText,
  onConfirm,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
}: {
  className?: string
  title: string
  description: string
  /** A string renders an outline button; pass an element to use your own. */
  trigger?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  /** `danger` (the default) paints the confirm button red. */
  tone?: "default" | "danger"
  /** The confirm button stays disabled until this exact text is typed. */
  requireText?: string
  /**
   * Return a promise to keep the dialog open with a spinner on the confirm
   * button until it resolves. It stays open if the promise rejects.
   */
  onConfirm?: () => void | Promise<unknown>
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })
  const [pending, setPending] = React.useState(false)
  const [typed, setTyped] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)
  const inputId = React.useId()

  const isLocked = requireText != null && typed !== requireText

  function changesOpen(next: boolean) {
    // Escape and Cancel can't close it while the action is running.
    if (!next && pending) {
      return
    }
    if (!next) {
      setTyped("")
    }
    setOpen(next)
  }

  async function confirms() {
    if (isLocked || pending) {
      return
    }
    const result = onConfirm?.()
    if (!isPromiseLike(result)) {
      changesOpen(false)
      return
    }
    setPending(true)
    try {
      await result
      setPending(false)
      setTyped("")
      setOpen(false)
    } catch {
      // The caller reports the failure; keep the dialog up so they can retry.
      setPending(false)
    }
  }

  const triggerNode =
    typeof trigger === "string" ? (
      <Button tone="outline">{trigger}</Button>
    ) : (
      trigger
    )

  return (
    <AlertDialog open={open} onOpenChange={changesOpen}>
      <AlertDialogTrigger asChild>{triggerNode}</AlertDialogTrigger>
      <AlertDialogContent
        data-slot="confirm-dialog"
        data-tone={tone}
        className={className}
        onOpenAutoFocus={(event) => {
          // With a word to type, start in the field instead of on Cancel.
          if (requireText != null) {
            event.preventDefault()
            inputRef.current?.focus()
          }
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {requireText != null ? (
          <div className="flex flex-col gap-1.5">
            <label htmlFor={inputId} className="text-xs text-muted-foreground">
              Type{" "}
              <span className="font-mono font-medium text-foreground">
                {requireText}
              </span>{" "}
              to confirm
            </label>
            <Input
              ref={inputRef}
              id={inputId}
              value={typed}
              autoComplete="off"
              spellCheck={false}
              disabled={pending}
              onChange={(event) => setTyped(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  void confirms()
                }
              }}
            />
          </div>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>{cancelLabel}</AlertDialogCancel>
          <Button
            data-slot="confirm-dialog-action"
            tone={tone === "danger" ? "danger" : "default"}
            loading={pending}
            disabled={isLocked}
            onClick={() => void confirms()}
          >
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { ConfirmDialog }
