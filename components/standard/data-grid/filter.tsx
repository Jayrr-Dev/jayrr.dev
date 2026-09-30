"use client"

import * as React from "react"
import { ArrowDownIcon, ArrowUpIcon, ListFilterIcon } from "lucide-react"
import { Popover as PopoverPrimitive } from "radix-ui"
import { cn } from "cn"

import { Button } from "@/components/standard/button"
import { Checkbox } from "@/components/standard/checkbox"
import { Select } from "@/components/standard/select"
import type {
  CellValue,
  GridColumn,
  GridConditionOp,
  GridFilterMenu,
} from "@/components/standard/data-grid-model"
import type {
  FilterSections,
  GridActions,
} from "@/components/standard/data-grid/actions"

// Column filter: sort, condition and value-list sections in a header popover.

export const CONDITION_OPTIONS: {
  value: GridConditionOp
  label: string
  inputs: 0 | 1 | 2
}[] = [
  { value: "contains", label: "Contains", inputs: 1 },
  { value: "notContains", label: "Does not contain", inputs: 1 },
  { value: "equals", label: "Is equal to", inputs: 1 },
  { value: "notEquals", label: "Is not equal to", inputs: 1 },
  { value: "startsWith", label: "Starts with", inputs: 1 },
  { value: "endsWith", label: "Ends with", inputs: 1 },
  { value: "gt", label: "Greater than", inputs: 1 },
  { value: "gte", label: "Greater than or equal", inputs: 1 },
  { value: "lt", label: "Less than", inputs: 1 },
  { value: "lte", label: "Less than or equal", inputs: 1 },
  { value: "between", label: "Between", inputs: 2 },
  { value: "empty", label: "Is empty", inputs: 0 },
  { value: "notEmpty", label: "Is not empty", inputs: 0 },
  { value: "true", label: "Is checked", inputs: 0 },
  { value: "false", label: "Is not checked", inputs: 0 },
]

export const VALUE_LIST_LIMIT = 300

export function parsesConditionInput(text: string): CellValue {
  const trimmed = text.trim()
  if (trimmed === "") {
    return null
  }
  return /^-?\d+(\.\d+)?$/.test(trimmed) ? Number(trimmed) : trimmed
}

