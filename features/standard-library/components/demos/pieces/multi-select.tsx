"use client"

import { MultiSelect, Select } from "@/components/standard/select"
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
      <RendersDemoCard label="Select multiple (replacement)">
        <Select
          multiple
          maxTags={2}
          options={[
            { value: "alpha", label: "Alpha" },
            { value: "bravo", label: "Bravo" },
            { value: "charlie", label: "Charlie" },
          ]}
          defaultValues={["alpha", "bravo"]}
        />
      </RendersDemoCard>
    </>
  )
}
