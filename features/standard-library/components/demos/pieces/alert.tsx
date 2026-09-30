"use client"

import { InfoIcon, TriangleAlertIcon } from "lucide-react"

import { Alert } from "@/components/standard/alert"
import { Button } from "@/components/standard/button"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const tones = [
  "default",
  "info",
  "success",
  "warning",
  "danger",
  "broadcast",
] as const

export function RendersAlertDemo() {
  return (
    <>
      <RendersDemoCard>
        <Alert title="Hold">This job is on hold.</Alert>
      </RendersDemoCard>
      <RendersDemoCard label="success">
        <Alert title="Saved" tone="success">
          Hours posted for Monday.
        </Alert>
      </RendersDemoCard>
      <RendersDemoCard label="tone" className="w-full max-w-xl">
        <div className="flex w-full flex-col gap-2">
          {tones.map((tone) => (
            <Alert key={tone} tone={tone} title={tone}>
              Hours posted for Monday.
            </Alert>
          ))}
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="appearance solid" className="w-full max-w-xl">
        <div className="flex w-full flex-col gap-2">
          {tones.map((tone) => (
            <Alert key={tone} tone={tone} appearance="solid" title={tone}>
              Hours posted for Monday.
            </Alert>
          ))}
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="appearance outline" className="w-full max-w-xl">
        <div className="flex w-full flex-col gap-2">
          {tones.map((tone) => (
            <Alert key={tone} tone={tone} appearance="outline" title={tone}>
              Hours posted for Monday.
            </Alert>
          ))}
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="layout banner" className="w-full max-w-xl">
        <Alert tone="broadcast" layout="banner" title="Office closed Friday">
          Submit hours by Thursday.
        </Alert>
      </RendersDemoCard>
      <RendersDemoCard label="icon" className="w-full max-w-xl">
        <Alert tone="info" icon={<InfoIcon />} title="Rates change next period">
          New rate card starts on the 1st.
        </Alert>
      </RendersDemoCard>
      <RendersDemoCard label="action" className="w-full max-w-xl">
        <Alert
          tone="warning"
          icon={<TriangleAlertIcon />}
          title="Timesheet incomplete"
          action={
            <Button tone="outline" size="sm">
              Review
            </Button>
          }
        >
          Two days have no hours.
        </Alert>
      </RendersDemoCard>
      <RendersDemoCard label="dismissible" className="w-full max-w-xl">
        <Alert tone="success" title="Saved" dismissible>
          Hours posted for Monday.
        </Alert>
      </RendersDemoCard>
    </>
  )
}
