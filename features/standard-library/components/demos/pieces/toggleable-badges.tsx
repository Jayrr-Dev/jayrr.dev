"use client"

import { useState } from "react"

import { StandardText } from "@/components/standard/standard-text"
import { ToggleableBadges } from "@/components/standard/toggleable-badges"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const BADGE_ITEMS = [
  { id: "open", label: "Open" },
  { id: "hold", label: "Hold" },
  { id: "done", label: "Done" },
]

function RendersLiveToggleableBadges() {
  const [value, setValue] = useState("open")

  return (
    <>
      <RendersDemoCard>
        <ToggleableBadges
          items={BADGE_ITEMS}
          value={value}
          onValueChange={setValue}
        />
      </RendersDemoCard>
      <RendersDemoCard label="multi">
        <ToggleableBadges multiple items={BADGE_ITEMS} />
      </RendersDemoCard>
      <RendersDemoCard label="selected">
        <StandardText>{value}</StandardText>
      </RendersDemoCard>
    </>
  )
}

export function RendersToggleableBadgesDemo() {
  return <RendersLiveToggleableBadges />
}
