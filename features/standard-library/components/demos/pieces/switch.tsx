"use client"

import { Switch } from "@/components/standard/switch"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersSwitchDemo() {
  return (
    <>
      <RendersDemoCard>
        <Switch aria-label="Notifications" defaultChecked />
      </RendersDemoCard>
      <RendersDemoCard label="off">
        <Switch aria-label="Notifications" />
      </RendersDemoCard>
      <RendersDemoCard label="disabled">
        <Switch aria-label="Notifications" disabled defaultChecked />
      </RendersDemoCard>
    </>
  )
}
