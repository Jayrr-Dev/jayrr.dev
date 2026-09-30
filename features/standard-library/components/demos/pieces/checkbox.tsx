"use client"

import { Checkbox } from "@/components/standard/checkbox"
import { FieldLabel } from "@/components/standard/field-label"
import { Stack } from "@/components/standard/stack"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersCheckboxDemo() {
  return (
    <>
      <RendersDemoCard>
        <Stack direction="row" align="center">
          <Checkbox id="terms" defaultChecked />
          <FieldLabel htmlFor="terms">Accept terms</FieldLabel>
        </Stack>
      </RendersDemoCard>
      <RendersDemoCard label="unchecked">
        <Stack direction="row" align="center">
          <Checkbox id="alerts" />
          <FieldLabel htmlFor="alerts">Alerts</FieldLabel>
        </Stack>
      </RendersDemoCard>
      <RendersDemoCard label="disabled">
        <Stack direction="row" align="center">
          <Checkbox id="locked" disabled defaultChecked />
          <FieldLabel htmlFor="locked">Locked</FieldLabel>
        </Stack>
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
      <RendersDemoCard label="size sm">
        <Checkbox
          size="sm"
          label="Show archived"
          description="Hidden by default."
        />
      </RendersDemoCard>
      <RendersDemoCard label="indeterminate">
        <Checkbox label="Select all" indeterminate />
      </RendersDemoCard>
      <RendersDemoCard label="appearance card">
        <div className="grid w-full gap-2">
          <Checkbox
            appearance="card"
            label="Nightly backup"
            description="Copies every job at 2 am."
            defaultChecked
          />
          <Checkbox
            appearance="card"
            label="Weekly report"
            description="Emailed Monday morning."
          />
        </div>
      </RendersDemoCard>
    </>
  )
}
