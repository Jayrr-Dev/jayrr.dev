"use client"

import { Checkbox } from "@/components/standard/checkbox"
import { FieldLabel } from "@/components/standard/field-label"
import { Row } from "@/components/standard/row"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersCheckboxDemo() {
  return (
    <>
      <RendersDemoCard>
        <Row>
          <Checkbox id="terms" defaultChecked />
          <FieldLabel htmlFor="terms">Accept terms</FieldLabel>
        </Row>
      </RendersDemoCard>
      <RendersDemoCard label="unchecked">
        <Row>
          <Checkbox id="alerts" />
          <FieldLabel htmlFor="alerts">Alerts</FieldLabel>
        </Row>
      </RendersDemoCard>
      <RendersDemoCard label="disabled">
        <Row>
          <Checkbox id="locked" disabled defaultChecked />
          <FieldLabel htmlFor="locked">Locked</FieldLabel>
        </Row>
      </RendersDemoCard>
      <RendersDemoCard label="label prop">
        <Checkbox
          label="Email me updates"
          description="About once a week."
          defaultChecked
        />
      </RendersDemoCard>
      <RendersDemoCard label="invalid">
        <Checkbox label="I accept the terms" invalid />
      </RendersDemoCard>
    </>
  )
}
