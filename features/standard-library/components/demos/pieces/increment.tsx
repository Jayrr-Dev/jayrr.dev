"use client"

import { useState } from "react"

import { Increment } from "@/components/standard/increment"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

function RendersControlledDemo() {
  const [guests, setGuests] = useState(2)

  return (
    <div className="flex flex-col items-start gap-2 text-xs text-muted-foreground">
      <Increment
        label="guests"
        value={guests}
        onChange={setGuests}
        min={1}
        max={8}
      />
      <span>
        {guests === 8 ? "Table is full" : `${8 - guests} seats left`}
      </span>
    </div>
  )
}

export function RendersIncrementDemo() {
  return (
    <>
      <RendersDemoCard label="Increment">
        <Increment label="gap" defaultValue={32} min={8} max={72} step={8} />
      </RendersDemoCard>
      <RendersDemoCard label="format · step">
        <div className="flex flex-col items-start gap-3">
          <Increment
            label="opacity"
            defaultValue={0.6}
            min={0}
            max={1}
            step={0.1}
            format={(value) => `${Math.round(value * 100)}%`}
            formatText={(value) => `${Math.round(value * 100)} percent`}
          />
          <Increment
            defaultValue={3}
            min={1}
            max={12}
            format={(value) => `${value} items`}
            aria-label="Items"
          />
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="size · tone">
        <div className="flex flex-col items-start gap-3">
          <Increment size="xs" tone="ghost" label="xs" defaultValue={1} />
          <Increment size="sm" tone="quiet" label="sm" defaultValue={2} />
          <Increment size="default" label="default" defaultValue={3} />
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="stacked">
        <div className="flex flex-col items-start gap-3">
          <Increment
            layout="stacked"
            aria-label="Quantity"
            defaultValue={2}
            min={0}
            max={99}
          />
          <Increment
            layout="stacked"
            tone="quiet"
            label="gap"
            defaultValue={32}
            min={8}
            max={72}
            step={8}
          />
          <Increment
            layout="stacked"
            tone="ghost"
            size="default"
            aria-label="Minutes"
            defaultValue={58}
            min={0}
            max={59}
            format={(value) => String(value).padStart(2, "0")}
          />
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="controlled">
        <RendersControlledDemo />
      </RendersDemoCard>
      <RendersDemoCard label="disabled">
        <Increment label="gap" defaultValue={32} disabled />
      </RendersDemoCard>
    </>
  )
}
