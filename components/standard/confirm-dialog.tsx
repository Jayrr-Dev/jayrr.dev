"use client"

import * as React from "react"

import { Button } from "@/components/standard/button"
import { Dialog } from "@/components/standard/dialog"

function ConfirmDialog({
  className,
  title,
  description,
  trigger = "Confirm",
  confirmLabel = "Confirm",
  onConfirm,
}: {
  className?: string
  title: string
  description: string
  trigger?: string
  confirmLabel?: string
  onConfirm?: () => void
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <Dialog
      className={className}
      title={title}
      description={description}
      trigger={trigger}
      open={open}
      onOpenChange={setOpen}
    >
      <Button
        tone="danger"
        size="sm"
        onClick={() => {
          onConfirm?.()
          setOpen(false)
        }}
      >
        {confirmLabel}
      </Button>
    </Dialog>
  )
}

export { ConfirmDialog }

// Moved to its own file; re-exported so existing imports keep working.
export { TabbedDialog } from "@/components/standard/tabbed-dialog"
