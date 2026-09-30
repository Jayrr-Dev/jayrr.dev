"use client"

import { useState } from "react"

import { ButtonArray } from "@/components/standard/button-array"
import { StandardText } from "@/components/standard/standard-text"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const SECTION_ITEMS = [
  { id: "events", label: "Events" },
  { id: "reports", label: "Reports" },
  { id: "crew", label: "Crew" },
]

function RendersLiveButtonArray() {
  const [value, setValue] = useState("events")

  // One stateful component, so the gallery sees a single card: lay the
  // cards out here and fill the dialog width.
  return (
    <div data-fill className="grid w-full gap-3 sm:grid-cols-2">
      <RendersDemoCard>
        <ButtonArray
          items={SECTION_ITEMS}
          value={value}
          onValueChange={setValue}
        />
      </RendersDemoCard>
      <RendersDemoCard label="selected">
        <StandardText>{value}</StandardText>
      </RendersDemoCard>
      <RendersDemoCard label="variant slider">
        <ButtonArray
          variant="slider"
          items={SECTION_ITEMS}
          defaultValue="crew"
        />
      </RendersDemoCard>
      <RendersDemoCard label="variant underlined">
        <ButtonArray
          variant="underlined"
          items={SECTION_ITEMS}
          defaultValue="reports"
        />
      </RendersDemoCard>
    </div>
  )
}

export function RendersButtonArrayDemo() {
  return <RendersLiveButtonArray />
}
