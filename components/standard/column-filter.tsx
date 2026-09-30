"use client"

import * as React from "react"
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/standard/button"
import { Checkbox } from "@/components/standard/checkbox"
import { Select } from "@/components/standard/select"
import { useControllableState } from "@/hooks/use-controllable-state"

export type ColumnFilterOp =
  | "equals"
  | "notEquals"
  | "contains"
  | "notContains"
  | "startsWith"
  | "endsWith"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "between"
  | "empty"
  | "notEmpty"
  | "true"
  | "false"

export type ColumnFilterCondition = {
  op: ColumnFilterOp
  value?: string | number | boolean | null
  value2?: string | number | boolean | null
}

/**
 * `values` keeps the listed option keys; `condition` keeps values that pass
 * the test. With both, a value must pass both.
 */
export type ColumnFilterValue = {
  values?: string[]
  condition?: ColumnFilterCondition
}

/** One entry in the value list. The key "" stands for blank values. */
export type ColumnFilterOption = { key: string; label: string }

export type ColumnFilterSort = "asc" | "desc"

export const columnFilterConditions: {
  value: ColumnFilterOp
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

/** Long lists render this many rows; search narrows the rest. */
const VALUE_LIST_LIMIT = 300

const inputClass =
  "h-7 rounded-md border border-input bg-transparent px-2 text-xs outline-none focus-visible:ring-3 focus-visible:ring-ring/50"

function parsesConditionInput(text: string) {
  const trimmed = text.trim()
  if (trimmed === "") {
    return null
  }
  return /^-?\d+(\.\d+)?$/.test(trimmed) ? Number(trimmed) : trimmed
}

// A column's filter menu: sort buttons, a condition and a checklist of its
// values. Each section shows only when it has something to work with. Edits
// are a draft until Apply, which hands the filter to onValueChange.
function ColumnFilter({
  className,
  name = "column",
  options,
  conditions = true,
  value: valueProp,
  defaultValue = null,
  onValueChange,
  sort = null,
  onSortChange,
  onDone,
  autoFocus = false,
}: {
  className?: string
  /** The column's name, used in accessible labels. */
  name?: string
  /** The value list. Leave it out to hide the "By values" section. */
  options?: ColumnFilterOption[]
  /** Operators to offer. `true` offers all; `false` or `[]` hides the section. */
  conditions?: boolean | ColumnFilterOp[]
  /** The applied filter, or null for none. */
  value?: ColumnFilterValue | null
  defaultValue?: ColumnFilterValue | null
  onValueChange?: (value: ColumnFilterValue | null) => void
  /** The column's current sort. */
  sort?: ColumnFilterSort | null
  /** Shows the sort buttons. Picking the current direction again passes null. */
  onSortChange?: (sort: ColumnFilterSort | null) => void
  /** Runs after Sort, Apply, Clear or Cancel, e.g. to close a popover. */
  onDone?: () => void
  /** Focuses the value search on mount. */
  autoFocus?: boolean
}) {
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  })
  const allKeys = (options ?? []).map((option) => option.key)
  const conditionOptions =
    conditions === true
      ? columnFilterConditions
      : conditions === false
        ? []
        : columnFilterConditions.filter((option) =>
            conditions.includes(option.value)
          )

  const [search, setSearch] = React.useState("")
  const [checked, setChecked] = React.useState(
    () => new Set(value?.values ?? allKeys)
  )
  const [op, setOp] = React.useState<string>(value?.condition?.op ?? "")
  const [first, setFirst] = React.useState(
    String(value?.condition?.value ?? "")
  )
  const [second, setSecond] = React.useState(
    String(value?.condition?.value2 ?? "")
  )

  const needle = search.trim().toLowerCase()
  const matching = needle
    ? (options ?? []).filter((option) =>
        option.label.toLowerCase().includes(needle)
      )
    : (options ?? [])
  const shown = matching.slice(0, VALUE_LIST_LIMIT)
  const allMatchingChecked = matching.every((option) => checked.has(option.key))
  const inputs =
    columnFilterConditions.find((option) => option.value === op)?.inputs ?? 0
  const filters = conditionOptions.length > 0 || options !== undefined

  function resetsDraft(next: ColumnFilterValue | null) {
    setSearch("")
    setChecked(new Set(next?.values ?? allKeys))
    setOp(next?.condition?.op ?? "")
    setFirst(String(next?.condition?.value ?? ""))
    setSecond(String(next?.condition?.value2 ?? ""))
  }

  function apply() {
    // A hidden section keeps whatever the filter already had (e.g. set by a backend).
    const values =
      options === undefined
        ? value?.values
        : allKeys.every((key) => checked.has(key))
          ? undefined
          : allKeys.filter((key) => checked.has(key))
    const condition =
      conditionOptions.length === 0
        ? value?.condition
        : op
          ? {
              op: op as ColumnFilterOp,
              ...(inputs > 0 ? { value: parsesConditionInput(first) } : {}),
              ...(inputs > 1 ? { value2: parsesConditionInput(second) } : {}),
            }
          : undefined
    setValue(values || condition ? { values, condition } : null)
    onDone?.()
  }

  function toggles(keys: string[], on: boolean) {
    setChecked((current) => {
      const next = new Set(current)
      for (const key of keys) {
        if (on) next.add(key)
        else next.delete(key)
      }
      return next
    })
  }

  return (
    <div
      data-slot="column-filter"
      className={cn(
        "flex w-64 max-w-full flex-col gap-3 p-3 text-sm",
        className
      )}
    >
      {onSortChange ? (
        <div className="grid grid-cols-2 gap-1.5">
          {(["asc", "desc"] as const).map((direction) => (
            <Button
              key={direction}
              tone={sort === direction ? "default" : "outline"}
              size="sm"
              aria-pressed={sort === direction}
              title={
                sort === direction ? "Click again to clear the sort" : undefined
              }
              leading={
                direction === "asc" ? (
                  <ArrowUpIcon aria-hidden className="size-3.5" />
                ) : (
                  <ArrowDownIcon aria-hidden className="size-3.5" />
                )
              }
              onClick={() => {
                onSortChange(sort === direction ? null : direction)
                onDone?.()
              }}
            >
              {direction === "asc" ? "Sort A → Z" : "Sort Z → A"}
            </Button>
          ))}
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
              className={inputClass}
              onChange={(event) => setFirst(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && apply()}
            />
          ) : null}
          {inputs > 1 ? (
            <input
              aria-label="Second value"
              placeholder="And"
              value={second}
              className={inputClass}
              onChange={(event) => setSecond(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && apply()}
            />
          ) : null}
        </div>
      ) : null}

      {options !== undefined ? (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-muted-foreground">By values</p>
          <input
            aria-label={`Search ${name} values`}
            placeholder="Search"
            value={search}
            autoFocus={autoFocus}
            className={inputClass}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && apply()}
          />
          <div className="flex max-h-44 flex-col overflow-y-auto rounded-md border border-border py-1">
            <Checkbox
              className="mx-0 px-2 py-1 text-xs"
              label={needle ? "Select all matches" : "Select all"}
              checked={matching.length > 0 && allMatchingChecked}
              onChange={(event) =>
                toggles(
                  matching.map((option) => option.key),
                  event.target.checked
                )
              }
            />
            {shown.map((option) => (
              <Checkbox
                key={option.key}
                className="mx-0 px-2 py-1 text-xs"
                label={
                  <span
                    className={cn(
                      "truncate",
                      option.key === "" && "text-muted-foreground italic"
                    )}
                  >
                    {option.label}
                  </span>
                }
                checked={checked.has(option.key)}
                onChange={(event) =>
                  toggles([option.key], event.target.checked)
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
            disabled={!value}
            onClick={() => {
              setValue(null)
              resetsDraft(null)
              onDone?.()
            }}
          >
            Clear
          </Button>
          <span className="flex-1" />
          <Button
            tone="outline"
            size="sm"
            onClick={() => {
              resetsDraft(value)
              onDone?.()
            }}
          >
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

export { ColumnFilter }
