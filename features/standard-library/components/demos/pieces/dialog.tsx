"use client"

import { Dialog } from "@/components/standard/dialog"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersDialogDemo() {
  return (
    <>
      <RendersDemoCard label="Dialog">
        <Dialog
          title="Share this piece"
          description="Minimize it to the corner, maximize it, or close it."
          trigger="Open dialog"
          controls={["minimize", "maximize", "close"]}
        />
      </RendersDemoCard>
      <RendersDemoCard label="Dialog · gutter controls">
        <Dialog
          title="Share this piece"
          description="Controls sit in the corner gutter, clear of the title."
          trigger="Open dialog"
          controls={["minimize", "maximize", "close"]}
          controlsPlacement="gutter"
        />
      </RendersDemoCard>
    </>
  )
}