export function FilterPanel({
  index,
  actions,
  onDone,
}: {
  index: number
  actions: GridActions
  onDone: () => void
}) {
  const [info] = React.useState(() => actions.filterOptions(index))
  const allKeys = info.values.map((item) => item.key)
  const [search, setSearch] = React.useState("")
  const [checked, setChecked] = React.useState(
    () => new Set(info.filter?.values ?? allKeys)
  )
  const [op, setOp] = React.useState<string>(info.filter?.condition?.op ?? "")
  const [first, setFirst] = React.useState(
    String(info.filter?.condition?.value ?? "")
  )
  const [second, setSecond] = React.useState(
    String(info.filter?.condition?.value2 ?? "")
  )
  const needle = search.trim().toLowerCase()
  const matching = needle
    ? info.values.filter((item) => item.label.toLowerCase().includes(needle))
    : info.values
  const shown = matching.slice(0, VALUE_LIST_LIMIT)
  const allMatchingChecked = matching.every((item) => checked.has(item.key))
  const inputs =
    CONDITION_OPTIONS.find((option) => option.value === op)?.inputs ?? 0
  const { sections } = info
  const conditionOptions = CONDITION_OPTIONS.filter((option) =>
    sections.conditions.includes(option.value)
  )
  const filters = sections.conditions.length > 0 || sections.values

  function apply() {
    // A hidden section keeps whatever the filter already had (e.g. set by a backend).
    const values = !sections.values
      ? info.filter?.values
      : allKeys.every((key) => checked.has(key))
        ? undefined
        : allKeys.filter((key) => checked.has(key))
    const condition =
      sections.conditions.length === 0
        ? info.filter?.condition
        : op
          ? {
              op: op as GridConditionOp,
              ...(inputs > 0 ? { value: parsesConditionInput(first) } : {}),
              ...(inputs > 1 ? { value2: parsesConditionInput(second) } : {}),
            }
          : undefined
    actions.applyFilter(
      index,
      values || condition ? { values, condition } : null
    )
    onDone()
  }

  return (
    <div className="flex flex-col gap-3 p-3 text-sm">
      {sections.sort ? (
        <div className="grid grid-cols-2 gap-1.5">
          <Button
            tone={info.sorted === "asc" ? "default" : "outline"}
            size="sm"
            aria-pressed={info.sorted === "asc"}
            title={
              info.sorted === "asc"
                ? "Click again to clear the sort"
                : undefined
            }
            onClick={() => {
              actions.sortColumn(index, info.sorted === "asc" ? null : "asc")
              onDone()
            }}
          >
            <ArrowUpIcon aria-hidden className="size-3.5" />
            Sort A → Z
          </Button>
          <Button
            tone={info.sorted === "desc" ? "default" : "outline"}
            size="sm"
            aria-pressed={info.sorted === "desc"}
            title={
              info.sorted === "desc"
                ? "Click again to clear the sort"
                : undefined
            }
            onClick={() => {
              actions.sortColumn(index, info.sorted === "desc" ? null : "desc")
              onDone()
            }}
          >
            <ArrowDownIcon aria-hidden className="size-3.5" />
            Sort Z → A
          </Button>
        </div>
      ) : null}

      {conditionOptions.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            By condition
          </p>
          <Select
            className="w-full"
            placeholder="None"
            options={conditionOptions.map(({ value, label }) => ({
              value,
              label,
            }))}
            value={op}
            onValueChange={setOp}
          />
          {inputs > 0 ? (
            <input
              aria-label="Value"
              placeholder="Value"
              value={first}
              className="h-7 rounded-md border border-input bg-transparent px-2 text-xs outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              onChange={(event) => setFirst(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && apply()}
            />
          ) : null}
          {inputs > 1 ? (
            <input
              aria-label="Second value"
              placeholder="And"
              value={second}
              className="h-7 rounded-md border border-input bg-transparent px-2 text-xs outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              onChange={(event) => setSecond(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && apply()}
            />
          ) : null}
        </div>
      ) : null}

      {sections.values ? (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-muted-foreground">By values</p>
          <input
            aria-label={`Search ${info.name} values`}
            placeholder="Search"
            value={search}
            autoFocus
            className="h-7 rounded-md border border-input bg-transparent px-2 text-xs outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && apply()}
          />
          <div className="flex max-h-44 flex-col overflow-y-auto rounded-md border border-border py-1">
            <Checkbox
              className="mx-0 px-2 py-1 text-xs"
              label={needle ? "Select all matches" : "Select all"}
              checked={matching.length > 0 && allMatchingChecked}
              onChange={(event) =>
                setChecked((current) => {
                  const next = new Set(current)
                  for (const item of matching) {
                    if (event.target.checked) next.add(item.key)
                    else next.delete(item.key)
                  }
                  return next
                })
              }
            />
            {shown.map((item) => (
              <Checkbox
                key={item.key}
                className="mx-0 px-2 py-1 text-xs"
                label={
                  <span
                    className={cn(
                      "truncate",
                      item.key === "" && "text-muted-foreground italic"
                    )}
                  >
                    {item.label}
                  </span>
                }
                checked={checked.has(item.key)}
                onChange={(event) =>
                  setChecked((current) => {
                    const next = new Set(current)
                    if (event.target.checked) next.add(item.key)
                    else next.delete(item.key)
                    return next
                  })
                }
              />
            ))}
            {matching.length > shown.length ? (
              <p className="px-2 py-1 text-xs text-muted-foreground">
                {matching.length - shown.length} more. Search to narrow the
                list.
              </p>
            ) : null}
            {matching.length === 0 ? (
              <p className="px-2 py-1 text-xs text-muted-foreground">
                No values
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {filters ? (
        <div className="flex items-center gap-1.5">
          <Button
            tone="ghost"
            size="sm"
            disabled={!info.filter}
            onClick={() => {
              actions.applyFilter(index, null)
              onDone()
            }}
          >
            Clear
          </Button>
          <span className="flex-1" />
          <Button tone="outline" size="sm" onClick={onDone}>
            Cancel
          </Button>
          <Button size="sm" onClick={apply}>
            Apply
          </Button>
        </div>
      ) : null}
    </div>
  )
}

export function stopsEvent(event: React.SyntheticEvent) {
  event.stopPropagation()
}

export function HeaderFilter({
  index,
  active,
  actions,
}: {
  index: number
  active: boolean
  actions: GridActions
}) {
  const [open, setOpen] = React.useState(false)
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          aria-label={active ? "Filter (active)" : "Filter"}
          data-active={active || undefined}
          className={cn(
            "absolute top-1/2 right-2.5 z-20 flex size-5 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground",
            active &&
              "bg-(--grid-accent) text-primary-foreground hover:bg-(--grid-accent) hover:text-primary-foreground"
          )}
          onPointerDown={stopsEvent}
          onClick={stopsEvent}
          onDoubleClick={stopsEvent}
        >
          <ListFilterIcon aria-hidden className="size-3.5" />
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          data-grid-editor
          align="end"
          sideOffset={6}
          collisionPadding={8}
          className="z-50 w-64 rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none"
          onPointerDown={stopsEvent}
          onClick={stopsEvent}
          onDoubleClick={stopsEvent}
          onContextMenu={stopsEvent}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            actions.focusGrid()
          }}
        >
          {open ? (
            <FilterPanel
              index={index}
              actions={actions}
              onDone={() => setOpen(false)}
            />
          ) : null}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}

/** Merges the grid's filter menu defaults with a column's own settings. */
export function resolvesFilterSections(
  gridMenu: GridFilterMenu | undefined,
  column: GridColumn,
  readOnly: boolean
): FilterSections {
  const menu: GridFilterMenu = {
    ...gridMenu,
    ...(typeof column.filterable === "object" ? column.filterable : null),
  }
  const conditions = menu.conditions ?? true
  return {
    sort: (menu.sort ?? true) && !readOnly,
    conditions:
      conditions === false
        ? []
        : conditions === true
          ? CONDITION_OPTIONS.map((option) => option.value)
          : conditions,
    values: menu.values ?? true,
  }
}

export function hasFilterSections(sections: FilterSections) {
  return sections.sort || sections.conditions.length > 0 || sections.values
}
