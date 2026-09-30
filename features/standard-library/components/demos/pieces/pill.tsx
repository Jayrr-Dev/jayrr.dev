"use client"

import { Pill } from "@/components/standard/pill"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersPillDemo() {
  return (
    <>
      <RendersDemoCard>
        <Pill label="Status">Ready</Pill>
      </RendersDemoCard>
      <RendersDemoCard label="tone outline">
        <Pill label="Build" tone="outline">
          Draft
        </Pill>
      </RendersDemoCard>
      <RendersDemoCard label="tone danger">
        <Pill label="Deploy" tone="danger">
          Hold
        </Pill>
      </RendersDemoCard>
      <RendersDemoCard label="radius none">
        <Pill label="Version" radius="none">
          v2.4
        </Pill>
      </RendersDemoCard>
      <RendersDemoCard label="radius sm">
        <Pill label="Region" radius="sm">
          us-east
        </Pill>
      </RendersDemoCard>
      <RendersDemoCard label="radius md">
        <Pill label="Coverage" radius="md">
          92%
        </Pill>
      </RendersDemoCard>
    </>
  )
}
