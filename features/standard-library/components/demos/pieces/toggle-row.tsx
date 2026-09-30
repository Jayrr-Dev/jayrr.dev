"use client"

import { Switch } from "@/components/standard/switch"
import { ToggleRow } from "@/components/standard/toggle-row"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersToggleRowDemo() {
  return (
    <>
      <RendersDemoCard>
        <ToggleRow label="Alerts">
          <Switch aria-label="Alerts" defaultChecked />
        </ToggleRow>
      </RendersDemoCard>
      <RendersDemoCard label="off">
        <ToggleRow label="Wrap text">
          <Switch aria-label="Wrap text" />
        </ToggleRow>
      </RendersDemoCard>
    </>
  )
}
