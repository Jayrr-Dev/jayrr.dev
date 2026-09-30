"use client"

import { Button } from "@/components/standard/button"
import { toast } from "@/components/standard/toast"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersToastDemo() {
  return (
    <>
      <RendersDemoCard label="Toast">
        <Button tone="outline" size="sm" onClick={() => toast("Saved timesheet.")}>
          Show toast
        </Button>
      </RendersDemoCard>
      <RendersDemoCard label="Toast · danger">
        <Button
          tone="outline"
          size="sm"
          onClick={() => toast("Could not post hours.", { tone: "danger" })}
        >
          Show error
        </Button>
      </RendersDemoCard>
      <RendersDemoCard label="Snackbar">
        <Button
          tone="outline"
          size="sm"
          onClick={() => toast("Timesheet archived.", { variant: "snackbar" })}
        >
          Show snackbar
        </Button>
      </RendersDemoCard>
      <RendersDemoCard label="Snackbar · action">
        <Button
          tone="outline"
          size="sm"
          onClick={() =>
            toast("Timesheet archived.", {
              variant: "snackbar",
              action: { label: "Undo" },
              dismissible: true,
            })
          }
        >
          Show with action
        </Button>
      </RendersDemoCard>
      <RendersDemoCard label="Snackbar · stacked">
        <Button
          tone="outline"
          size="sm"
          onClick={() =>
            toast(
              "Hours could not sync. Your changes are saved on this device and will retry when you're back online.",
              {
                variant: "snackbar",
                action: { label: "Retry now" },
                stackAction: true,
              }
            )
          }
        >
          Show stacked
        </Button>
      </RendersDemoCard>
    </>
  )
}
