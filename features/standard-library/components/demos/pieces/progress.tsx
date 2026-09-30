"use client"

import { useEffect, useState } from "react"

import { Progress } from "@/components/standard/progress"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

function RendersTickerDemo() {
  const [value, setValue] = useState(0)

  // Steps the loader forward so the ticker keeps rolling.
  useEffect(() => {
    const id = window.setInterval(() => {
      setValue((current) => (current >= 100 ? 0 : Math.min(100, current + 18)))
    }, 1400)
    return () => window.clearInterval(id)
  }, [])

  return <Progress value={value} label="Uploading" ticker />
}

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
      <RendersDemoCard label="segments · showSegmentValues">
        <Progress
          size="xl"
          showSegmentValues
          segments={[
            { id: "billable", value: 45 },
            { id: "overtime", value: 15, tone: "warning" },
            { id: "leave", value: 10, className: "bg-muted-foreground/50" },
          ]}
        />
      </RendersDemoCard>
      <RendersDemoCard label="ticker">
        <RendersTickerDemo />
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
