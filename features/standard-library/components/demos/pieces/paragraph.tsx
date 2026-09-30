"use client"

import { Paragraph } from "@/components/standard/paragraph"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const LONG_TEXT =
  "Crews log hours against the job, the board rolls them up by week, and payroll reads the same numbers the foreman signed off on."

export function RendersParagraphDemo() {
  return (
    <>
      <RendersDemoCard className="w-full max-w-xl">
        <Paragraph>{LONG_TEXT}</Paragraph>
      </RendersDemoCard>
      <RendersDemoCard label="size sm">
        <Paragraph size="sm">Sep 22, 2026 · 8.0 h</Paragraph>
      </RendersDemoCard>
      <RendersDemoCard label="size sm · tone muted">
        <Paragraph size="sm" tone="muted">
          Remaining 12.0 h
        </Paragraph>
      </RendersDemoCard>
      <RendersDemoCard label="size lead" className="w-full max-w-xl">
        <Paragraph size="lead">One board for every crew and job.</Paragraph>
      </RendersDemoCard>
      <RendersDemoCard label="lineClamp 2" className="w-full max-w-xs">
        <Paragraph size="sm" lineClamp={2}>
          {LONG_TEXT}
        </Paragraph>
      </RendersDemoCard>
      <RendersDemoCard label="truncate" className="w-full max-w-xs">
        <Paragraph size="sm" truncate>
          {LONG_TEXT}
        </Paragraph>
      </RendersDemoCard>
    </>
  )
}
