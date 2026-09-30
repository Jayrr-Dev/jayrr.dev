"use client"

import { Divider } from "@/components/standard/divider"
import { Row } from "@/components/standard/row"
import { Stack } from "@/components/standard/stack"
import { StandardText } from "@/components/standard/standard-text"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersSeparatorDemo() {
  return (
    <>
      <RendersDemoCard>
        <Stack className="w-full">
          <StandardText>Above</StandardText>
          <Divider />
          <StandardText>Below</StandardText>
        </Stack>
      </RendersDemoCard>
      <RendersDemoCard label="orientation vertical">
        <Row className="h-8">
          <StandardText>Left</StandardText>
          <Divider orientation="vertical" />
          <StandardText>Right</StandardText>
        </Row>
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
