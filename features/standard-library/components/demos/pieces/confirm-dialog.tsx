"use client"

import { useState } from "react"

import { ConfirmDialog } from "@/components/standard/confirm-dialog"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

function RendersLiveConfirmDialog({
  label,
  title,
  description,
  trigger,
  confirmLabel,
  result,
  showsResult = true,
}: {
  label: string
  title: string
  description: string
  trigger: string
  confirmLabel: string
  result: string
  showsResult?: boolean
}) {
  const [held, setHeld] = useState("")

  return (
    <RendersDemoCard label={label}>
      <ConfirmDialog
        title={title}
        description={description}
        trigger={trigger}
        confirmLabel={confirmLabel}
        onConfirm={() => setHeld(result)}
      />
      {showsResult && held ? <span className="text-xs">{held}</span> : null}
    </RendersDemoCard>
  )
}

export function RendersConfirmDialogDemo() {
  return (
    <>
      <RendersLiveConfirmDialog
        label="Confirm dialog"
        title="Remove this piece?"
        description="Confirm closes the dialog after you choose."
        trigger="Remove piece"
        confirmLabel="Remove"
        result="Removed"
      />
      <RendersLiveConfirmDialog
        label="Confirm dialog · hold"
        title="Hold these jobs?"
        description="They drop out of the open list."
        trigger="Hold"
        confirmLabel="Hold"
        result="Held"
      />
      <RendersLiveConfirmDialog
        label="Confirm dialog · alert"
        title="Leave without saving?"
        description="Same confirm shell. The action is the alert."
        trigger="Leave"
        confirmLabel="Leave"
        result="Left"
        showsResult={false}
      />
    </>
  )
}
