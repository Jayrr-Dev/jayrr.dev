"use client"

import { useRef, useState } from "react"
import { Redo2Icon, Undo2Icon } from "lucide-react"

import { Button } from "@/components/standard/button"
import {
  createGridData,
  createLocalStorageAdapter,
  DataGrid,
  dataGridCellTypes,
  type CellValue,
  type DataGridCellType,
  type DataGridHandle,
  type GridChange,
  type GridFormatRule,
} from "@/components/standard/data-grid"
import { Progress } from "@/components/standard/progress"
import { Switch } from "@/components/standard/switch"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const STATUS_OPTIONS = [
  { value: "todo", label: "To do", tone: "outline" as const },
  { value: "doing", label: "In progress", tone: "quiet" as const },
  { value: "done", label: "Done", tone: "default" as const },
  { value: "blocked", label: "Blocked", tone: "danger" as const },
]

/** A custom cell type: any component can render inside a cell. */
const CELL_TYPES: Record<string, DataGridCellType> = {
  ...dataGridCellTypes,
  progress: {
    ...dataGridCellTypes.number,
    // The bar needs room regardless of the number, so auto-fit uses a fixed width.
    fitWidth: () => 150,
    render: ({ value }) => {
      if (typeof value !== "number") {
        return (
          <span className="truncate">
            {value === null ? "" : String(value)}
          </span>
        )
      }
      const percent = Math.min(100, Math.max(0, value))
      return (
        <span className="flex w-full items-center gap-2">
          <Progress value={percent} className="h-1.5 flex-1" />
          <span className="w-8 text-right text-xs text-muted-foreground tabular-nums">
            {percent}%
          </span>
        </span>
      )
    },
  },
}

const TRACKER_ROWS: CellValue[][] = [
  ["Kickoff", "done", "Ada", 100, "2026-09-01", true],
  ["Research", "done", "Grace", 100, "2026-09-08", true],
  ["Wireframes", "doing", "Linus", 60, "2026-09-15", false],
  ["Design system", "doing", "Ada", 35, "2026-09-22", false],
  ["API", "todo", "Grace", 0, "2026-09-29", false],
  ["Launch", "blocked", "Linus", 0, "2026-10-06", false],
]

const TRACKER = createGridData({
  columns: [
    { id: "task", label: "Task", width: 160 },
    {
      id: "status",
      label: "Status",
      type: "select",
      options: STATUS_OPTIONS,
      width: 140,
      filterable: true,
    },
    {
      id: "owner",
      label: "Owner",
      width: 130,
      // Values list only.
      filterable: { sort: false, conditions: false },
    },
    {
      id: "progress",
      label: "Progress",
      type: "progress",
      width: 170,
      // Sort plus numeric conditions; no values list.
      filterable: {
        values: false,
        conditions: ["gt", "gte", "lt", "lte", "between"],
      },
    },
    { id: "due", label: "Due", type: "date", width: 130 },
    {
      id: "shipped",
      label: "Shipped",
      type: "checkbox",
      width: 90,
      sortable: false,
    },
    { id: "notes", label: "Notes", width: 180, sortable: false },
  ],
  rows: [...TRACKER_ROWS, ...Array.from({ length: 24 }, () => [])],
  frozen: { rows: 0, cols: 1 },
})

/**
 * Formatting rules as plain JSON: the shape a backend would store and send.
 * Earlier rules win where they overlap; cell beats row beats column.
 */
const RULES: { label: string; rule: GridFormatRule }[] = [
  {
    label: "Blocked rows red",
    rule: {
      id: "blocked-row",
      target: "row",
      columns: ["status"],
      when: { op: "equals", value: "blocked" },
      style: { background: "red", color: "red", bold: true },
    },
  },
  {
    label: "Finished progress green",
    rule: {
      id: "done-progress",
      target: "cell",
      columns: ["progress"],
      when: { op: "gte", value: 100 },
      style: { background: "green", border: "green" },
    },
  },
  {
    label: "Shipped rows struck through",
    rule: {
      id: "shipped-row",
      target: "row",
      columns: ["shipped"],
      when: { op: "true" },
      style: { strike: true, css: { opacity: 0.55 } },
    },
  },
  {
    label: "Notes column italic",
    rule: {
      id: "notes-column",
      target: "column",
      columns: ["notes"],
      style: {
        italic: true,
        color: "gray",
        background: "amber",
        fontSize: "12px",
      },
    },
  },
]

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"]

/** 10,000 × 26 with deterministic values so server and client render the same. */
const LARGE = createGridData({
  columns: 26,
  rows: Array.from({ length: 10_000 }, (_, row) => [
    `Item ${row + 1}`,
    WEEKDAYS[row % WEEKDAYS.length],
    (row * 37) % 1000,
    ((row * 7919) % 10_000) / 100,
  ]),
  frozen: { rows: 1, cols: 1 },
})

const SAVED = createLocalStorageAdapter("jayrr.data-grid.demo")

