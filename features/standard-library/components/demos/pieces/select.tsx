"use client"

import { useState, type ReactNode } from "react"
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  LayoutGridIcon,
  ListIcon,
  TableIcon,
} from "lucide-react"

import { Select } from "@/components/standard/select"
import { Toolbar } from "@/components/standard/toolbar"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

type SelectOption = {
  value: string
  label: string
  group?: string
  icon?: ReactNode
}

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

const CREW_OPTIONS: SelectOption[] = [
  { value: "ana", label: "Ana" },
  { value: "ben", label: "Ben" },
  { value: "cleo", label: "Cleo" },
  { value: "dev", label: "Dev" },
  { value: "eli", label: "Eli" },
  { value: "fay", label: "Fay" },
]

const VIEW_ICON_OPTIONS: SelectOption[] = [
  { value: "table", label: "Table", icon: <TableIcon /> },
  { value: "grid", label: "Grid", icon: <LayoutGridIcon /> },
  { value: "list", label: "List", icon: <ListIcon /> },
]

const ALIGN_OPTIONS: SelectOption[] = [
  { value: "left", label: "Left", icon: <AlignLeftIcon /> },
  { value: "center", label: "Center", icon: <AlignCenterIcon /> },
  { value: "right", label: "Right", icon: <AlignRightIcon /> },
]

function RendersLiveMultipleSelect() {
  const [values, setValues] = useState<string[]>(["ben"])

  return (
    <RendersDemoCard label="multiple">
      <Select
        multiple
        placeholder="Crew"
        options={CREW_OPTIONS}
        values={values}
        onValuesChange={setValues}
      />
    </RendersDemoCard>
  )
}

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
      <RendersLiveMultipleSelect />
      <RendersDemoCard label="indicator checkbox">
        <Select
          multiple
          indicator="checkbox"
          placeholder="Crew"
          options={CREW_OPTIONS}
          defaultValues={["ana", "cleo"]}
        />
      </RendersDemoCard>
      <RendersDemoCard label="maxTags 2">
        <div className="flex flex-col items-start gap-2">
          <Select
            multiple
            maxTags={2}
            placeholder="Crew"
            options={CREW_OPTIONS}
            defaultValues={["ana", "ben"]}
          />
          <Select
            multiple
            maxTags={2}
            placeholder="Crew"
            options={CREW_OPTIONS}
            defaultValues={["ana", "ben", "cleo"]}
          />
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="searchable">
        <Select
          searchable
          placeholder="Crew member"
          options={CREW_OPTIONS}
        />
      </RendersDemoCard>
      <RendersDemoCard label="option icons">
        <Select
          placeholder="View"
          options={VIEW_ICON_OPTIONS}
          defaultValue="grid"
        />
      </RendersDemoCard>
      <RendersDemoCard label="appearance toolbar">
        <Toolbar variant="floating" aria-label="Text">
          <Select
            appearance="toolbar"
            size="default"
            aria-label="Alignment"
            placeholder="Alignment"
            options={ALIGN_OPTIONS}
            defaultValue="left"
          />
        </Toolbar>
      </RendersDemoCard>
      <RendersDemoCard label="variant filled">
        <Select
          variant="filled"
          size="default"
          placeholder="Status"
          options={WEEK_OPTIONS}
        />
      </RendersDemoCard>
      <RendersDemoCard label="variant outlined">
        <Select
          variant="outlined"
          size="default"
          placeholder="Status"
          options={WEEK_OPTIONS}
        />
      </RendersDemoCard>
      <RendersDemoCard label="size sm · default · lg">
        <div className="flex flex-wrap items-center gap-2">
          <Select size="sm" placeholder="Small" options={WEEK_OPTIONS} />
          <Select size="default" placeholder="Default" options={WEEK_OPTIONS} />
          <Select size="lg" placeholder="Large" options={WEEK_OPTIONS} />
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="clearable">
        <div className="flex flex-col items-start gap-2">
          <Select clearable placeholder="Period" options={WEEK_OPTIONS} defaultValue="month" />
          <Select
            clearable
            multiple
            placeholder="Crew"
            options={CREW_OPTIONS}
            defaultValues={["dev", "eli"]}
          />
        </div>
      </RendersDemoCard>
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
