"use client"

import { MultiSelect } from "@/components/standard/select"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersMultiSelectDemo() {
  return (
    <>
      <RendersDemoCard label="Multi select">
        <MultiSelect
          options={[
            { value: "alpha", label: "Alpha" },
            { value: "bravo", label: "Bravo" },
            { value: "charlie", label: "Charlie" },
          ]}
          defaultValues={["bravo"]}
        />
      </RendersDemoCard>
      <RendersDemoCard label="indicator checkbox">
        <MultiSelect
          indicator="checkbox"
          options={[
            { value: "alpha", label: "Alpha" },
            { value: "bravo", label: "Bravo" },
            { value: "charlie", label: "Charlie" },
          ]}
          defaultValues={["alpha", "charlie"]}
        />
      </RendersDemoCard>
    </>
  )
}
