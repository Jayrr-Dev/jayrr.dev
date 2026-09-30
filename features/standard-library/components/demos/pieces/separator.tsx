"use client"

import { Divider } from "@/components/standard/divider"
import { Paragraph } from "@/components/standard/paragraph"
import { Stack } from "@/components/standard/stack"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersSeparatorDemo() {
  return (
    <>
      <RendersDemoCard>
        <Stack className="w-full">
          <Paragraph size="sm">Above</Paragraph>
          <Divider />
          <Paragraph size="sm">Below</Paragraph>
        </Stack>
      </RendersDemoCard>
      <RendersDemoCard label="orientation vertical">
        <Stack direction="row" align="center" className="h-8">
          <Paragraph size="sm">Left</Paragraph>
          <Divider orientation="vertical" />
          <Paragraph size="sm">Right</Paragraph>
        </Stack>
      </RendersDemoCard>
      <RendersDemoCard label="label">
        <Divider label="or" />
      </RendersDemoCard>
      <RendersDemoCard label="tone">
        <Stack gap="lg" className="w-full">
          <Divider tone="default" />
          <Divider tone="dashed" />
          <Divider tone="strong" />
          <Divider tone="dashed" label="dashed with label" />
        </Stack>
      </RendersDemoCard>
    </>
  )
}
