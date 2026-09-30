"use client"

import { useState } from "react"

import {
  ColumnFilter,
  type ColumnFilterSort,
  type ColumnFilterValue,
} from "@/components/standard/column-filter"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const STATUS_OPTIONS = [
  { key: "Blocked", label: "Blocked" },
  { key: "Done", label: "Done" },
  { key: "In progress", label: "In progress" },
  { key: "To do", label: "To do" },
  { key: "", label: "(Blanks)" },
]

function describesFilter(value: ColumnFilterValue | null) {
  if (!value) {
    return "No filter"
  }
  const parts = []
  if (value.values) parts.push(`values: ${value.values.join(", ") || "none"}`)
  if (value.condition) {
    const { op, value: first, value2 } = value.condition
    parts.push([op, first, value2].filter((part) => part != null).join(" "))
  }
  return parts.join(" · ")
}

function RendersLiveColumnFilter() {
  const [value, setValue] = useState<ColumnFilterValue | null>({
    values: ["In progress", "To do"],
  })
  const [sort, setSort] = useState<ColumnFilterSort | null>(null)

  return (
    <RendersDemoCard label="Column filter · sort, condition, values">
      <div className="flex flex-col gap-2">
        <div className="rounded-lg bg-popover shadow-md ring-1 ring-foreground/10">
          <ColumnFilter
            name="Status"
            options={STATUS_OPTIONS}
            value={value}
            onValueChange={setValue}
            sort={sort}
            onSortChange={setSort}
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {describesFilter(value)} · sort: {sort ?? "none"}
        </span>
      </div>
    </RendersDemoCard>
  )
}

function RendersNumberColumnFilter() {
  const [value, setValue] = useState<ColumnFilterValue | null>(null)

  return (
    <RendersDemoCard label="Column filter · conditions only">
      <div className="flex flex-col gap-2">
        <div className="rounded-lg bg-popover shadow-md ring-1 ring-foreground/10">
          <ColumnFilter
            name="Progress"
            conditions={["gt", "gte", "lt", "lte", "between", "empty"]}
            value={value}
            onValueChange={setValue}
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {describesFilter(value)}
        </span>
      </div>
    </RendersDemoCard>
  )
}

export function RendersColumnFilterDemo() {
  return (
    <>
      <RendersLiveColumnFilter />
      <RendersNumberColumnFilter />
    </>
  )
}
