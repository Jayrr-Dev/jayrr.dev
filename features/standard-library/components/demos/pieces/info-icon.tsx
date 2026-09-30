"use client"

import { InfoIcon, QuestionIcon } from "@/components/standard/info-icon"
import { Stack } from "@/components/standard/stack"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersInfoIconDemo() {
  return (
    <>
      <RendersDemoCard>
        <Stack direction="row" align="center">
          <span className="text-sm font-medium">Hours</span>
          <InfoIcon label="Hours help" body="Billable hours for this week." />
        </Stack>
      </RendersDemoCard>
      <RendersDemoCard label="tone alert">
        <InfoIcon
          tone="alert"
          label="Hold help"
          body="This job is on hold until Friday."
        />
      </RendersDemoCard>
      <RendersDemoCard label="tone help">
        <QuestionIcon label="What is this?" body="Short help for this field." />
      </RendersDemoCard>
      <RendersDemoCard label="tone help · next to title">
        <Stack direction="row" align="center">
          <span className="text-sm font-medium">Cost</span>
          <QuestionIcon label="Cost help" body="Labor plus equipment." />
        </Stack>
      </RendersDemoCard>
      <RendersDemoCard label="type tooltip">
        <InfoIcon
          type="tooltip"
          label="Rate help"
          body="Hover or focus the i to read this."
        />
      </RendersDemoCard>
      <RendersDemoCard label="type tooltip · tone alert">
        <InfoIcon
          type="tooltip"
          tone="alert"
          label="Overdue"
          body="Invoice is 14 days late."
        />
      </RendersDemoCard>
      <RendersDemoCard label="QuestionIcon preset · type tooltip">
        <QuestionIcon
          type="tooltip"
          label="What is this?"
          body="QuestionIcon is InfoIcon with tone help."
        />
      </RendersDemoCard>
      <RendersDemoCard label="type popover">
        <InfoIcon
          type="popover"
          label="Tip"
          body="Click the i. The note sits over the page."
        />
      </RendersDemoCard>
    </>
  )
}
