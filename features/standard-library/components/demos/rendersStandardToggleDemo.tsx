"use client"

import { Checkbox } from "@/components/standard/checkbox"
import { FieldLabel } from "@/components/standard/field-label"
import { Radio, RadioGroup } from "@/components/standard/radio"
import { Row } from "@/components/standard/row"
import { LabelledSwitch, Switch } from "@/components/standard/switch"
import { Toggle } from "@/components/standard/toggle"
import { ToggleRow } from "@/components/standard/accordion"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersStandardToggleDemo({
  pieceName,
}: {
  pieceName: string
}) {
  if (pieceName === "Checkbox") {
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
      </>
    )
  }

  if (pieceName === "Radio Group") {
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
      </>
    )
  }

  if (pieceName === "Switch") {
    return (
      <>
        <RendersDemoCard>
          <Switch defaultChecked />
        </RendersDemoCard>
        <RendersDemoCard label="off">
          <Switch />
        </RendersDemoCard>
        <RendersDemoCard label="disabled">
          <Switch disabled defaultChecked />
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Toggle") {
    return (
      <>
        <RendersDemoCard>
          <Toggle defaultPressed>Bold</Toggle>
        </RendersDemoCard>
        <RendersDemoCard label="off">
          <Toggle>Italic</Toggle>
        </RendersDemoCard>
        <RendersDemoCard label="disabled">
          <Toggle disabled defaultPressed>
            Locked
          </Toggle>
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Toggle Row" || pieceName === "Text Wrap Toggle") {
    return (
      <>
        <RendersDemoCard>
          <ToggleRow label="Alerts">
            <Switch defaultChecked />
          </ToggleRow>
        </RendersDemoCard>
        <RendersDemoCard label="off">
          <ToggleRow label="Wrap text">
            <Switch />
          </ToggleRow>
        </RendersDemoCard>
      </>
    )
  }

  return (
    <>
      <RendersDemoCard>
        <LabelledSwitch label={pieceName} defaultChecked />
      </RendersDemoCard>
      <RendersDemoCard label="off">
        <LabelledSwitch label={pieceName} />
      </RendersDemoCard>
    </>
  )
}
