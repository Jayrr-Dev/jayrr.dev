"use client"

import { useEffect, useState } from "react"

import { Progress } from "@/components/standard/progress"
import { Button } from "@/components/ui/button"
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

function RendersHealthDemo() {
  const [hp, setHp] = useState(100)
  // Trailing chunk that drains slowly behind the real bar after a hit.
  const [trail, setTrail] = useState(100)

  useEffect(() => {
    const id = window.setTimeout(() => setTrail(hp), 450)
    return () => window.clearTimeout(id)
  }, [hp])

  const tone = hp > 50 ? "success" : hp > 25 ? "warning" : "danger"

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium">HP</span>
        <span className="text-xs text-muted-foreground tabular-nums">{hp} / 100</span>
      </div>
      <div className="relative">
        <Progress
          value={trail}
          size="xl"
          tone="danger"
          aria-hidden
          className="absolute inset-0 opacity-60"
        />
        <Progress value={hp} size="xl" tone={tone} aria-label="HP" className="relative bg-transparent" />
        {/* Tick marks: a gap every 10 HP, cut through both bars. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to right, transparent 0, transparent calc(10% - 2px), var(--card, #111) calc(10% - 2px), var(--card, #111) 10%)",
          }}
        />
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => setHp((v) => Math.max(0, v - 20))}>
          Hit
        </Button>
        <Button size="sm" variant="outline" onClick={() => setHp((v) => Math.min(100, v + 20))}>
          Heal
        </Button>
      </div>
    </div>
  )
}

export function RendersProgressDemo() {
  return (
    <>
      <RendersDemoCard>
        <Progress value={25} className="w-full" />
      </RendersDemoCard>
      <RendersDemoCard label="health bar">
        <RendersHealthDemo />
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
