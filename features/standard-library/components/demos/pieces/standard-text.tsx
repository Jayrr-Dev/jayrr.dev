"use client"

import { StandardText } from "@/components/standard/standard-text"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersStandardTextDemo() {
  return (
    <>
      <RendersDemoCard label="Standard text">
        <StandardText>Sep 22, 2026 · 8.0 h</StandardText>
      </RendersDemoCard>
      <RendersDemoCard label="muted">
        <StandardText className="text-muted-foreground">
          Remaining 12.0 h
        </StandardText>
      </RendersDemoCard>
      <RendersDemoCard label="date only">
        <StandardText>Sep 22, 2026</StandardText>
      </RendersDemoCard>
      <RendersDemoCard label="hours only">
        <StandardText>8.0 h</StandardText>
      </RendersDemoCard>
    </>
  )
}
