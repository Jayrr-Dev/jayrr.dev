"use client"

import { InfoIcon, QuestionIcon } from "@/components/standard/info-icon"
import { Row } from "@/components/standard/row"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersInfoIconDemo() {
  return (
    <>
      <RendersDemoCard>
        <Row>
          <span className="text-sm font-medium">Hours</span>
          <InfoIcon label="Hours help" body="Billable hours for this week." />
        </Row>
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
        <Row>
          <span className="text-sm font-medium">Cost</span>
          <QuestionIcon label="Cost help" body="Labor plus equipment." />
        </Row>
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
