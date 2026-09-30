"use client"

import { Alert } from "@/components/standard/alert"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersAlertDemo() {
  return (
    <>
      <RendersDemoCard>
        <Alert title="Hold">This job is on hold.</Alert>
      </RendersDemoCard>
      <RendersDemoCard label="success">
        <Alert title="Saved">Hours posted for Monday.</Alert>
      </RendersDemoCard>
    </>
  )
}
