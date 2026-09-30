"use client"

import { ToastButton } from "@/components/standard/toast"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersToastDemo() {
  return (
    <>
      <RendersDemoCard label="Toast">
        <ToastButton message="Saved timesheet.">Show toast</ToastButton>
      </RendersDemoCard>
      <RendersDemoCard label="Toast · danger">
        <ToastButton message="Could not post hours." tone="danger">
          Show error
        </ToastButton>
      </RendersDemoCard>
      <RendersDemoCard label="Snackbar">
        <ToastButton variant="snackbar" message="Timesheet archived.">
          Show snackbar
        </ToastButton>
      </RendersDemoCard>
      <RendersDemoCard label="Snackbar · action">
        <ToastButton
          variant="snackbar"
          message="Timesheet archived."
          action={{ label: "Undo" }}
          dismissible
        >
          Show with action
        </ToastButton>
      </RendersDemoCard>
      <RendersDemoCard label="Snackbar · stacked">
        <ToastButton
          variant="snackbar"
          message="Hours could not sync. Your changes are saved on this device and will retry when you're back online."
          action={{ label: "Retry now" }}
          stackAction
        >
          Show stacked
        </ToastButton>
      </RendersDemoCard>
    </>
  )
}
