"use client"

import { StandardCard } from "@/components/standard/standard-card"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersStandardCardDemo() {
  return (
    <>
      <RendersDemoCard>
        <StandardCard title="Contract 1001" meta="Client #708">
          Open items: 3
        </StandardCard>
      </RendersDemoCard>
      <RendersDemoCard label="no meta">
        <StandardCard title="Job 1002">Ready to bill.</StandardCard>
      </RendersDemoCard>
    </>
  )
}
