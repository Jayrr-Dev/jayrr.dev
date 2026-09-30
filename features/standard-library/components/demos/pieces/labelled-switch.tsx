"use client"

import { LabelledSwitch } from "@/components/standard/switch"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersLabelledSwitchDemo() {
  return (
    <RendersDemoCard label="Labelled switch">
      <LabelledSwitch label="Wrap text" defaultChecked />
    </RendersDemoCard>
  )
}
