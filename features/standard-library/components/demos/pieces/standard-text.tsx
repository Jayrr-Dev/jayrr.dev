"use client"

import { Paragraph } from "@/components/standard/paragraph"
import { StandardText } from "@/components/standard/standard-text"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

// StandardText is deprecated in favour of <Paragraph size="sm">; the old
// cards stay so existing usage is still shown.
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
      <RendersDemoCard label="Paragraph size sm">
        <Paragraph size="sm">Sep 22, 2026 · 8.0 h</Paragraph>
      </RendersDemoCard>
      <RendersDemoCard label="Paragraph size sm tone muted">
        <Paragraph size="sm" tone="muted">
          Remaining 12.0 h
        </Paragraph>
      </RendersDemoCard>
    </>
  )
}
