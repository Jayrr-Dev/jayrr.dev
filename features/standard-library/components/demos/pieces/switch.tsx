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
      <RendersDemoCard label="label">
        <Switch label="Wrap text" defaultChecked />
      </RendersDemoCard>
      <RendersDemoCard label="label · description">
        <Switch
          label="Email alerts"
          description="Sent when a job changes status."
        />
      </RendersDemoCard>
      <RendersDemoCard label="labelPosition start">
        <Switch label="Dark mode" labelPosition="start" defaultChecked />
      </RendersDemoCard>
      <RendersDemoCard label="size sm">
        <Switch size="sm" label="Compact rows" defaultChecked />
      </RendersDemoCard>
      <RendersDemoCard label="variant flip">
        <Switch variant="flip" flipLabels={["AM", "PM"]} aria-label="AM or PM" />
      </RendersDemoCard>
      <RendersDemoCard label="variant flip · size sm">
        <Switch
          variant="flip"
          size="sm"
          flipLabels={["Metric", "US"]}
          aria-label="Units"
          defaultChecked
        />
      </RendersDemoCard>
      <RendersDemoCard label="invalid">
        <Switch label="Accept the terms" invalid />
      </RendersDemoCard>
    </>
  )
}
