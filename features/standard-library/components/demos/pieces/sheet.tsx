"use client"

import { Select } from "@/components/standard/select"
import { Sheet } from "@/components/standard/sheet"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersSheetDemo() {
  return (
    <RendersDemoCard label="Sheet">
      <Sheet title="Filters">
        <Select
          placeholder="Status"
          options={[
            { value: "open", label: "Open" },
            { value: "done", label: "Done" },
          ]}
        />
      </Sheet>
    </RendersDemoCard>
  )
}
