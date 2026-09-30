"use client"

import { useState } from "react"

import { Select } from "@/components/standard/select"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

type SelectOption = { value: string; label: string; group?: string }

const WEEK_OPTIONS: SelectOption[] = [
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "year", label: "This year" },
]

const OPTION_SETS: { placeholder: string; options: SelectOption[] }[] = [
  { placeholder: "Select", options: WEEK_OPTIONS },
  {
    placeholder: "Month",
    options: [
      { value: "sep", label: "September" },
      { value: "oct", label: "October" },
    ],
  },
  {
    placeholder: "Department",
    options: [
      { value: "eng", label: "Engineering", group: "Field" },
      { value: "ops", label: "Operations", group: "Field" },
    ],
  },
  { placeholder: "Period", options: WEEK_OPTIONS },
  {
    placeholder: "View",
    options: [
      { value: "table", label: "Table" },
      { value: "grid", label: "Grid" },
    ],
  },
]

function RendersLiveSelect({
  label,
  placeholder,
  options,
}: {
  label: string
  placeholder: string
  options: SelectOption[]
}) {
  const [value, setValue] = useState("")

  return (
    <RendersDemoCard label={label}>
      <Select
        placeholder={placeholder}
        options={options}
        value={value}
        onValueChange={setValue}
      />
    </RendersDemoCard>
  )
}

export function RendersSelectDemo() {
  return (
    <>
      {OPTION_SETS.map((set) => (
        <RendersLiveSelect
          key={set.placeholder}
          label={`Select · ${set.placeholder}`}
          placeholder={set.placeholder}
          options={set.options}
        />
      ))}
      <RendersDemoCard label="uncontrolled">
        <Select
          placeholder="Status"
          options={[
            { value: "open", label: "Open" },
            { value: "hold", label: "Hold" },
          ]}
        />
      </RendersDemoCard>
    </>
  )
}
