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
  tone,
  requireText,
  waitMs,
}: {
  label: string
  title: string
  description: string
  trigger: string
  confirmLabel: string
  result: string
  showsResult?: boolean
  tone?: "default" | "danger"
  requireText?: string
  /** Makes onConfirm async: resolves after this many ms. */
  waitMs?: number
}) {
  const [held, setHeld] = useState("")

  return (
    <RendersDemoCard label={label}>
      <ConfirmDialog
        title={title}
        description={description}
        trigger={trigger}
        confirmLabel={confirmLabel}
        tone={tone}
        requireText={requireText}
        onConfirm={() => {
          if (waitMs == null) {
            setHeld(result)
            return
          }
          return new Promise<void>((resolve) => {
            window.setTimeout(() => {
              setHeld(result)
              resolve()
            }, waitMs)
          })
        }}
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
      <RendersLiveConfirmDialog
        label="tone default"
        title="Publish this piece?"
        description="A neutral action gets the primary button."
        trigger="Publish"
        confirmLabel="Publish"
        result="Published"
        tone="default"
      />
      <RendersLiveConfirmDialog
        label="tone danger"
        title="Delete this job?"
        description="The job and its timesheets go away."
        trigger="Delete job"
        confirmLabel="Delete"
        result="Deleted"
        tone="danger"
      />
      <RendersLiveConfirmDialog
        label="async onConfirm"
        title="Archive 12 jobs?"
        description="Confirm shows a spinner until the save finishes, then closes."
        trigger="Archive"
        confirmLabel="Archive"
        result="Archived"
        waitMs={1500}
      />
      <RendersLiveConfirmDialog
        label="requireText"
        title="Delete the project?"
        description="This cannot be undone."
        trigger="Delete project"
        confirmLabel="Delete project"
        result="Project deleted"
        requireText="delete"
      />
    </>
  )
}
