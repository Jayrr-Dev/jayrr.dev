"use client"

import { FieldLabel } from "@/components/standard/field-label"
import { Stack } from "@/components/standard/stack"
import { TextField } from "@/components/standard/text-field"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersLabelDemo() {
  return (
    <RendersDemoCard label="Field label">
      <Stack className="w-full">
        <FieldLabel htmlFor="job" required>
          Job
        </FieldLabel>
        <TextField id="job" placeholder="1001" />
      </Stack>
    </RendersDemoCard>
  )
}