function describesChange(change: GridChange) {
  switch (change.type) {
    case "setCells":
      return `setCells ×${change.cells.length}`
    case "insertRows":
      return `insertRows ×${change.rows.length} at ${change.index + 1}`
    case "insertColumns":
      return `insertColumns ×${change.columns.length} at ${change.index + 1}`
    case "deleteRows":
    case "deleteColumns":
      return `${change.type} ×${change.ids.length}`
    case "patchRows":
    case "patchColumns":
      return `${change.type} ${Object.keys(change.patches[0]?.patch ?? {}).join(", ")}`
    case "setFrozen":
      return `setFrozen ${change.frozen.rows} rows, ${change.frozen.cols} cols`
    case "reorderRows":
      return `reorderRows ×${change.ids.length}`
    case "setSort":
      return change.sort
        ? `setSort ${change.sort.colId} ${change.sort.direction}`
        : "setSort none"
    case "setFilter":
      return `setFilter ${change.colId} ${change.filter ? JSON.stringify(change.filter) : "cleared"}`
    case "setRules":
      return `setRules ×${change.rules.length}`
  }
}

function RendersTrackerDemo() {
  const grid = useRef<DataGridHandle>(null)
  const [log, setLog] = useState<string[]>([])
  const [enabled, setEnabled] = useState(
    () => new Set(RULES.map(({ rule }) => rule.id))
  )
  const rules = RULES.filter(({ rule }) => enabled.has(rule.id)).map(
    ({ rule }) => rule
  )

  return (
    <div className="flex w-full min-w-0 flex-col gap-3">
      <DataGrid
        ref={grid}
        defaultValue={TRACKER}
        cellTypes={CELL_TYPES}
        headerMode="both"
        sortable
        autoFitButton
        formatRules={rules}
        height={360}
        label="Project tracker"
        onChanges={(changes, _data, source) =>
          setLog((current) =>
            [
              ...changes.map(
                (change) => `${source} · ${describesChange(change)}`
              ),
              ...current,
            ].slice(0, 6)
          )
        }
        toolbar={
          <div className="flex items-center gap-1">
            <Button
              tone="ghost"
              size="sm"
              aria-label="Undo"
              onClick={() => grid.current?.undo()}
            >
              <Undo2Icon aria-hidden className="size-4" />
            </Button>
            <Button
              tone="ghost"
              size="sm"
              aria-label="Redo"
              onClick={() => grid.current?.redo()}
            >
              <Redo2Icon aria-hidden className="size-4" />
            </Button>
          </div>
        }
      />
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-muted-foreground">Rules</span>
        {RULES.map(({ label, rule }) => (
          <Button
            key={rule.id}
            size="sm"
            tone={enabled.has(rule.id) ? "default" : "outline"}
            aria-pressed={enabled.has(rule.id)}
            onClick={() =>
              setEnabled((current) => {
                const next = new Set(current)
                if (next.has(rule.id)) next.delete(rule.id)
                else next.add(rule.id)
                return next
              })
            }
          >
            {label}
          </Button>
        ))}
      </div>
      <div className="rounded-lg border border-dashed border-border px-3 py-2 font-mono text-xs text-muted-foreground">
        <p className="mb-1 font-sans font-medium text-foreground">
          onChanges → your database
        </p>
        {log.length === 0 ? (
          <p>
            Click a header to sort, use a filter button, edit a cell, or
            right-click a header.
          </p>
        ) : null}
        {log.map((line, index) => (
          <p key={`${line}-${index}`}>{line}</p>
        ))}
      </div>
    </div>
  )
}

const PLAIN = createGridData({ columns: 5, rows: 8 })

/** Toggle the Name Box bar and header strips off for a bare cell sheet. */
function RendersHeadersDemo() {
  const [nameBox, setNameBox] = useState(false)
  const [columnHeaders, setColumnHeaders] = useState(false)
  const [rowHeaders, setRowHeaders] = useState(false)

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap gap-4">
        <Switch
          size="sm"
          label="Name Box"
          checked={nameBox}
          onCheckedChange={setNameBox}
        />
        <Switch
          size="sm"
          label="Column headers"
          checked={columnHeaders}
          onCheckedChange={setColumnHeaders}
        />
        <Switch
          size="sm"
          label="Row headers"
          checked={rowHeaders}
          onCheckedChange={setRowHeaders}
        />
      </div>
      <DataGrid
        defaultValue={PLAIN}
        showNameBox={nameBox}
        showColumnHeaders={columnHeaders}
        showRowHeaders={rowHeaders}
        height={260}
        className="w-full"
        label="Grid without headers"
      />
    </div>
  )
}

export function RendersStandardDataGridDemo() {
  return (
    <>
      <RendersDemoCard label="sort, filter, style rules, typed cells" fill>
        <RendersTrackerDemo />
      </RendersDemoCard>
      <RendersDemoCard
        label="10,000 rows, frozen row and column, chevron sort"
        fill
      >
        <DataGrid
          defaultValue={LARGE}
          sortable
          sortIndicator="chevron"
          autoFitButton
          height={420}
          className="w-full"
          label="Large grid"
        />
      </RendersDemoCard>
      <RendersDemoCard label="showNameBox · showColumnHeaders · showRowHeaders" fill>
        <RendersHeadersDemo />
      </RendersDemoCard>
      <RendersDemoCard label="saved to localStorage via an adapter" fill>
        <DataGrid
          adapter={SAVED}
          defaultValue={createGridData({ columns: 6, rows: 20 })}
          height={300}
          className="w-full"
          label="Saved grid"
        />
      </RendersDemoCard>
    </>
  )
}
