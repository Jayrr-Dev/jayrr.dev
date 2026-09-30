"use client"

import { Progress } from "@/components/standard/progress"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersProgressDemo() {
  return (
    <>
      <RendersDemoCard>
        <Progress value={25} className="w-full" />
      </RendersDemoCard>
      <RendersDemoCard label="value 70">
        <Progress value={70} className="w-full" />
      </RendersDemoCard>
      <RendersDemoCard label="value 100">
        <Progress value={100} className="w-full" />
      </RendersDemoCard>
      <RendersDemoCard label="size">
        <div className="flex w-full flex-col gap-3">
          <Progress value={60} size="xs" />
          <Progress value={60} size="sm" />
          <Progress value={60} size="default" />
          <Progress value={60} size="lg" />
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="tone">
        <div className="flex w-full flex-col gap-3">
          <Progress value={60} tone="default" />
          <Progress value={60} tone="success" />
          <Progress value={60} tone="warning" />
          <Progress value={60} tone="danger" />
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="segments">
        <Progress
          size="lg"
          segments={[
            { id: "billable", value: 45 },
            { id: "overtime", value: 15, tone: "warning" },
            { id: "leave", value: 10, className: "bg-muted-foreground/50" },
          ]}
        />
      </RendersDemoCard>
      <RendersDemoCard label="indeterminate">
        <Progress indeterminate aria-label="Syncing" />
      </RendersDemoCard>
      <RendersDemoCard label="label · showValue">
        <Progress value={64} label="Hours logged" showValue />
      </RendersDemoCard>
    </>
  )
}
