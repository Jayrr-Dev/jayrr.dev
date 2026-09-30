"use client"

import { useState } from "react"
import { LayoutGridIcon, ListIcon, TableIcon } from "lucide-react"

import { ButtonArray } from "@/components/standard/button-array"
import { Paragraph } from "@/components/standard/paragraph"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const SECTION_ITEMS = [
  { id: "events", label: "Events" },
  { id: "reports", label: "Reports" },
  { id: "crew", label: "Crew" },
]

const VIEW_ITEMS = [
  { id: "table", label: "Table", icon: <TableIcon /> },
  { id: "grid", label: "Grid", icon: <LayoutGridIcon /> },
  { id: "list", label: "List", icon: <ListIcon /> },
]

const STATUS_ITEMS = [
  { id: "open", label: "Open", count: 12 },
  { id: "hold", label: "Hold", count: 3 },
  { id: "done", label: "Done", count: 48 },
]

function RendersLiveButtonArray() {
  const [value, setValue] = useState("events")
  const [values, setValues] = useState<string[]>(["open"])

  // One stateful component, so the gallery sees a single card: lay the
  // cards out here and fill the dialog width.
  return (
    <div data-fill className="grid w-full gap-3 sm:grid-cols-2">
      <RendersDemoCard>
        <ButtonArray
          items={SECTION_ITEMS}
          value={value}
          onValueChange={setValue}
        />
      </RendersDemoCard>
      <RendersDemoCard label="selected">
        <Paragraph size="sm">{value}</Paragraph>
      </RendersDemoCard>
      <RendersDemoCard label="variant slider">
        <ButtonArray
          appearance="slider"
          items={SECTION_ITEMS}
          defaultValue="crew"
        />
      </RendersDemoCard>
      <RendersDemoCard label="variant underlined">
        <ButtonArray
          appearance="underlined"
          items={SECTION_ITEMS}
          defaultValue="reports"
        />
      </RendersDemoCard>
      <RendersDemoCard label="type multiple">
        <ButtonArray
          type="multiple"
          items={STATUS_ITEMS.map(({ id, label }) => ({ id, label }))}
          values={values}
          onValuesChange={setValues}
        />
        <Paragraph size="sm">{values.join(", ") || "none"}</Paragraph>
      </RendersDemoCard>
      <RendersDemoCard label="appearance segmented">
        <ButtonArray
          appearance="segmented"
          items={SECTION_ITEMS}
          defaultValue="reports"
        />
      </RendersDemoCard>
      <RendersDemoCard label="item icon">
        <ButtonArray
          appearance="segmented"
          items={VIEW_ITEMS}
          defaultValue="grid"
        />
      </RendersDemoCard>
      <RendersDemoCard label="item count">
        <ButtonArray
          appearance="underlined"
          items={STATUS_ITEMS}
          defaultValue="open"
        />
      </RendersDemoCard>
      <RendersDemoCard label="size sm">
        <ButtonArray size="sm" items={SECTION_ITEMS} defaultValue="crew" />
        <ButtonArray
          size="sm"
          appearance="segmented"
          items={SECTION_ITEMS}
          defaultValue="crew"
        />
      </RendersDemoCard>
      <RendersDemoCard label="block">
        <ButtonArray
          block
          appearance="slider"
          items={SECTION_ITEMS}
          defaultValue="events"
        />
      </RendersDemoCard>
      <RendersDemoCard label="appearance slider · type multiple">
        <ButtonArray
          type="multiple"
          appearance="slider"
          items={SECTION_ITEMS}
          defaultValues={["events", "crew"]}
        />
      </RendersDemoCard>
    </div>
  )
}

export function RendersButtonArrayDemo() {
  return <RendersLiveButtonArray />
}
