"use client"

import { FieldLabel } from "@/components/standard/field-label"
import { Radio, RadioGroup } from "@/components/standard/radio"
import { Stack } from "@/components/standard/stack"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersRadioGroupDemo() {
  return (
    <>
      <RendersDemoCard>
        <RadioGroup>
          <Stack direction="row" align="center">
            <Radio id="classic" name="style" defaultChecked />
            <FieldLabel htmlFor="classic">Classic</FieldLabel>
          </Stack>
          <Stack direction="row" align="center">
            <Radio id="standard" name="style" />
            <FieldLabel htmlFor="standard">Standard</FieldLabel>
          </Stack>
        </RadioGroup>
      </RendersDemoCard>
      <RendersDemoCard label="disabled">
        <RadioGroup>
          <Stack direction="row" align="center">
            <Radio id="locked-classic" name="locked-style" disabled defaultChecked />
            <FieldLabel htmlFor="locked-classic">Classic</FieldLabel>
          </Stack>
        </RadioGroup>
      </RendersDemoCard>
      <RendersDemoCard label="legend · label prop">
        <RadioGroup legend="Delivery">
          <Radio name="delivery" label="Pickup" defaultChecked />
          <Radio name="delivery" label="Ship" description="2–3 business days" />
        </RadioGroup>
      </RendersDemoCard>
      <RendersDemoCard label="size sm">
        <RadioGroup legend="Density">
          <Radio size="sm" name="density" label="Comfortable" defaultChecked />
          <Radio size="sm" name="density" label="Compact" />
        </RadioGroup>
      </RendersDemoCard>
      <RendersDemoCard label="appearance card">
        <RadioGroup legend="Plan" className="w-full">
          <Radio
            appearance="card"
            name="plan"
            label="Crew"
            description="Up to 10 people."
            defaultChecked
          />
          <Radio
            appearance="card"
            name="plan"
            label="Company"
            description="Unlimited people and sites."
          />
        </RadioGroup>
      </RendersDemoCard>
    </>
  )
}
