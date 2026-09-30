"use client"

import { FieldLabel } from "@/components/standard/field-label"
import { Radio, RadioGroup } from "@/components/standard/radio"
import { Row } from "@/components/standard/row"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersRadioGroupDemo() {
  return (
    <>
      <RendersDemoCard>
        <RadioGroup>
          <Row>
            <Radio id="classic" name="style" defaultChecked />
            <FieldLabel htmlFor="classic">Classic</FieldLabel>
          </Row>
          <Row>
            <Radio id="standard" name="style" />
            <FieldLabel htmlFor="standard">Standard</FieldLabel>
          </Row>
        </RadioGroup>
      </RendersDemoCard>
      <RendersDemoCard label="disabled">
        <RadioGroup>
          <Row>
            <Radio id="locked-classic" name="locked-style" disabled defaultChecked />
            <FieldLabel htmlFor="locked-classic">Classic</FieldLabel>
          </Row>
        </RadioGroup>
      </RendersDemoCard>
      <RendersDemoCard label="legend · label prop">
        <RadioGroup legend="Delivery">
          <Radio name="delivery" label="Pickup" defaultChecked />
          <Radio name="delivery" label="Ship" description="2–3 business days" />
        </RadioGroup>
      </RendersDemoCard>
    </>
  )
}
