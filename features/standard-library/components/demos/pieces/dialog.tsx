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
      <RendersDemoCard label="size sm">
        <Dialog
          size="sm"
          title="Small dialog"
          description="20rem wide."
          trigger="Open sm"
        />
      </RendersDemoCard>
      <RendersDemoCard label="size lg">
        <Dialog
          size="lg"
          title="Large dialog"
          description="32rem wide."
          trigger="Open lg"
          controls={["maximize", "close"]}
        />
      </RendersDemoCard>
      <RendersDemoCard label="size xl">
        <Dialog
          size="xl"
          title="Extra large dialog"
          description="42rem wide."
          trigger="Open xl"
        />
      </RendersDemoCard>
      <RendersDemoCard label="size full">
        <Dialog
          size="full"
          title="Full dialog"
          description="Fills the viewport less a margin."
          trigger="Open full"
          controls={["minimize", "close"]}
        />
      </RendersDemoCard>
    </>
  )
}
