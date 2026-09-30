"use client"

import { Tooltip } from "@/components/standard/tooltip"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersTooltipDemo() {
  return (
    <>
      <RendersDemoCard label="Tooltip">
        <Tooltip label="Hover me" body="This shows on hover, not on click." />
      </RendersDemoCard>
      <RendersDemoCard label="Tooltip · danger">
        <Tooltip
          label="Job number"
          body="Job number is required."
          tone="danger"
        />
      </RendersDemoCard>
    </>
  )
}
