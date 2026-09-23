"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "cn"

import { Button } from "@/components/standard/button"

function ToastButton({
  message,
  tone = "default",
  children,
}: {
  message: string
  tone?: "default" | "danger"
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)

  function show() {
    setOpen(true)
    window.setTimeout(() => setOpen(false), 2400)
  }

  return (
    <>
      <Button tone="outline" size="sm" onClick={show}>
        {children}
      </Button>
      {open
        ? createPortal(
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
            </div>,
            document.body
          )
        : null}
    </>
  )
}

export { ToastButton }
