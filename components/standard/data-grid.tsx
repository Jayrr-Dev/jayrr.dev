"use client"

import * as React from "react"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ChevronsLeftRightIcon,
  ChevronsUpDownIcon,
  ListFilterIcon,
  MoveHorizontalIcon,
  PlusIcon,
} from "lucide-react"
import {
  ContextMenu as ContextMenuPrimitive,
  AlertDialog as AlertDialogPrimitive,
  Popover as PopoverPrimitive,
} from "radix-ui"
import { cn } from "cn"

import { Badge } from "@/components/standard/badge"
import { Button } from "@/components/standard/button"
import { Checkbox } from "@/components/standard/checkbox"
import { Select } from "@/components/standard/select"
import {
  applyGridChanges,
  clearRange,
  clearSort,
  columnLetter,
  createGridData,
  createStyleResolver,
  deleteColumns,
  deleteRows,
  duplicateColumns,
  duplicateRows,
  fillDown,
  fillRange,
  fillRight,
  filteredOutRows,
  filterKey,
  formatCellRef,
  formatRange,
  insertColumns,
  insertRows,
  isEmptyValue,
  normalizeRange,
  parseRange,
  pasteText,
  rangeContains,
  rangeToText,
  readCell,
  resolveGridColor,
  setCellValues,
  setColumnsHidden,
  setFilter,
  setFrozen,
  setRowsHidden,
  sortRows,
  type CellRef,
  type CellValue,
  type DataGridAdapter,
  type GridChange,
  type GridColumn,
  type GridConditionOp,
  type GridData,
  type GridFilter,
  type GridFilterMenu,
  type GridFormatRule,
  type GridRange,
  type GridRow,
  type GridStyle,
  type SortDirection,
} from "@/components/standard/data-grid-model"

export * from "@/components/standard/data-grid-model"

// ---------------------------------------------------------------------------
// Cell types

export type DataGridCellContext = {
  value: CellValue
  column: GridColumn
  row: GridRow
  rowIndex: number
  colIndex: number
  active: boolean
  readOnly: boolean
  /** Writes a new value as one undo step. */
  setValue: (value: CellValue) => void
}

export type DataGridFitContext = {
  value: CellValue
  column: GridColumn
  /** The formatted value. */
  text: string
  /** Text width in px at the given font size (default 14) and weight (default 400). */
  measure: (text: string, size?: number, weight?: number) => number
}

/** Horizontal cell padding (px-2 on both sides) plus the grid line. */
const CELL_CHROME = 17

export type DataGridEditMove = "down" | "up" | "right" | "left" | "none"

export type DataGridEditorContext = DataGridCellContext & {
  /** The key that opened the editor, or null for F2, Enter, or double-click. */
  initialText: string | null
  /** The current value as editable text. */
  text: string
  parse: (text: string) => CellValue
  commit: (value: CellValue, move?: DataGridEditMove) => void
  cancel: () => void
  /** Registers how to save the draft when the grid ends editing (a click elsewhere, blur). */
  register: (save: (() => void) | null) => void
}

export type DataGridCellType = {
  /** Display content. Defaults to the formatted value as text. */
  render?: (context: DataGridCellContext) => React.ReactNode
  /** Editor shown while editing. Defaults to a text input; `false` makes cells non-editable. */
  edit?: ((context: DataGridEditorContext) => React.ReactNode) | false
  /** Text (typed or pasted) to value. */
  parse?: (text: string, column: GridColumn) => CellValue
  /** Value to text, for copying and the editor's starting text. */
  format?: (value: CellValue, column: GridColumn) => string
  align?: "start" | "center" | "end"
  /** Space flips the value with this, and the cell never opens an editor. */
  toggle?: (value: CellValue) => CellValue
  /**
   * Content width in px for auto-fit, padding included. Defaults to the
   * formatted text's width plus the cell padding.
   */
  fitWidth?: (context: DataGridFitContext) => number
}

function formatsPlain(value: CellValue) {
  return value === null ? "" : String(value)
}

function useRegistersEditor(
  context: DataGridEditorContext,
  read: () => CellValue
) {
  const readRef = React.useRef(read)
  React.useLayoutEffect(() => {
    readRef.current = read
  })
  const { register, commit } = context
  React.useEffect(() => {
    register(() => commit(readRef.current(), "none"))
    return () => register(null)
  }, [register, commit])
}

function keyMove(event: React.KeyboardEvent): DataGridEditMove | null {
  if (event.key === "Enter") {
    return event.shiftKey ? "up" : "down"
  }
  if (event.key === "Tab") {
    return event.shiftKey ? "left" : "right"
  }
  return null
}

function TextEditor({
  context,
  inputType = "text",
}: {
  context: DataGridEditorContext
  inputType?: "text" | "number" | "date"
}) {
  const [draft, setDraft] = React.useState(context.initialText ?? context.text)
  const inputRef = React.useRef<HTMLInputElement>(null)
  useRegistersEditor(context, () => context.parse(draft))

  React.useLayoutEffect(() => {
    const input = inputRef.current
    if (!input) {
      return
    }
    input.focus({ preventScroll: true })
    if (input.type === "text") {
      input.setSelectionRange(input.value.length, input.value.length)
    }
  }, [])

  return (
    <input
      ref={inputRef}
      data-grid-editor
      type={inputType}
      value={draft}
      aria-label={`Edit ${formatCellRef({ row: context.rowIndex, col: context.colIndex })}`}
      className={cn(
        "absolute inset-0 size-full min-w-0 bg-background px-2 text-sm outline-none",
        context.column.type === "number" && "text-right tabular-nums"
      )}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => context.commit(context.parse(draft), "none")}
      onKeyDown={(event) => {
        event.stopPropagation()
        const move = keyMove(event)
        if (move) {
          event.preventDefault()
          context.commit(context.parse(draft), move)
        } else if (event.key === "Escape") {
          event.preventDefault()
          context.cancel()
        }
      }}
    />
  )
}

function SelectEditor({ context }: { context: DataGridEditorContext }) {
  const options = context.column.options ?? []
  const [index, setIndex] = React.useState(() => {
    const typed = context.initialText?.toLowerCase()
    if (typed) {
      const match = options.findIndex((option) =>
        (option.label ?? option.value).toLowerCase().startsWith(typed)
      )
      if (match >= 0) {
        return match
      }
    }
    return Math.max(
      0,
      options.findIndex((option) => option.value === context.value)
    )
  })
  const listRef = React.useRef<HTMLDivElement>(null)
  useRegistersEditor(context, () => context.value)

  React.useLayoutEffect(() => {
    listRef.current?.focus({ preventScroll: true })
  }, [])

  const current = options.find((option) => option.value === context.value)
  return (
    <>
      {current ? (
        <Badge tone={current.tone ?? "quiet"} className="truncate">
          {current.label ?? current.value}
        </Badge>
      ) : null}
      <div
        ref={listRef}
        data-grid-editor
        role="listbox"
        tabIndex={-1}
        aria-label={context.column.label ?? "Options"}
        aria-activedescendant={
          options[index] ? `${context.column.id}-option-${index}` : undefined
        }
        className="absolute top-full left-0 z-50 mt-1 flex max-h-56 min-w-full flex-col overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none"
        onBlur={() => context.cancel()}
        onKeyDown={(event) => {
          event.stopPropagation()
          const move = keyMove(event)
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault()
            const step = event.key === "ArrowDown" ? 1 : -1
            setIndex((current) =>
              Math.min(options.length - 1, Math.max(0, current + step))
            )
          } else if (move) {
            event.preventDefault()
            context.commit(options[index]?.value ?? context.value, move)
          } else if (event.key === "Escape") {
            event.preventDefault()
            context.cancel()
          } else if (event.key === "Delete" || event.key === "Backspace") {
            event.preventDefault()
            context.commit(null, "none")
          } else if (event.key.length === 1) {
            const typed = event.key.toLowerCase()
            const match = options.findIndex((option) =>
              (option.label ?? option.value).toLowerCase().startsWith(typed)
            )
            if (match >= 0) {
              setIndex(match)
            }
          }
        }}
      >
        {options.length === 0 ? (
          <p className="px-2 py-1.5 text-xs text-muted-foreground">
            No options
          </p>
        ) : null}
        {options.map((option, at) => (
          <button
            key={option.value}
            id={`${context.column.id}-option-${at}`}
            type="button"
            role="option"
            tabIndex={-1}
            aria-selected={at === index}
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-1 text-left text-sm",
              at === index && "bg-accent text-accent-foreground"
            )}
            onPointerEnter={() => setIndex(at)}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => context.commit(option.value, "none")}
          >
            <CheckIcon
              aria-hidden
              className={cn(
                "size-3.5 shrink-0",
                option.value !== context.value && "invisible"
              )}
            />
            <Badge tone={option.tone ?? "quiet"}>
              {option.label ?? option.value}
            </Badge>
          </button>
        ))}
      </div>
    </>
  )
}

const TRUE_TEXT = /^(true|yes|y|1|x|on|✓)$/i
const utcDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
})

function parsesDate(text: string): CellValue {
  const trimmed = text.trim()
  if (trimmed === "") {
    return null
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed
  }
  const time = Date.parse(trimmed)
  if (Number.isNaN(time)) {
    return trimmed
  }
  const local = new Date(time)
  return new Date(
    Date.UTC(local.getFullYear(), local.getMonth(), local.getDate())
  )
    .toISOString()
    .slice(0, 10)
}

/** The built-in cell types. Spread them into `cellTypes` to add your own. */
export const dataGridCellTypes: Record<string, DataGridCellType> = {
  text: {
    format: formatsPlain,
    parse: (text) => text,
  },
  number: {
    align: "end",
    format: formatsPlain,
    parse: (text) => {
      const trimmed = text.trim().replace(/,/g, "")
      if (trimmed === "") {
        return null
      }
      const number = Number(trimmed)
      return Number.isFinite(number) ? number : text
    },
    render: ({ value }) =>
      typeof value === "number" ? (
        <span className="truncate tabular-nums">
          {value.toLocaleString("en-US", { maximumFractionDigits: 10 })}
        </span>
      ) : (
        <span className="truncate">{formatsPlain(value)}</span>
      ),
    edit: (context) => <TextEditor context={context} />,
  },
  checkbox: {
    fitWidth: () => 40,
    align: "center",
    edit: false,
    toggle: (value) => !value,
    format: (value) => (value ? "TRUE" : "FALSE"),
    parse: (text) => TRUE_TEXT.test(text.trim()),
    render: ({ value, readOnly, setValue, column }) => (
      <Checkbox
        tabIndex={-1}
        checked={Boolean(value)}
        disabled={readOnly}
        aria-label={column.label ?? "Toggle"}
        onChange={(event) => setValue(event.target.checked)}
      />
    ),
  },
  select: {
    // Badge: text-xs medium, px-2 and a 1px border.
    fitWidth: ({ text, measure }) => measure(text, 12, 500) + 18 + CELL_CHROME,
    format: (value, column) => {
      const option = column.options?.find((item) => item.value === value)
      return option?.label ?? formatsPlain(value)
    },
    parse: (text, column) => {
      const lower = text.trim().toLowerCase()
      if (lower === "") {
        return null
      }
      const option = column.options?.find(
        (item) =>
          item.value.toLowerCase() === lower ||
          item.label?.toLowerCase() === lower
      )
      return option?.value ?? text
    },
    render: ({ value, column }) => {
      if (isEmptyValue(value)) {
        return null
      }
      const option = column.options?.find((item) => item.value === value)
      return (
        <Badge tone={option?.tone ?? "quiet"} className="truncate">
          {option?.label ?? String(value)}
        </Badge>
      )
    },
    edit: (context) => <SelectEditor context={context} />,
  },
  date: {
    fitWidth: ({ value, text, measure }) =>
      measure(
        typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
          ? utcDate.format(new Date(`${value}T00:00:00Z`))
          : text
      ) + CELL_CHROME,
    format: formatsPlain,
    parse: parsesDate,
    render: ({ value }) => {
      if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return <span className="truncate">{formatsPlain(value)}</span>
      }
      return (
        <span className="truncate tabular-nums">
          {utcDate.format(new Date(`${value}T00:00:00Z`))}
        </span>
      )
    },
    edit: (context) => <TextEditor context={context} inputType="date" />,
  },
}

// ---------------------------------------------------------------------------
// Layout: prefix sums per axis so a 100k-row grid finds its window with a
// binary search instead of walking every row.

type Axis = {
  count: number
  sizes: Float64Array
  /** Offset inside the item's zone (frozen or scrolling), or -1 when hidden. */
  offsets: Float64Array
  frozenCount: number
  frozen: number[]
  scroll: number[]
  scrollStarts: number[]
  frozenSize: number
  scrollSize: number
  /** Visible indices in order: the frozen ones, then the scrolling ones. */
  visible: number[]
  /** Index → position in `visible`, or -1 when hidden. */
  visiblePos: Int32Array
}

function buildAxis<T extends { hidden?: boolean }>(
  items: T[],
  sizeOf: (item: T, index: number) => number,
  frozenCount: number,
  excluded?: Uint8Array | null
): Axis {
  const count = items.length
  const sizes = new Float64Array(count)
  const offsets = new Float64Array(count).fill(-1)
  const visiblePos = new Int32Array(count).fill(-1)
  const frozen: number[] = []
  const scroll: number[] = []
  const scrollStarts: number[] = []
  const pinned = Math.min(Math.max(frozenCount, 0), count)
  let frozenSize = 0
  let scrollSize = 0
  items.forEach((item, index) => {
    sizes[index] = sizeOf(item, index)
    if (item.hidden || excluded?.[index]) {
      return
    }
    if (index < pinned) {
      offsets[index] = frozenSize
      frozenSize += sizes[index]
      frozen.push(index)
    } else {
      offsets[index] = scrollSize
      scrollStarts.push(scrollSize)
      scrollSize += sizes[index]
      scroll.push(index)
    }
  })
  const visible = [...frozen, ...scroll]
  visible.forEach((index, position) => {
    visiblePos[index] = position
  })
  return {
    count,
    sizes,
    offsets,
    frozenCount: pinned,
    frozen,
    scroll,
    scrollStarts,
    frozenSize,
    scrollSize,
    visible,
    visiblePos,
  }
}

/** Scrolling items that overlap [start, start + length), plus overscan. */
function windowOf(axis: Axis, start: number, length: number, overscan: number) {
  const { scrollStarts, scroll, sizes } = axis
  let low = 0
  let high = scrollStarts.length
  while (low < high) {
    const middle = (low + high) >> 1
    if (scrollStarts[middle] + sizes[scroll[middle]] <= start) {
      low = middle + 1
    } else {
      high = middle
    }
  }
  let last = low
  while (last < scrollStarts.length && scrollStarts[last] < start + length) {
    last += 1
  }
  return scroll.slice(
    Math.max(0, low - overscan),
    Math.min(scroll.length, last + overscan)
  )
}

function firstVisibleIn(axis: Axis, from: number, to: number) {
  for (let index = from; index <= to; index += 1) {
    if (axis.visiblePos[index] >= 0) {
      return index
    }
  }
  return -1
}

function lastVisibleIn(axis: Axis, from: number, to: number) {
  for (let index = to; index >= from; index -= 1) {
    if (axis.visiblePos[index] >= 0) {
      return index
    }
  }
  return -1
}

/** Position in `visible` of `index`, or of the nearest visible item after (then before) it. */
function nearestVisiblePos(axis: Axis, index: number) {
  if (axis.visible.length === 0) {
    return -1
  }
  for (let at = index; at < axis.count; at += 1) {
    if (axis.visiblePos[at] >= 0) {
      return axis.visiblePos[at]
    }
  }
  for (let at = index - 1; at >= 0; at -= 1) {
    if (axis.visiblePos[at] >= 0) {
      return axis.visiblePos[at]
    }
  }
  return -1
}

/** Ctrl+arrow: jump to the edge of the current block of filled cells, or to the next one. */
function jumpPos(
  visible: number[],
  from: number,
  step: 1 | -1,
  filled: (index: number) => boolean
) {
  const inside = (position: number) =>
    position >= 0 && position < visible.length
  let position = from
  if (!inside(position + step)) {
    return position
  }
  if (filled(visible[position]) && filled(visible[position + step])) {
    while (inside(position + step) && filled(visible[position + step])) {
      position += step
    }
    return position
  }
  position += step
  while (inside(position + step) && !filled(visible[position])) {
    position += step
  }
  return position
}

// ---------------------------------------------------------------------------
// Selection

type SelectionMode = "cells" | "rows" | "cols" | "all"
type Selection = { anchor: CellRef; focus: CellRef; mode: SelectionMode }

function clampIndex(value: number, count: number) {
  return Math.min(Math.max(value, 0), Math.max(count - 1, 0))
}

function clampRef(ref: CellRef, rows: number, cols: number): CellRef {
  return { row: clampIndex(ref.row, rows), col: clampIndex(ref.col, cols) }
}

function selectionRange(
  selection: Selection,
  rows: number,
  cols: number
): GridRange {
  const range = normalizeRange(selection.anchor, selection.focus)
  if (selection.mode === "rows" || selection.mode === "all") {
    range.left = 0
    range.right = cols - 1
  }
  if (selection.mode === "cols" || selection.mode === "all") {
    range.top = 0
    range.bottom = rows - 1
  }
  return range
}

function sameRef(a: CellRef, b: CellRef) {
  return a.row === b.row && a.col === b.col
}

function sameSelection(a: Selection, b: Selection) {
  return (
    a.mode === b.mode &&
    sameRef(a.anchor, b.anchor) &&
    sameRef(a.focus, b.focus)
  )
}

function sameRange(a: GridRange | null, b: GridRange | null) {
  if (a === null || b === null) {
    return a === b
  }
  return (
    a.top === b.top &&
    a.left === b.left &&
    a.bottom === b.bottom &&
    a.right === b.right
  )
}

function rangeSelection(range: GridRange): Selection {
  return {
    anchor: { row: range.top, col: range.left },
    focus: { row: range.bottom, col: range.right },
    mode: "cells",
  }
}

function indicesOf(from: number, to: number) {
  return Array.from({ length: to - from + 1 }, (_, at) => from + at)
}

const EDGE_TOP = 1
const EDGE_RIGHT = 2
const EDGE_BOTTOM = 4
const EDGE_LEFT = 8

function edgeShadows(edges: number, color: string) {
  const parts: string[] = []
  if (edges & EDGE_TOP) parts.push(`inset 0 1px 0 0 ${color}`)
  if (edges & EDGE_BOTTOM) parts.push(`inset 0 -1px 0 0 ${color}`)
  if (edges & EDGE_LEFT) parts.push(`inset 1px 0 0 0 ${color}`)
  if (edges & EDGE_RIGHT) parts.push(`inset -1px 0 0 0 ${color}`)
  return parts
}

// ---------------------------------------------------------------------------
// Stable handlers: memoized cells get one object whose methods always call
// the latest render's closures.

type Handler = (...args: never[]) => unknown

function useStableHandlers<T extends Record<string, Handler>>(handlers: T): T {
  const ref = React.useRef(handlers)
  React.useLayoutEffect(() => {
    ref.current = handlers
  })
  const [stable] = React.useState(() => {
    const proxy = {} as Record<string, Handler>
    for (const key of Object.keys(handlers)) {
      proxy[key] = (...args: never[]) => ref.current[key](...args)
    }
    return proxy as T
  })
  return stable
}

type Axis2 = "row" | "col"

type GridActions = {
  cellPointerDown: (event: React.PointerEvent, row: number, col: number) => void
  cellDoubleClick: (row: number, col: number) => void
  cellContextMenu: (event: React.MouseEvent, row: number, col: number) => void
  fillPointerDown: (event: React.PointerEvent) => void
  setCellValue: (row: number, col: number, value: CellValue) => void
  commitEdit: (value: CellValue, move?: DataGridEditMove) => void
  cancelEdit: () => void
  registerEditor: (save: (() => void) | null) => void
  headerPointerDown: (
    event: React.PointerEvent,
    axis: Axis2,
    index: number
  ) => void
  headerDoubleClick: (axis: Axis2, index: number) => void
  headerContextMenu: (
    event: React.MouseEvent,
    axis: Axis2,
    index: number
  ) => void
  resizePointerDown: (
    event: React.PointerEvent,
    axis: Axis2,
    index: number
  ) => void
  resizeReset: (axis: Axis2, index: number) => void
  insertAfter: (axis: Axis2, index: number) => void
  unhideNear: (axis: Axis2, index: number, side: "before" | "after") => void
  finishRename: (axis: Axis2, index: number, label: string | null) => void
  headerClick: (event: React.MouseEvent, axis: Axis2, index: number) => void
  filterOptions: (index: number) => FilterOptions
  applyFilter: (index: number, filter: GridFilter | null) => void
  sortColumn: (index: number, direction: SortDirection | null) => void
  focusGrid: () => void
}

type FilterOptions = {
  name: string
  filter: GridFilter | null
  values: { key: string; label: string }[]
  sections: FilterSections
  /** This column's current sort, if the rows are sorted by it. */
  sorted: SortDirection | null
}

type FilterSections = {
  sort: boolean
  /** Operators to offer; empty hides the condition section. */
  conditions: GridConditionOp[]
  values: boolean
}

/** Merges the grid's filter menu defaults with a column's own settings. */
function resolvesFilterSections(
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

function hasFilterSections(sections: FilterSections) {
  return sections.sort || sections.conditions.length > 0 || sections.values
}

// ---------------------------------------------------------------------------
// Cells and headers

type GridCellProps = {
  gridId: string
  rowIndex: number
  colIndex: number
  row: GridRow
  column: GridColumn
  value: CellValue
  type: DataGridCellType
  x: number
  y: number
  width: number
  height: number
  inRange: boolean
  active: boolean
  rangeEdges: number
  inFill: boolean
  fillEdges: number
  handle: boolean
  editing: boolean
  initialText: string | null
  readOnly: boolean
  ruleStyle: GridStyle | null
  actions: GridActions
}

const ALIGN_CLASS = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
} as const

/** Inline CSS for a rule style. Keeps the selection tint on top of a rule background. */
function ruleCss(
  style: GridStyle | null,
  tinted: boolean
): React.CSSProperties {
  if (!style) {
    return {}
  }
  const css: React.CSSProperties = { ...(style.css as React.CSSProperties) }
  if (style.background) {
    const background = resolveGridColor(style.background, "background")
    css.background = tinted
      ? `linear-gradient(var(--grid-tint), var(--grid-tint)), ${background}`
      : background
  }
  if (style.color) css.color = resolveGridColor(style.color, "text")
  if (style.bold) css.fontWeight = 600
  if (style.italic) css.fontStyle = "italic"
  if (style.fontSize) css.fontSize = style.fontSize
  const lines = [
    style.underline && "underline",
    style.strike && "line-through",
  ].filter(Boolean)
  if (lines.length > 0) css.textDecorationLine = lines.join(" ")
  return css
}

const GridCell = React.memo(function GridCell({
  gridId,
  rowIndex,
  colIndex,
  row,
  column,
  value,
  type,
  x,
  y,
  width,
  height,
  inRange,
  active,
  rangeEdges,
  inFill,
  fillEdges,
  handle,
  editing,
  initialText,
  readOnly,
  ruleStyle,
  actions,
}: GridCellProps) {
  const context: DataGridCellContext = {
    value,
    column,
    row,
    rowIndex,
    colIndex,
    active,
    readOnly,
    setValue: (next) => actions.setCellValue(rowIndex, colIndex, next),
  }
  const shadows = [
    ...(active ? ["inset 0 0 0 2px var(--grid-accent)"] : []),
    ...edgeShadows(rangeEdges, "var(--grid-accent)"),
    ...edgeShadows(fillEdges, "var(--grid-fill-edge)"),
    ...(ruleStyle?.border
      ? [`inset 0 0 0 1px ${resolveGridColor(ruleStyle.border, "text")}`]
      : []),
  ]
  const align = ruleStyle?.align ?? type.align

  let content: React.ReactNode
  if (editing && type.edit !== false) {
    const editorContext: DataGridEditorContext = {
      ...context,
      initialText,
      text: (type.format ?? formatsPlain)(value, column),
      parse: (text) => (type.parse ? type.parse(text, column) : text),
      commit: actions.commitEdit,
      cancel: actions.cancelEdit,
      register: actions.registerEditor,
    }
    content = type.edit ? (
      type.edit(editorContext)
    ) : (
      <TextEditor context={editorContext} />
    )
  } else if (type.render) {
    content = type.render(context)
  } else {
    content = (
      <span className="truncate">
        {(type.format ?? formatsPlain)(value, column)}
      </span>
    )
  }

  return (
    <div
      role="gridcell"
      id={active ? `${gridId}-active` : undefined}
      aria-colindex={colIndex + 2}
      aria-selected={inRange}
      aria-readonly={readOnly || undefined}
      data-grid-row={rowIndex}
      data-grid-col={colIndex}
      data-active={active || undefined}
      className={cn(
        "absolute flex min-w-0 items-center border-r border-b border-border px-2 text-sm",
        align && ALIGN_CLASS[align],
        inRange && !active && "bg-(--grid-tint)",
        inFill && "bg-(--grid-tint)",
        editing || handle ? "z-10 overflow-visible" : "overflow-hidden",
        editing && "bg-background",
        ruleStyle?.className
      )}
      style={{
        ...ruleCss(ruleStyle, (inRange && !active) || inFill),
        left: x,
        top: y,
        width,
        height,
        boxShadow: shadows.length > 0 ? shadows.join(", ") : undefined,
      }}
      onPointerDown={(event) =>
        actions.cellPointerDown(event, rowIndex, colIndex)
      }
      onDoubleClick={() => actions.cellDoubleClick(rowIndex, colIndex)}
      onContextMenu={(event) =>
        actions.cellContextMenu(event, rowIndex, colIndex)
      }
    >
      {content}
      {handle ? (
        <span
          aria-hidden
          data-grid-fill-handle
          className="absolute -right-1 -bottom-1 z-10 size-2 cursor-crosshair border border-background bg-(--grid-accent)"
          onPointerDown={actions.fillPointerDown}
        />
      ) : null}
    </div>
  )
})

type HeaderMode = "coordinates" | "labels" | "both"
type HeaderState = "none" | "partial" | "full"

type HeaderCellProps = {
  axis: Axis2
  index: number
  x: number
  y: number
  width: number
  height: number
  label: string | undefined
  mode: HeaderMode
  state: HeaderState
  hiddenBefore: boolean
  hiddenAfter: boolean
  renaming: boolean
  editable: boolean
  sortDirection: SortDirection | null
  sortIndicator: DataGridSortIndicator
  filterable: boolean
  filterActive: boolean
  actions: GridActions
}

const CONDITION_OPTIONS: {
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

const VALUE_LIST_LIMIT = 300

function parsesConditionInput(text: string): CellValue {
  const trimmed = text.trim()
  if (trimmed === "") {
    return null
  }
  return /^-?\d+(\.\d+)?$/.test(trimmed) ? Number(trimmed) : trimmed
}

function FilterPanel({
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

function stopsEvent(event: React.SyntheticEvent) {
  event.stopPropagation()
}

function HeaderFilter({
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

const HeaderCell = React.memo(function HeaderCell({
  axis,
  index,
  x,
  y,
  width,
  height,
  label,
  mode,
  state,
  hiddenBefore,
  hiddenAfter,
  renaming,
  editable,
  sortDirection,
  sortIndicator,
  filterable,
  filterActive,
  actions,
}: HeaderCellProps) {
  const coordinate = axis === "col" ? columnLetter(index) : String(index + 1)
  const isCol = axis === "col"
  const UnhideIcon = isCol ? ChevronsLeftRightIcon : ChevronsUpDownIcon
  const noun = isCol ? "column" : "row"

  return (
    <div
      role={isCol ? "columnheader" : "rowheader"}
      aria-colindex={isCol ? index + 2 : 1}
      aria-selected={state !== "none"}
      data-grid-row={isCol ? -1 : index}
      data-grid-col={isCol ? index : -1}
      className={cn(
        "group/header absolute flex min-w-0 items-center gap-1.5 border-r border-b border-border bg-muted/60 px-2 text-xs text-muted-foreground select-none",
        mode === "coordinates" && "justify-center",
        filterable && "pr-9",
        state === "partial" && "bg-(--grid-tint) text-foreground",
        state === "full" &&
          "bg-(--grid-tint-strong) font-medium text-foreground"
      )}
      style={{ left: x, top: y, width, height }}
      onPointerDown={(event) => actions.headerPointerDown(event, axis, index)}
      onClick={(event) => actions.headerClick(event, axis, index)}
      onDoubleClick={() => actions.headerDoubleClick(axis, index)}
      onContextMenu={(event) => actions.headerContextMenu(event, axis, index)}
    >
      {renaming ? (
        <input
          data-grid-editor
          autoFocus
          defaultValue={label ?? ""}
          aria-label={`Rename ${noun} ${coordinate}`}
          className="h-6 min-w-0 flex-1 rounded-sm bg-background px-1 text-xs text-foreground ring-1 ring-(--grid-accent) outline-none"
          onPointerDown={(event) => event.stopPropagation()}
          onBlur={(event) =>
            actions.finishRename(axis, index, event.currentTarget.value)
          }
          onKeyDown={(event) => {
            event.stopPropagation()
            if (event.key === "Enter") {
              actions.finishRename(axis, index, event.currentTarget.value)
            } else if (event.key === "Escape") {
              actions.finishRename(axis, index, null)
            }
          }}
        />
      ) : (
        <>
          {mode !== "labels" || !label ? (
            <span
              className={cn(
                "shrink-0 tabular-nums",
                mode === "both" && label && "font-mono opacity-60"
              )}
            >
              {coordinate}
            </span>
          ) : null}
          {mode !== "coordinates" && label ? (
            <span className="truncate">{label}</span>
          ) : null}
          {sortDirection && sortIndicator === "arrow" ? (
            <span
              aria-label={
                sortDirection === "asc"
                  ? "Sorted ascending"
                  : "Sorted descending"
              }
              className="shrink-0 text-foreground"
            >
              {sortDirection === "asc" ? (
                <ArrowUpIcon aria-hidden className="size-3" />
              ) : (
                <ArrowDownIcon aria-hidden className="size-3" />
              )}
            </span>
          ) : null}
        </>
      )}

      {sortDirection && sortIndicator === "chevron" ? (
        <span
          role="img"
          aria-label={
            sortDirection === "asc" ? "Sorted ascending" : "Sorted descending"
          }
          className={cn(
            "pointer-events-none absolute left-1/2 flex -translate-x-1/2 text-foreground",
            sortDirection === "asc" ? "-top-0.5" : "-bottom-0.5"
          )}
        >
          {sortDirection === "asc" ? (
            <ChevronUpIcon aria-hidden className="size-3.5" strokeWidth={2.5} />
          ) : (
            <ChevronDownIcon
              aria-hidden
              className="size-3.5"
              strokeWidth={2.5}
            />
          )}
        </span>
      ) : null}

      {filterable && !renaming ? (
        <HeaderFilter index={index} active={filterActive} actions={actions} />
      ) : null}

      {hiddenBefore ? (
        <button
          type="button"
          aria-label={`Show hidden ${noun}s`}
          className={cn(
            "absolute z-20 flex items-center justify-center rounded-sm border border-border bg-background text-muted-foreground hover:text-foreground",
            isCol
              ? "top-1/2 -left-1.5 h-4 w-3 -translate-y-1/2"
              : "-top-1.5 left-1/2 h-3 w-4 -translate-x-1/2"
          )}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => actions.unhideNear(axis, index, "before")}
        >
          <UnhideIcon aria-hidden className="size-2.5" />
        </button>
      ) : null}
      {hiddenAfter ? (
        <button
          type="button"
          aria-label={`Show hidden ${noun}s`}
          className={cn(
            "absolute z-20 flex items-center justify-center rounded-sm border border-border bg-background text-muted-foreground hover:text-foreground",
            isCol
              ? "top-1/2 -right-1.5 h-4 w-3 -translate-y-1/2"
              : "-bottom-1.5 left-1/2 h-3 w-4 -translate-x-1/2"
          )}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => actions.unhideNear(axis, index, "after")}
        >
          <UnhideIcon aria-hidden className="size-2.5" />
        </button>
      ) : null}

      {editable ? (
        // The edge between this header and the next: drag to resize, and the
        // insert button shows only while the pointer is on this edge.
        <div
          className={cn(
            "group/edge absolute z-10",
            isCol
              ? "top-0 -right-1.5 h-full w-3"
              : "-bottom-1.5 left-0 h-3 w-full"
          )}
          // Clicks here resize or insert; they must not reach the header and sort it.
          onClick={stopsEvent}
          onDoubleClick={stopsEvent}
        >
          <span
            aria-hidden
            className={cn(
              "absolute inset-0 group-hover/edge:bg-(--grid-tint-strong)",
              isCol ? "cursor-col-resize" : "cursor-row-resize"
            )}
            onPointerDown={(event) =>
              actions.resizePointerDown(event, axis, index)
            }
            onDoubleClick={(event) => {
              event.stopPropagation()
              actions.resizeReset(axis, index)
            }}
          />
          <button
            type="button"
            tabIndex={-1}
            aria-label={
              isCol
                ? `Insert column after ${coordinate}`
                : `Insert row after ${coordinate}`
            }
            className="absolute top-1/2 left-1/2 hidden size-3.5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-(--grid-accent) text-primary-foreground shadow-sm group-hover/edge:flex"
            onPointerDown={(event) => event.stopPropagation()}
            onDoubleClick={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation()
              actions.insertAfter(axis, index)
            }}
          >
            <PlusIcon aria-hidden className="size-3" />
          </button>
        </div>
      ) : null}
    </div>
  )
})

// ---------------------------------------------------------------------------
// Context menu parts

const menuItemClass =
  "relative flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 data-[tone=danger]:text-destructive data-[tone=danger]:focus:bg-destructive/10"

const menuContentClass =
  "z-50 max-h-(--radix-context-menu-content-available-height) min-w-48 overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10"

function MenuItem({
  children,
  shortcut,
  tone,
  disabled,
  onSelect,
}: {
  children: React.ReactNode
  shortcut?: string
  tone?: "danger"
  disabled?: boolean
  onSelect: () => void
}) {
  return (
    <ContextMenuPrimitive.Item
      className={menuItemClass}
      data-tone={tone}
      disabled={disabled}
      onSelect={onSelect}
    >
      <span className="flex-1">{children}</span>
      {shortcut ? (
        <span className="ml-4 text-xs tracking-wide text-muted-foreground">
          {shortcut}
        </span>
      ) : null}
    </ContextMenuPrimitive.Item>
  )
}

function MenuSub({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <ContextMenuPrimitive.Sub>
      <ContextMenuPrimitive.SubTrigger
        className={cn(menuItemClass, "data-[state=open]:bg-accent")}
      >
        <span className="flex-1">{label}</span>
        <ChevronRightIcon
          aria-hidden
          className="size-3.5 text-muted-foreground"
        />
      </ContextMenuPrimitive.SubTrigger>
      <ContextMenuPrimitive.Portal>
        <ContextMenuPrimitive.SubContent className={menuContentClass}>
          {children}
        </ContextMenuPrimitive.SubContent>
      </ContextMenuPrimitive.Portal>
    </ContextMenuPrimitive.Sub>
  )
}

function MenuSeparator() {
  return (
    <ContextMenuPrimitive.Separator className="-mx-1 my-1 h-px bg-border" />
  )
}

/** "Row 3 holds 4 cells of data…" / "Columns B, C hold 120 cells of data…" */
function describesPendingDelete({
  axis,
  indices,
  filled,
}: {
  axis: Axis2
  indices: number[]
  filled: number
}) {
  const names = indices
    .slice(0, 6)
    .map((index) => (axis === "row" ? String(index + 1) : columnLetter(index)))
    .join(", ")
  const more = indices.length > 6 ? ` and ${indices.length - 6} more` : ""
  const noun = axis === "row" ? "Row" : "Column"
  const subject =
    indices.length === 1
      ? `${noun} ${names} holds`
      : `${noun}s ${names}${more} hold`
  const cells =
    filled === 1 ? "1 cell" : `${filled.toLocaleString("en-US")} cells`
  return `${subject} ${cells} of data, counting any hidden by filters. You can undo with Ctrl+Z.`
}

// ---------------------------------------------------------------------------
// Grid

export type DataGridHandle = {
  getData: () => GridData
  /** Applies changes made elsewhere (another user, the server). Skips undo and `onChanges`. */
  applyChanges: (changes: GridChange[]) => void
  /** Replaces all data and clears undo history. */
  reset: (data: GridData) => void
  undo: () => void
  redo: () => void
  /** Applies changes as a user edit: undoable and sent to `onChanges` and the adapter. */
  edit: (changes: GridChange[]) => void
  /** Selects a range, e.g. `"B3:D7"`. */
  select: (range: GridRange | string) => void
  focus: () => void
  /** Sizes columns to their content (all visible columns when no ids are given). Undoable. */
  autoFit: (columnIds?: string[]) => void
}

export type DataGridSortIndicator = "arrow" | "chevron"

export type DataGridChangeSource = "edit" | "undo" | "redo"

export type DataGridProps = Omit<
  React.ComponentProps<"div">,
  "defaultValue" | "onChange" | "ref"
> & {
  value?: GridData
  defaultValue?: GridData
  /** Every local change with the data after it. Pair with `value` to control the grid. */
  onValueChange?: (data: GridData, changes: GridChange[]) => void
  /** Change batches for syncing: user edits, undo, and redo. Remote changes are not echoed. */
  onChanges?: (
    changes: GridChange[],
    data: GridData,
    source: DataGridChangeSource
  ) => void
  /** Load, save, and live-update hooks for a backend. Keep the object stable (module scope or useMemo). */
  adapter?: DataGridAdapter
  /** Extra or replacement cell types, keyed by `column.type`. */
  cellTypes?: Record<string, DataGridCellType>
  /** What column headers show: letters, labels, or both. */
  headerMode?: HeaderMode
  /** What row headers show: numbers, labels, or both. */
  rowHeaderMode?: HeaderMode
  rowHeight?: number
  columnWidth?: number
  headerHeight?: number
  rowHeaderWidth?: number
  /** Height of the scrolling area. */
  height?: number | string
  readOnly?: boolean
  /** Shows the Name Box and value bar above the grid. */
  showNameBox?: boolean
  /**
   * Shows a round button at the top right of the Name Box bar that sizes
   * columns to their content: the selected columns, or all of them.
   */
  autoFitButton?: boolean
  /**
   * Asks before deleting rows or columns that hold data. Empty ones are
   * deleted right away. Defaults to true.
   */
  confirmDelete?: boolean
  /** Widest a column gets from auto-fit. */
  maxFitWidth?: number
  /** Extra controls at the right of the Name Box bar. */
  toolbar?: React.ReactNode
  /** Clicking a column header sorts by it (A → Z, then Z → A). Columns can override with `sortable`. */
  sortable?: boolean
  /**
   * How a sorted header shows its direction: `arrow` beside the label, or
   * `chevron` in the header's top (ascending) or bottom (descending) gutter.
   * Unsorted headers show nothing either way.
   */
  sortIndicator?: DataGridSortIndicator
  /**
   * Conditional formatting from your app, applied after `data.rules`. Plain
   * JSON: load it from a backend and pass it straight through.
   */
  formatRules?: GridFormatRule[]
  /**
   * Default sections for every filter menu: `sort`, `conditions` (or a list of
   * operators), and `values`. A column's `filterable: { ... }` overrides these.
   */
  filterMenu?: GridFilterMenu
  /** Makes ids for new rows and columns, e.g. to match database keys. */
  createId?: (kind: "row" | "col") => string
  /** Rows and columns rendered beyond the viewport on each side. */
  overscan?: number
  label?: string
  ref?: React.Ref<DataGridHandle>
}

type Editing = { row: number; col: number; initialText: string | null }
type MenuTarget = { kind: "cell" | "row" | "col"; row: number; col: number }
type ResizeDraft = { axis: Axis2; index: number; size: number }
type Drag =
  | { kind: "cells" | "rows" | "cols"; x: number; y: number; frame: number }
  | {
      kind: "fill"
      x: number
      y: number
      frame: number
      source: GridRange
      target: GridRange | null
    }
  | {
      kind: "resize"
      axis: Axis2
      index: number
      origin: number
      start: number
      size: number
    }

type HistoryEntry = {
  forward: GridChange[]
  inverse: GridChange[]
  before: Selection
  after: Selection
}

const HISTORY_LIMIT = 200
const DEFAULT_DATA_COLUMNS = 8
const DEFAULT_DATA_ROWS = 40

export function DataGrid({
  value,
  defaultValue,
  onValueChange,
  onChanges,
  adapter,
  cellTypes: customTypes,
  headerMode = "coordinates",
  rowHeaderMode = "coordinates",
  rowHeight = 32,
  columnWidth = 120,
  headerHeight = 32,
  rowHeaderWidth,
  height = 420,
  readOnly = false,
  showNameBox = true,
  toolbar,
  autoFitButton = false,
  confirmDelete = true,
  maxFitWidth = 480,
  sortable = false,
  sortIndicator = "arrow",
  formatRules,
  filterMenu,
  createId,
  overscan = 3,
  label = "Data grid",
  className,
  style,
  ref,
  ...props
}: DataGridProps) {
  const gridId = React.useId()
  const controlled = value !== undefined
  const [inner, setInner] = React.useState<GridData>(
    () =>
      defaultValue ??
      createGridData({ columns: DEFAULT_DATA_COLUMNS, rows: DEFAULT_DATA_ROWS })
  )
  const data = value ?? inner
  const dataRef = React.useRef(data)
  React.useLayoutEffect(() => {
    dataRef.current = data
  }, [data])

  const types = React.useMemo(
    () => ({ ...dataGridCellTypes, ...customTypes }),
    [customTypes]
  )
  const typeOf = (column: GridColumn) =>
    types[column.type ?? "text"] ?? types.text

  const [selection, setSelection] = React.useState<Selection>({
    anchor: { row: 0, col: 0 },
    focus: { row: 0, col: 0 },
    mode: "cells",
  })
  const [editing, setEditingState] = React.useState<Editing | null>(null)
  const editingRef = React.useRef<Editing | null>(null)
  const editorSaveRef = React.useRef<(() => void) | null>(null)
  const [fillTarget, setFillTarget] = React.useState<GridRange | null>(null)
  const [resize, setResize] = React.useState<ResizeDraft | null>(null)
  const [renaming, setRenaming] = React.useState<{
    axis: Axis2
    index: number
  } | null>(null)
  const [menuTarget, setMenuTarget] = React.useState<MenuTarget>({
    kind: "cell",
    row: 0,
    col: 0,
  })
  const [view, setView] = React.useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  })
  const [nameDraft, setNameDraft] = React.useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = React.useState<{
    axis: Axis2
    indices: number[]
    filled: number
  } | null>(null)
  const scrollerRef = React.useRef<HTMLDivElement>(null)
  const dragRef = React.useRef<Drag | null>(null)
  const historyRef = React.useRef<{
    undo: HistoryEntry[]
    redo: HistoryEntry[]
  }>({ undo: [], redo: [] })
  const frameRef = React.useRef(0)

  const rowCount = data.rows.length
  const colCount = data.columns.length
  const rowHeaderW =
    rowHeaderWidth ??
    (rowHeaderMode === "coordinates"
      ? Math.max(48, String(rowCount).length * 8 + 24)
      : 140)

  const filtered = React.useMemo(() => filteredOutRows(data), [data])
  const rowAxis = React.useMemo(
    () =>
      buildAxis(
        data.rows,
        (row, index) =>
          resize?.axis === "row" && resize.index === index
            ? resize.size
            : (row.height ?? rowHeight),
        data.frozen.rows,
        filtered
      ),
    [data.rows, data.frozen.rows, rowHeight, resize, filtered]
  )
  const rules = React.useMemo(
    () => [...(data.rules ?? []), ...(formatRules ?? [])],
    [data.rules, formatRules]
  )
  const resolveStyle = React.useMemo(
    () => createStyleResolver(data, rules),
    [data, rules]
  )
  // Hands memoized cells the same style object while the style is unchanged.
  const [styleCache] = React.useState(() => new Map<string, GridStyle>())
  const colAxis = React.useMemo(
    () =>
      buildAxis(
        data.columns,
        (column, index) =>
          resize?.axis === "col" && resize.index === index
            ? resize.size
            : (column.width ?? columnWidth),
        data.frozen.cols
      ),
    [data.columns, data.frozen.cols, columnWidth, resize]
  )

  const leftW = rowHeaderW + colAxis.frozenSize
  const topH = headerHeight + rowAxis.frozenSize
  const viewportH = view.height || (typeof height === "number" ? height : 600)
  const viewportW = view.width || 1200
  const bodyRows = windowOf(rowAxis, view.top, viewportH - topH, overscan)
  const bodyCols = windowOf(colAxis, view.left, viewportW - leftW, overscan)

  const sel: Selection = {
    mode: selection.mode,
    anchor: clampRef(selection.anchor, rowCount, colCount),
    focus: clampRef(selection.focus, rowCount, colCount),
  }
  const range = selectionRange(sel, rowCount, colCount)
  const active = sel.anchor
  const multi = range.top !== range.bottom || range.left !== range.right
  const edgeTop = firstVisibleIn(rowAxis, range.top, range.bottom)
  const edgeBottom = lastVisibleIn(rowAxis, range.top, range.bottom)
  const edgeLeft = firstVisibleIn(colAxis, range.left, range.right)
  const edgeRight = lastVisibleIn(colAxis, range.left, range.right)
  const fill = fillTarget
  const fillTop = fill ? firstVisibleIn(rowAxis, fill.top, fill.bottom) : -1
  const fillBottom = fill ? lastVisibleIn(rowAxis, fill.top, fill.bottom) : -1
  const fillLeft = fill ? firstVisibleIn(colAxis, fill.left, fill.right) : -1
  const fillRightEdge = fill
    ? lastVisibleIn(colAxis, fill.left, fill.right)
    : -1

  // -------------------------------------------------------------------------
  // Viewport tracking

  React.useLayoutEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) {
      return
    }
    const measure = () =>
      setView((current) => {
        const next = {
          top: scroller.scrollTop,
          left: scroller.scrollLeft,
          width: scroller.clientWidth,
          height: scroller.clientHeight,
        }
        return current.top === next.top &&
          current.left === next.left &&
          current.width === next.width &&
          current.height === next.height
          ? current
          : next
      })
    const observer = new ResizeObserver(measure)
    observer.observe(scroller)
    const onScroll = () => {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = requestAnimationFrame(measure)
    }
    scroller.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      observer.disconnect()
      scroller.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(frameRef.current)
    }
  }, [])

  // -------------------------------------------------------------------------
  // Handlers. All of them read the latest render through useStableHandlers.

  const handlers = useStableHandlers({
    setEditing(next: Editing | null) {
      editingRef.current = next
      setEditingState(next)
    },

    focusGrid() {
      scrollerRef.current?.focus({ preventScroll: true })
    },

    emit(changes: GridChange[], next: GridData, source: DataGridChangeSource) {
      onValueChange?.(next, changes)
      onChanges?.(changes, next, source)
      void adapter?.save?.(changes, next)
    },

    replaceData(next: GridData) {
      dataRef.current = next
      if (!controlled) {
        setInner(next)
      }
    },

    commit(changes: GridChange[], nextSelection?: Selection) {
      if (changes.length === 0) {
        return
      }
      const before = sel
      const { data: next, inverse } = applyGridChanges(dataRef.current, changes)
      handlers.replaceData(next)
      const history = historyRef.current
      history.undo.push({
        forward: changes,
        inverse,
        before,
        after: nextSelection ?? before,
      })
      if (history.undo.length > HISTORY_LIMIT) {
        history.undo.shift()
      }
      history.redo = []
      if (nextSelection) {
        setSelection(nextSelection)
      }
      handlers.emit(changes, next, "edit")
    },

    undo() {
      const entry = historyRef.current.undo.pop()
      if (!entry) {
        return
      }
      handlers.setEditing(null)
      const { data: next } = applyGridChanges(dataRef.current, entry.inverse)
      handlers.replaceData(next)
      historyRef.current.redo.push(entry)
      setSelection(entry.before)
      handlers.emit(entry.inverse, next, "undo")
    },

    redo() {
      const entry = historyRef.current.redo.pop()
      if (!entry) {
        return
      }
      handlers.setEditing(null)
      const { data: next } = applyGridChanges(dataRef.current, entry.forward)
      handlers.replaceData(next)
      historyRef.current.undo.push(entry)
      setSelection(entry.after)
      handlers.emit(entry.forward, next, "redo")
    },

    applyRemote(changes: GridChange[]) {
      if (changes.length === 0) {
        return
      }
      const { data: next } = applyGridChanges(dataRef.current, changes)
      handlers.replaceData(next)
      onValueChange?.(next, changes)
    },

    reset(next: GridData) {
      historyRef.current = { undo: [], redo: [] }
      handlers.setEditing(null)
      handlers.replaceData(next)
      onValueChange?.(next, [])
    },

    finishEditing() {
      editorSaveRef.current?.()
    },

    scrollIntoView(cell: CellRef) {
      const scroller = scrollerRef.current
      if (!scroller) {
        return
      }
      if (cell.row >= rowAxis.frozenCount && rowAxis.offsets[cell.row] >= 0) {
        const y = rowAxis.offsets[cell.row]
        const size = rowAxis.sizes[cell.row]
        const room = scroller.clientHeight - topH
        if (y < scroller.scrollTop) {
          scroller.scrollTop = y
        } else if (y + size > scroller.scrollTop + room) {
          scroller.scrollTop = y + size - room
        }
      }
      if (cell.col >= colAxis.frozenCount && colAxis.offsets[cell.col] >= 0) {
        const x = colAxis.offsets[cell.col]
        const size = colAxis.sizes[cell.col]
        const room = scroller.clientWidth - leftW
        if (x < scroller.scrollLeft) {
          scroller.scrollLeft = x
        } else if (x + size > scroller.scrollLeft + room) {
          scroller.scrollLeft = x + size - room
        }
      }
    },

    selectRange(next: GridRange | string) {
      const parsed = typeof next === "string" ? parseRange(next) : next
      if (!parsed) {
        return
      }
      const clamped = {
        top: clampIndex(parsed.top, rowCount),
        bottom: clampIndex(parsed.bottom, rowCount),
        left: clampIndex(parsed.left, colCount),
        right: clampIndex(parsed.right, colCount),
      }
      handlers.finishEditing()
      setSelection(rangeSelection(clamped))
      handlers.scrollIntoView({ row: clamped.top, col: clamped.left })
    },

    startEdit(initialText: string | null) {
      if (readOnly) {
        return false
      }
      const column = data.columns[active.col]
      const type = column ? typeOf(column) : undefined
      if (
        !column ||
        column.readOnly ||
        !type ||
        type.edit === false ||
        type.toggle
      ) {
        return false
      }
      handlers.scrollIntoView(active)
      handlers.setEditing({ row: active.row, col: active.col, initialText })
      return true
    },

    toggleRange() {
      if (readOnly) {
        return false
      }
      const column = data.columns[active.col]
      const type = column ? typeOf(column) : undefined
      if (!type?.toggle) {
        return false
      }
      const next = type.toggle(
        readCell(dataRef.current, active.row, active.col)
      )
      const entries: { row: number; col: number; value: CellValue }[] = []
      for (let row = range.top; row <= range.bottom; row += 1) {
        if (rowAxis.visiblePos[row] < 0) {
          continue
        }
        for (let col = range.left; col <= range.right; col += 1) {
          const cellColumn = data.columns[col]
          if (cellColumn && typeOf(cellColumn).toggle) {
            entries.push({ row, col, value: next })
          }
        }
      }
      handlers.commit(setCellValues(dataRef.current, entries))
      return true
    },

    move(rowStep: number, colStep: number, extend: boolean, jump: boolean) {
      const from = extend ? sel.focus : sel.anchor
      const current = dataRef.current
      let rowPos = nearestVisiblePos(rowAxis, from.row)
      let colPos = nearestVisiblePos(colAxis, from.col)
      if (rowPos < 0 || colPos < 0) {
        return
      }
      if (rowStep !== 0) {
        rowPos = jump
          ? jumpPos(
              rowAxis.visible,
              rowPos,
              rowStep > 0 ? 1 : -1,
              (row) => !isEmptyValue(readCell(current, row, from.col))
            )
          : Math.min(Math.max(rowPos + rowStep, 0), rowAxis.visible.length - 1)
      }
      if (colStep !== 0) {
        colPos = jump
          ? jumpPos(
              colAxis.visible,
              colPos,
              colStep > 0 ? 1 : -1,
              (col) => !isEmptyValue(readCell(current, from.row, col))
            )
          : Math.min(Math.max(colPos + colStep, 0), colAxis.visible.length - 1)
      }
      const next = {
        row: rowAxis.visible[rowPos],
        col: colAxis.visible[colPos],
      }
      setSelection(
        extend
          ? { ...sel, focus: next }
          : { anchor: next, focus: next, mode: "cells" }
      )
      handlers.scrollIntoView(next)
    },

    moveAfterEdit(move: DataGridEditMove) {
      if (move === "none") {
        return
      }
      const steps: Record<
        Exclude<DataGridEditMove, "none">,
        [number, number]
      > = {
        down: [1, 0],
        up: [-1, 0],
        right: [0, 1],
        left: [0, -1],
      }
      const [rowStep, colStep] = steps[move]
      handlers.move(rowStep, colStep, false, false)
    },

    pageRows(step: 1 | -1) {
      const scroller = scrollerRef.current
      const rowsPerPage = Math.max(
        1,
        Math.floor(((scroller?.clientHeight ?? 400) - topH) / rowHeight) - 1
      )
      handlers.move(step * rowsPerPage, 0, false, false)
    },

    copyText() {
      const current = dataRef.current
      return rangeToText(current, range, (cellValue, column) =>
        (typeOf(column).format ?? formatsPlain)(cellValue, column)
      )
    },

    pasteFrom(text: string) {
      if (readOnly) {
        return
      }
      handlers.commit(
        pasteText(dataRef.current, range, text, (field, column) => {
          const type = typeOf(column)
          return type.parse ? type.parse(field, column) : field
        })
      )
    },

    // Structure ---------------------------------------------------------------

    insertRowsAt(index: number, count: number) {
      const current = dataRef.current
      const changes = insertRows(current, index, count, createId)
      handlers.commit(changes, {
        anchor: { row: index, col: 0 },
        focus: { row: index + count - 1, col: colCount - 1 },
        mode: "rows",
      })
    },

    insertColsAt(index: number, count: number) {
      const current = dataRef.current
      const changes = insertColumns(current, index, count, createId)
      handlers.commit(changes, {
        anchor: { row: 0, col: index },
        focus: { row: rowCount - 1, col: index + count - 1 },
        mode: "cols",
      })
    },

    /** Deletes right away when the targets are empty, otherwise asks first. */
    requestDelete(axis: Axis2, indices: number[]) {
      if (readOnly || indices.length === 0) {
        return
      }
      const current = dataRef.current
      let filled = 0
      if (axis === "row") {
        const columnIds = new Set(current.columns.map((column) => column.id))
        for (const index of indices) {
          const record = current.cells[current.rows[index]?.id]
          for (const [colId, cellValue] of Object.entries(record ?? {})) {
            if (columnIds.has(colId) && !isEmptyValue(cellValue)) filled += 1
          }
        }
      } else {
        const ids = indices.map((index) => current.columns[index]?.id)
        for (const row of current.rows) {
          const record = current.cells[row.id]
          if (!record) continue
          for (const id of ids) {
            if (id && !isEmptyValue(record[id] ?? null)) filled += 1
          }
        }
      }
      if (filled === 0 || !confirmDelete) {
        handlers.deleteNow(axis, indices)
      } else {
        setPendingDelete({ axis, indices, filled })
      }
    },

    deleteNow(axis: Axis2, indices: number[]) {
      if (axis === "row") {
        handlers.deleteRowsAt(indices)
      } else {
        handlers.deleteColsAt(indices)
      }
    },

    deleteRowsAt(indices: number[]) {
      const top = Math.min(...indices)
      handlers.commit(deleteRows(dataRef.current, indices), {
        anchor: { row: top, col: sel.anchor.col },
        focus: { row: top, col: sel.anchor.col },
        mode: "cells",
      })
    },

    deleteColsAt(indices: number[]) {
      const left = Math.min(...indices)
      handlers.commit(deleteColumns(dataRef.current, indices), {
        anchor: { row: sel.anchor.row, col: left },
        focus: { row: sel.anchor.row, col: left },
        mode: "cells",
      })
    },

    duplicateRowsAt(indices: number[]) {
      const at = Math.max(...indices) + 1
      handlers.commit(duplicateRows(dataRef.current, indices, createId), {
        anchor: { row: at, col: 0 },
        focus: { row: at + indices.length - 1, col: colCount - 1 },
        mode: "rows",
      })
    },

    duplicateColsAt(indices: number[]) {
      const at = Math.max(...indices) + 1
      handlers.commit(duplicateColumns(dataRef.current, indices, createId), {
        anchor: { row: 0, col: at },
        focus: { row: rowCount - 1, col: at + indices.length - 1 },
        mode: "cols",
      })
    },

    // Pointer -----------------------------------------------------------------

    beginDrag(drag: Drag) {
      dragRef.current = drag
      window.addEventListener("pointermove", handlers.dragMove)
      window.addEventListener("pointerup", handlers.dragEnd)
      window.addEventListener("pointercancel", handlers.dragEnd)
      if (drag.kind !== "resize") {
        drag.frame = requestAnimationFrame(handlers.dragTick)
      }
    },

    hitTest(clientX: number, clientY: number): CellRef | null {
      const scroller = scrollerRef.current
      if (!scroller) {
        return null
      }
      const rect = scroller.getBoundingClientRect()
      const x = Math.min(
        Math.max(clientX, rect.left + 1),
        rect.left + scroller.clientWidth - 2
      )
      const y = Math.min(
        Math.max(clientY, rect.top + 1),
        rect.top + scroller.clientHeight - 2
      )
      const hit = document
        .elementFromPoint(x, y)
        ?.closest<HTMLElement>("[data-grid-row]")
      if (!hit || !scroller.contains(hit)) {
        return null
      }
      return {
        row: Number(hit.dataset.gridRow),
        col: Number(hit.dataset.gridCol),
      }
    },

    dragMove(event: PointerEvent) {
      const drag = dragRef.current
      if (!drag) {
        return
      }
      if (drag.kind === "resize") {
        const delta =
          (drag.axis === "col" ? event.clientX : event.clientY) - drag.origin
        drag.size = Math.max(
          drag.axis === "col" ? 36 : 20,
          Math.round(drag.start + delta)
        )
        setResize({ axis: drag.axis, index: drag.index, size: drag.size })
        return
      }
      drag.x = event.clientX
      drag.y = event.clientY
    },

    dragTick() {
      const drag = dragRef.current
      const scroller = scrollerRef.current
      if (!drag || drag.kind === "resize" || !scroller) {
        return
      }
      const rect = scroller.getBoundingClientRect()
      const edge = 24
      const speed = (distance: number) => Math.min(40, Math.ceil(distance / 3))
      const right = rect.left + scroller.clientWidth
      const bottom = rect.top + scroller.clientHeight
      if (drag.x > right - edge)
        scroller.scrollLeft += speed(drag.x - (right - edge))
      else if (drag.x < rect.left)
        scroller.scrollLeft -= speed(rect.left - drag.x)
      if (drag.y > bottom - edge)
        scroller.scrollTop += speed(drag.y - (bottom - edge))
      else if (drag.y < rect.top) scroller.scrollTop -= speed(rect.top - drag.y)

      const hit = handlers.hitTest(drag.x, drag.y)
      if (hit) {
        if (drag.kind === "fill") {
          const cell = {
            row: hit.row < 0 ? drag.source.bottom : hit.row,
            col: hit.col < 0 ? drag.source.right : hit.col,
          }
          const target = rangeContains(drag.source, cell.row, cell.col)
            ? null
            : {
                top: Math.min(drag.source.top, cell.row),
                bottom: Math.max(drag.source.bottom, cell.row),
                left: Math.min(drag.source.left, cell.col),
                right: Math.max(drag.source.right, cell.col),
              }
          drag.target = target
          setFillTarget((current) =>
            sameRange(current, target) ? current : target
          )
        } else {
          setSelection((current) => {
            const focus = {
              row:
                drag.kind === "cols" || hit.row < 0
                  ? current.focus.row
                  : hit.row,
              col:
                drag.kind === "rows" || hit.col < 0
                  ? current.focus.col
                  : hit.col,
            }
            const next = { ...current, focus }
            return sameSelection(current, next) ? current : next
          })
        }
      }
      drag.frame = requestAnimationFrame(handlers.dragTick)
    },

    dragEnd(event: PointerEvent) {
      const drag = dragRef.current
      dragRef.current = null
      window.removeEventListener("pointermove", handlers.dragMove)
      window.removeEventListener("pointerup", handlers.dragEnd)
      window.removeEventListener("pointercancel", handlers.dragEnd)
      if (!drag) {
        return
      }
      if (drag.kind === "resize") {
        setResize(null)
        const current = dataRef.current
        if (drag.axis === "col") {
          const column = current.columns[drag.index]
          if (column && column.width !== drag.size) {
            handlers.commit([
              {
                type: "patchColumns",
                patches: [{ id: column.id, patch: { width: drag.size } }],
              },
            ])
          }
        } else {
          const row = current.rows[drag.index]
          if (row && row.height !== drag.size) {
            handlers.commit([
              {
                type: "patchRows",
                patches: [{ id: row.id, patch: { height: drag.size } }],
              },
            ])
          }
        }
        return
      }
      cancelAnimationFrame(drag.frame)
      if (drag.kind === "fill") {
        setFillTarget(null)
        const { source, target } = drag
        if (target && event.type === "pointerup") {
          const copy = event.ctrlKey || event.metaKey || event.altKey
          const anchor = {
            row: source.top === target.top ? target.top : target.bottom,
            col: source.left === target.left ? target.left : target.right,
          }
          const focus = {
            row: anchor.row === target.top ? target.bottom : target.top,
            col: anchor.col === target.left ? target.right : target.left,
          }
          handlers.commit(
            fillRange(
              dataRef.current,
              source,
              target,
              copy ? "copy" : "series"
            ),
            {
              anchor,
              focus,
              mode: "cells",
            }
          )
        }
      }
    },

    // Cell and header events ----------------------------------------------------

    cellPointerDown(event: React.PointerEvent, row: number, col: number) {
      const current = editingRef.current
      if (current && current.row === row && current.col === col) {
        return
      }
      if (event.button !== 0) {
        return
      }
      handlers.finishEditing()
      handlers.focusGrid()
      const cell = { row, col }
      setSelection(
        event.shiftKey
          ? {
              anchor: sel.anchor,
              focus: cell,
              mode: sel.mode === "all" ? "cells" : sel.mode,
            }
          : { anchor: cell, focus: cell, mode: "cells" }
      )
      handlers.beginDrag({
        kind: "cells",
        x: event.clientX,
        y: event.clientY,
        frame: 0,
      })
    },

    cellDoubleClick(row: number, col: number) {
      if (sameRef(active, { row, col })) {
        handlers.startEdit(null)
      }
    },

    cellContextMenu(_event: React.MouseEvent, row: number, col: number) {
      handlers.finishEditing()
      if (!rangeContains(range, row, col)) {
        setSelection({
          anchor: { row, col },
          focus: { row, col },
          mode: "cells",
        })
      }
      setMenuTarget({ kind: "cell", row, col })
    },

    fillPointerDown(event: React.PointerEvent) {
      if (event.button !== 0 || readOnly) {
        return
      }
      event.stopPropagation()
      handlers.finishEditing()
      handlers.focusGrid()
      handlers.beginDrag({
        kind: "fill",
        x: event.clientX,
        y: event.clientY,
        frame: 0,
        source: range,
        target: null,
      })
    },

    setCellValue(row: number, col: number, next: CellValue) {
      if (readOnly) {
        return
      }
      handlers.commit(
        setCellValues(dataRef.current, [{ row, col, value: next }])
      )
    },

    commitEdit(next: CellValue, move: DataGridEditMove = "none") {
      const current = editingRef.current
      if (!current) {
        return
      }
      handlers.setEditing(null)
      handlers.commit(
        setCellValues(dataRef.current, [
          { row: current.row, col: current.col, value: next },
        ])
      )
      handlers.focusGrid()
      handlers.moveAfterEdit(move)
    },

    cancelEdit() {
      if (!editingRef.current) {
        return
      }
      handlers.setEditing(null)
      handlers.focusGrid()
    },

    registerEditor(save: (() => void) | null) {
      editorSaveRef.current = save
    },

    headerPointerDown(event: React.PointerEvent, axis: Axis2, index: number) {
      if (event.button !== 0) {
        return
      }
      handlers.finishEditing()
      handlers.focusGrid()
      if (axis === "col") {
        const anchorCol =
          event.shiftKey && sel.mode === "cols" ? sel.anchor.col : index
        const firstRow = rowAxis.visible[0] ?? 0
        setSelection({
          anchor: { row: firstRow, col: anchorCol },
          focus: { row: firstRow, col: index },
          mode: "cols",
        })
        handlers.beginDrag({
          kind: "cols",
          x: event.clientX,
          y: event.clientY,
          frame: 0,
        })
      } else {
        const anchorRow =
          event.shiftKey && sel.mode === "rows" ? sel.anchor.row : index
        const firstCol = colAxis.visible[0] ?? 0
        setSelection({
          anchor: { row: anchorRow, col: firstCol },
          focus: { row: index, col: firstCol },
          mode: "rows",
        })
        handlers.beginDrag({
          kind: "rows",
          x: event.clientX,
          y: event.clientY,
          frame: 0,
        })
      }
    },

    columnSortable(index: number) {
      const column = data.columns[index]
      return !readOnly && Boolean(column) && (column.sortable ?? sortable)
    },

    headerClick(event: React.MouseEvent, axis: Axis2, index: number) {
      if (
        axis !== "col" ||
        event.shiftKey ||
        event.ctrlKey ||
        event.metaKey ||
        renaming ||
        !handlers.columnSortable(index)
      ) {
        return
      }
      const current = dataRef.current
      const column = current.columns[index]
      // A → Z, then Z → A, then back to the unsorted order.
      const sorted =
        current.sort?.colId === column.id ? current.sort.direction : null
      const next: SortDirection | null =
        sorted === null ? "asc" : sorted === "asc" ? "desc" : null
      handlers.sortColumn(index, next)
    },

    sortColumn(index: number, direction: SortDirection | null) {
      if (readOnly) {
        return
      }
      const current = dataRef.current
      handlers.commit(
        direction ? sortRows(current, index, direction) : clearSort(current)
      )
    },

    filterOptions(index: number): FilterOptions {
      const current = dataRef.current
      const column = current.columns[index]
      const type = typeOf(column)
      const others = filteredOutRows(current, column.id)
      const seen = new Map<string, CellValue>()
      current.rows.forEach((row, at) => {
        if (at < current.frozen.rows || row.hidden || others?.[at]) {
          return
        }
        const cellValue = current.cells[row.id]?.[column.id] ?? null
        const key = filterKey(cellValue)
        if (!seen.has(key)) {
          seen.set(key, cellValue)
        }
      })
      for (const key of current.filters?.[column.id]?.values ?? []) {
        if (!seen.has(key)) {
          seen.set(key, key === "" ? null : key)
        }
      }
      const values = [...seen.entries()]
        .sort(([a], [b]) =>
          a === ""
            ? 1
            : b === ""
              ? -1
              : a.localeCompare(b, undefined, { numeric: true })
        )
        .map(([key, cellValue]) => ({
          key,
          label:
            key === ""
              ? "(Blanks)"
              : (type.format ?? formatsPlain)(cellValue, column),
        }))
      return {
        name: column.label ?? columnLetter(index),
        filter: current.filters?.[column.id] ?? null,
        values,
        sections: resolvesFilterSections(filterMenu, column, readOnly),
        sorted:
          current.sort?.colId === column.id ? current.sort.direction : null,
      }
    },

    applyFilter(index: number, filter: GridFilter | null) {
      const column = dataRef.current.columns[index]
      if (column) {
        handlers.commit(setFilter(dataRef.current, column.id, filter))
      }
    },

    headerDoubleClick(axis: Axis2, index: number) {
      if (axis === "col" && handlers.columnSortable(index)) {
        return
      }
      if (!readOnly) {
        setRenaming({ axis, index })
      }
    },

    headerContextMenu(_event: React.MouseEvent, axis: Axis2, index: number) {
      handlers.finishEditing()
      if (axis === "col") {
        const inside =
          sel.mode === "cols" && index >= range.left && index <= range.right
        if (!inside) {
          const firstRow = rowAxis.visible[0] ?? 0
          setSelection({
            anchor: { row: firstRow, col: index },
            focus: { row: firstRow, col: index },
            mode: "cols",
          })
        }
        setMenuTarget({ kind: "col", row: 0, col: index })
      } else {
        const inside =
          sel.mode === "rows" && index >= range.top && index <= range.bottom
        if (!inside) {
          const firstCol = colAxis.visible[0] ?? 0
          setSelection({
            anchor: { row: index, col: firstCol },
            focus: { row: index, col: firstCol },
            mode: "rows",
          })
        }
        setMenuTarget({ kind: "row", row: index, col: 0 })
      }
    },

    resizePointerDown(event: React.PointerEvent, axis: Axis2, index: number) {
      if (event.button !== 0) {
        return
      }
      event.stopPropagation()
      event.preventDefault()
      const start = axis === "col" ? colAxis.sizes[index] : rowAxis.sizes[index]
      handlers.beginDrag({
        kind: "resize",
        axis,
        index,
        origin: axis === "col" ? event.clientX : event.clientY,
        start,
        size: start,
      })
    },

    resizeReset(axis: Axis2, index: number) {
      const current = dataRef.current
      if (axis === "col") {
        // Like Excel: double-clicking a column edge fits the column (or the
        // selected columns, when this one is among them) to its content.
        const selected =
          sel.mode === "cols" && index >= range.left && index <= range.right
        handlers.fitColumns(
          selected ? indicesOf(range.left, range.right) : [index]
        )
      } else {
        const row = current.rows[index]
        if (row?.height !== undefined) {
          handlers.commit([
            {
              type: "patchRows",
              patches: [{ id: row.id, patch: { height: undefined } }],
            },
          ])
        }
      }
    },

    fitColumns(indices?: number[]) {
      const scroller = scrollerRef.current
      if (readOnly || !scroller) {
        return
      }
      const current = dataRef.current
      const targets = (
        indices ?? current.columns.map((_, index) => index)
      ).filter(
        (index) => current.columns[index] && !current.columns[index].hidden
      )
      const context = document.createElement("canvas").getContext("2d")
      if (!context || targets.length === 0) {
        return
      }
      const family = getComputedStyle(scroller).fontFamily
      const measure = (text: string, size = 14, weight = 400) => {
        context.font = `${weight} ${size}px ${family}`
        return Math.ceil(context.measureText(text).width)
      }
      // Measuring every row of a 100k-row grid is slow, so only the longest
      // few texts per column are measured.
      const SAMPLE = 40
      const patches = targets.flatMap((col) => {
        const column = current.columns[col]
        const type = typeOf(column)
        const format = type.format ?? formatsPlain
        let longest: { text: string; value: CellValue }[] = []
        for (const row of current.rows) {
          const cellValue = current.cells[row.id]?.[column.id] ?? null
          if (isEmptyValue(cellValue)) {
            continue
          }
          longest.push({ text: format(cellValue, column), value: cellValue })
          if (longest.length > SAMPLE * 2) {
            longest.sort((a, b) => b.text.length - a.text.length)
            longest = longest.slice(0, SAMPLE)
          }
        }
        // Empty columns keep their width instead of collapsing to the minimum.
        if (longest.length === 0) {
          return []
        }
        let content = 0
        for (const { text, value: cellValue } of longest) {
          const width = type.fitWidth
            ? type.fitWidth({ value: cellValue, column, text, measure })
            : measure(text) + CELL_CHROME
          content = Math.max(content, width)
        }
        const letter = columnLetter(col)
        const headerText =
          headerMode === "coordinates"
            ? letter
            : headerMode === "labels"
              ? (column.label ?? letter)
              : column.label
                ? `${letter}  ${column.label}`
                : letter
        const header =
          measure(headerText, 12, 500) +
          CELL_CHROME +
          (column.filterable ? 28 : 0) +
          ((column.sortable ?? sortable) && sortIndicator === "arrow" ? 18 : 0)
        const width = Math.min(maxFitWidth, Math.max(40, content, header))
        return column.width === width
          ? []
          : [{ id: column.id, patch: { width } }]
      })
      if (patches.length > 0) {
        handlers.commit([{ type: "patchColumns", patches }])
      }
    },

    insertAfter(axis: Axis2, index: number) {
      if (axis === "col") {
        handlers.insertColsAt(index + 1, 1)
      } else {
        handlers.insertRowsAt(index + 1, 1)
      }
      handlers.focusGrid()
    },

    unhideNear(axis: Axis2, index: number, side: "before" | "after") {
      const items: { hidden?: boolean }[] =
        axis === "col" ? dataRef.current.columns : dataRef.current.rows
      const hidden: number[] = []
      const step = side === "before" ? -1 : 1
      for (
        let at = index + step;
        at >= 0 && at < items.length && items[at].hidden;
        at += step
      ) {
        hidden.push(at)
      }
      const current = dataRef.current
      handlers.commit(
        axis === "col"
          ? setColumnsHidden(current, hidden, false)
          : setRowsHidden(current, hidden, false)
      )
    },

    finishRename(axis: Axis2, index: number, next: string | null) {
      setRenaming(null)
      handlers.focusGrid()
      if (next === null) {
        return
      }
      const current = dataRef.current
      const item = axis === "col" ? current.columns[index] : current.rows[index]
      const labelValue = next.trim() === "" ? undefined : next.trim()
      if (!item || item.label === labelValue) {
        return
      }
      handlers.commit([
        axis === "col"
          ? {
              type: "patchColumns",
              patches: [{ id: item.id, patch: { label: labelValue } }],
            }
          : {
              type: "patchRows",
              patches: [{ id: item.id, patch: { label: labelValue } }],
            },
      ])
    },

    // Keyboard and clipboard --------------------------------------------------

    keyDown(event: React.KeyboardEvent<HTMLDivElement>) {
      if (event.target !== event.currentTarget || editingRef.current) {
        return
      }
      const mod = event.ctrlKey || event.metaKey
      const key = event.key
      const arrows: Record<string, [number, number]> = {
        ArrowDown: [1, 0],
        ArrowUp: [-1, 0],
        ArrowRight: [0, 1],
        ArrowLeft: [0, -1],
      }
      const handled = () => event.preventDefault()

      if (arrows[key]) {
        handled()
        const [rowStep, colStep] = arrows[key]
        handlers.move(rowStep, colStep, event.shiftKey, mod)
        return
      }
      if (mod) {
        const lower = key.toLowerCase()
        if (lower === "z") {
          handled()
          if (event.shiftKey) handlers.redo()
          else handlers.undo()
        } else if (lower === "y") {
          handled()
          handlers.redo()
        } else if (lower === "a") {
          handled()
          setSelection({ anchor: sel.anchor, focus: sel.anchor, mode: "all" })
        } else if (lower === "d" && !readOnly) {
          handled()
          handlers.commit(fillDown(dataRef.current, range))
        } else if (lower === "r" && !readOnly) {
          handled()
          handlers.commit(fillRight(dataRef.current, range))
        } else if (key === " ") {
          handled()
          setSelection({ anchor: sel.anchor, focus: sel.focus, mode: "cols" })
        } else if (key === "Home") {
          handled()
          const first = {
            row: rowAxis.visible[0] ?? 0,
            col: colAxis.visible[0] ?? 0,
          }
          setSelection({ anchor: first, focus: first, mode: "cells" })
          handlers.scrollIntoView(first)
        } else if (key === "End") {
          handled()
          const last = {
            row: rowAxis.visible[rowAxis.visible.length - 1] ?? 0,
            col: colAxis.visible[colAxis.visible.length - 1] ?? 0,
          }
          setSelection({ anchor: last, focus: last, mode: "cells" })
          handlers.scrollIntoView(last)
        }
        return
      }
      switch (key) {
        case "Tab": {
          const colPos = colAxis.visiblePos[active.col]
          const edge = event.shiftKey
            ? colPos <= 0
            : colPos >= colAxis.visible.length - 1
          if (!edge) {
            handled()
            handlers.move(0, event.shiftKey ? -1 : 1, false, false)
          }
          return
        }
        case "Enter":
        case "F2":
          handled()
          if (!handlers.toggleRange()) {
            handlers.startEdit(null)
          }
          return
        case "Delete":
        case "Backspace":
          handled()
          if (!readOnly) {
            handlers.commit(clearRange(dataRef.current, range))
          }
          return
        case "Home":
        case "End": {
          handled()
          const col =
            key === "Home"
              ? colAxis.visible[0]
              : colAxis.visible[colAxis.visible.length - 1]
          const next = { row: active.row, col: col ?? 0 }
          setSelection(
            event.shiftKey
              ? { ...sel, focus: next }
              : { anchor: next, focus: next, mode: "cells" }
          )
          handlers.scrollIntoView(next)
          return
        }
        case "PageDown":
        case "PageUp":
          handled()
          handlers.pageRows(key === "PageDown" ? 1 : -1)
          return
        case "Escape":
          setFillTarget(null)
          return
        case " ":
          if (event.shiftKey) {
            handled()
            setSelection({ anchor: sel.anchor, focus: sel.focus, mode: "rows" })
            return
          }
          if (handlers.toggleRange()) {
            handled()
            return
          }
          break
      }
      if (key.length === 1 && !event.altKey) {
        if (handlers.startEdit(key)) {
          handled()
        }
      }
    },

    copy(event: React.ClipboardEvent) {
      if (
        event.target !== event.currentTarget ||
        editingRef.current ||
        renaming
      ) {
        return
      }
      event.preventDefault()
      event.clipboardData.setData("text/plain", handlers.copyText())
    },

    cut(event: React.ClipboardEvent) {
      if (
        event.target !== event.currentTarget ||
        editingRef.current ||
        renaming
      ) {
        return
      }
      event.preventDefault()
      event.clipboardData.setData("text/plain", handlers.copyText())
      if (!readOnly) {
        handlers.commit(clearRange(dataRef.current, range))
      }
    },

    paste(event: React.ClipboardEvent) {
      if (
        event.target !== event.currentTarget ||
        editingRef.current ||
        renaming
      ) {
        return
      }
      event.preventDefault()
      handlers.pasteFrom(event.clipboardData.getData("text/plain"))
    },

    mouseDown(event: React.MouseEvent) {
      // Keep focus on the grid (and the editor open until we save it ourselves).
      const target = event.target as HTMLElement
      if (!target.closest("[data-grid-editor], button, input")) {
        event.preventDefault()
      }
    },
  })

  const actions = handlers as unknown as GridActions

  React.useImperativeHandle(
    ref,
    () => ({
      getData: () => dataRef.current,
      applyChanges: (changes) => handlers.applyRemote(changes),
      reset: (next) => handlers.reset(next),
      edit: (changes) => handlers.commit(changes),
      undo: () => handlers.undo(),
      redo: () => handlers.redo(),
      select: (next) => handlers.selectRange(next),
      focus: () => handlers.focusGrid(),
      autoFit: (columnIds) => {
        const current = dataRef.current
        handlers.fitColumns(
          columnIds
            ? current.columns.flatMap((column, index) =>
                columnIds.includes(column.id) ? [index] : []
              )
            : undefined
        )
      },
    }),
    [handlers]
  )

  React.useEffect(() => {
    if (!adapter?.load) {
      return
    }
    let alive = true
    void Promise.resolve(adapter.load()).then((loaded) => {
      if (alive && loaded) {
        handlers.reset(loaded)
      }
    })
    return () => {
      alive = false
    }
  }, [adapter, handlers])

  React.useEffect(
    () => adapter?.subscribe?.((changes) => handlers.applyRemote(changes)),
    [adapter, handlers]
  )

  React.useEffect(
    () => () => {
      const drag = dragRef.current
      if (drag && drag.kind !== "resize") {
        cancelAnimationFrame(drag.frame)
      }
      window.removeEventListener("pointermove", handlers.dragMove)
      window.removeEventListener("pointerup", handlers.dragEnd)
      window.removeEventListener("pointercancel", handlers.dragEnd)
    },
    [handlers]
  )

  // -------------------------------------------------------------------------
  // Rendering

  const bodyRowSet = new Set(bodyRows)
  const bodyColSet = new Set(bodyCols)
  const activeRendered =
    (active.row < rowAxis.frozenCount || bodyRowSet.has(active.row)) &&
    (active.col < colAxis.frozenCount || bodyColSet.has(active.col)) &&
    rowAxis.visiblePos[active.row] >= 0 &&
    colAxis.visiblePos[active.col] >= 0

  const handleRow = edgeBottom
  const handleCol = edgeRight
  const showHandle = !readOnly && !editing && handleRow >= 0 && handleCol >= 0

  function renderCell(row: number, col: number, x: number, y: number) {
    const rowData = data.rows[row]
    const column = data.columns[col]
    const inRange = rangeContains(range, row, col)
    const inFillArea =
      fill !== null && rangeContains(fill, row, col) && !inRange
    let rangeEdges = 0
    if (inRange && multi) {
      if (row === edgeTop) rangeEdges |= EDGE_TOP
      if (row === edgeBottom) rangeEdges |= EDGE_BOTTOM
      if (col === edgeLeft) rangeEdges |= EDGE_LEFT
      if (col === edgeRight) rangeEdges |= EDGE_RIGHT
    }
    let fillEdges = 0
    if (fill && rangeContains(fill, row, col)) {
      if (row === fillTop) fillEdges |= EDGE_TOP
      if (row === fillBottom) fillEdges |= EDGE_BOTTOM
      if (col === fillLeft) fillEdges |= EDGE_LEFT
      if (col === fillRightEdge) fillEdges |= EDGE_RIGHT
    }
    const isEditing =
      editing !== null && editing.row === row && editing.col === col
    const resolved = resolveStyle(row, col)
    let ruleStyle: GridStyle | null = null
    if (resolved) {
      const key = JSON.stringify(resolved)
      ruleStyle = styleCache.get(key) ?? resolved
      styleCache.set(key, ruleStyle)
    }
    return (
      <GridCell
        key={column.id}
        gridId={gridId}
        rowIndex={row}
        colIndex={col}
        row={rowData}
        column={column}
        value={data.cells[rowData.id]?.[column.id] ?? null}
        type={typeOf(column)}
        x={x}
        y={y}
        width={colAxis.sizes[col]}
        height={rowAxis.sizes[row]}
        inRange={inRange}
        active={row === active.row && col === active.col}
        rangeEdges={rangeEdges}
        inFill={inFillArea}
        fillEdges={fillEdges}
        handle={showHandle && row === handleRow && col === handleCol}
        editing={isEditing}
        initialText={isEditing ? editing.initialText : null}
        readOnly={readOnly || Boolean(column.readOnly)}
        ruleStyle={ruleStyle}
        actions={actions}
      />
    )
  }

  function renderRows(
    rows: number[],
    cols: number[],
    rowY: (row: number) => number,
    colX: (col: number) => number
  ) {
    return rows.map((row) => (
      <div
        key={data.rows[row].id}
        role="row"
        aria-rowindex={row + 2}
        className="contents"
      >
        {cols.map((col) => renderCell(row, col, colX(col), rowY(row)))}
      </div>
    ))
  }

  function headerState(axis: Axis2, index: number): HeaderState {
    const inside =
      axis === "col"
        ? index >= range.left && index <= range.right
        : index >= range.top && index <= range.bottom
    if (!inside) {
      return "none"
    }
    const full =
      sel.mode === "all" ||
      (axis === "col" ? sel.mode === "cols" : sel.mode === "rows")
    return full ? "full" : "partial"
  }

  function renderHeader(axis: Axis2, index: number, x: number, y: number) {
    const items: { hidden?: boolean; label?: string; id: string }[] =
      axis === "col" ? data.columns : data.rows
    const axisData = axis === "col" ? colAxis : rowAxis
    const lastVisible = axisData.visible[axisData.visible.length - 1]
    return (
      <HeaderCell
        key={items[index].id}
        axis={axis}
        index={index}
        x={x}
        y={y}
        width={axis === "col" ? colAxis.sizes[index] : rowHeaderW}
        height={axis === "col" ? headerHeight : rowAxis.sizes[index]}
        label={items[index].label}
        mode={axis === "col" ? headerMode : rowHeaderMode}
        state={headerState(axis, index)}
        hiddenBefore={index > 0 && Boolean(items[index - 1]?.hidden)}
        hiddenAfter={index === lastVisible && index < items.length - 1}
        renaming={
          renaming !== null &&
          renaming.axis === axis &&
          renaming.index === index
        }
        editable={!readOnly}
        sortIndicator={sortIndicator}
        sortDirection={
          axis === "col" && data.sort?.colId === items[index].id
            ? data.sort.direction
            : null
        }
        filterable={
          axis === "col" &&
          Boolean(data.columns[index].filterable) &&
          hasFilterSections(
            resolvesFilterSections(filterMenu, data.columns[index], readOnly)
          )
        }
        filterActive={
          axis === "col" && Boolean(data.filters?.[items[index].id])
        }
        actions={actions}
      />
    )
  }

  const frozenRowY = (row: number) => headerHeight + rowAxis.offsets[row]
  const scrollRowY = (row: number) => rowAxis.offsets[row]
  const frozenColX = (col: number) => rowHeaderW + colAxis.offsets[col]
  const scrollColX = (col: number) => colAxis.offsets[col]

  const activeColumn = data.columns[active.col]
  const activeValue = readCell(data, active.row, active.col)
  const activeText = activeColumn
    ? (typeOf(activeColumn).format ?? formatsPlain)(activeValue, activeColumn)
    : ""

  // Context menu --------------------------------------------------------------

  // Computed here, not through `handlers`: those run the previous render's closures.
  const rowTargets = indicesOf(range.top, range.bottom)
  const colTargets = indicesOf(range.left, range.right)
  const rowWord = rowTargets.length === 1 ? "row" : `${rowTargets.length} rows`
  const colWord =
    colTargets.length === 1 ? "column" : `${colTargets.length} columns`
  const hiddenRowsInRange = rowTargets.filter((row) => data.rows[row]?.hidden)
  const hiddenColsInRange = colTargets.filter(
    (col) => data.columns[col]?.hidden
  )
  const edit = !readOnly
  const commitNow = (changes: GridChange[]) => handlers.commit(changes)

  const clipboardItems = (
    <>
      <MenuItem
        shortcut="Ctrl+X"
        disabled={!edit}
        onSelect={() => {
          void navigator.clipboard?.writeText(handlers.copyText())
          commitNow(clearRange(dataRef.current, range))
        }}
      >
        Cut
      </MenuItem>
      <MenuItem
        shortcut="Ctrl+C"
        onSelect={() =>
          void navigator.clipboard?.writeText(handlers.copyText())
        }
      >
        Copy
      </MenuItem>
      <MenuItem
        shortcut="Ctrl+V"
        disabled={!edit}
        onSelect={() => {
          void navigator.clipboard
            ?.readText()
            .then((text) => handlers.pasteFrom(text))
            .catch(() => undefined)
        }}
      >
        Paste
      </MenuItem>
    </>
  )

  const freezeRowsItem = (
    <MenuItem
      disabled={!edit}
      onSelect={() =>
        commitNow(setFrozen(dataRef.current, { rows: range.bottom + 1 }))
      }
    >
      Freeze up to row {range.bottom + 1}
    </MenuItem>
  )
  const freezeColsItem = (
    <MenuItem
      disabled={!edit}
      onSelect={() =>
        commitNow(setFrozen(dataRef.current, { cols: range.right + 1 }))
      }
    >
      Freeze up to column {columnLetter(range.right)}
    </MenuItem>
  )
  const unfreezeItem = (
    <MenuItem
      disabled={!edit || (data.frozen.rows === 0 && data.frozen.cols === 0)}
      onSelect={() =>
        commitNow(setFrozen(dataRef.current, { rows: 0, cols: 0 }))
      }
    >
      Unfreeze
    </MenuItem>
  )

  let menu: React.ReactNode
  if (menuTarget.kind === "row") {
    menu = (
      <>
        <MenuItem
          disabled={!edit}
          onSelect={() => handlers.insertRowsAt(range.top, rowTargets.length)}
        >
          Insert {rowWord} above
        </MenuItem>
        <MenuItem
          disabled={!edit}
          onSelect={() =>
            handlers.insertRowsAt(range.bottom + 1, rowTargets.length)
          }
        >
          Insert {rowWord} below
        </MenuItem>
        <MenuItem
          disabled={!edit}
          onSelect={() => handlers.duplicateRowsAt(rowTargets)}
        >
          Duplicate {rowWord}
        </MenuItem>
        <MenuItem
          tone="danger"
          disabled={!edit || rowTargets.length >= rowCount}
          onSelect={() => handlers.requestDelete("row", rowTargets)}
        >
          Delete {rowWord}
        </MenuItem>
        <MenuSeparator />
        <MenuItem
          disabled={!edit}
          onSelect={() =>
            commitNow(setRowsHidden(dataRef.current, rowTargets, true))
          }
        >
          Hide {rowWord}
        </MenuItem>
        {hiddenRowsInRange.length > 0 ? (
          <MenuItem
            disabled={!edit}
            onSelect={() =>
              commitNow(
                setRowsHidden(dataRef.current, hiddenRowsInRange, false)
              )
            }
          >
            Unhide rows
          </MenuItem>
        ) : null}
        <MenuItem
          disabled={!edit}
          onSelect={() => setRenaming({ axis: "row", index: menuTarget.row })}
        >
          Rename row
        </MenuItem>
        <MenuSeparator />
        {freezeRowsItem}
        {unfreezeItem}
        <MenuSeparator />
        {clipboardItems}
      </>
    )
  } else if (menuTarget.kind === "col") {
    const targetColumn = data.columns[menuTarget.col]
    const activeFilters = Object.keys(data.filters ?? {})
    menu = (
      <>
        <MenuItem
          disabled={!edit}
          onSelect={() => handlers.sortColumn(menuTarget.col, "asc")}
        >
          Sort A → Z
        </MenuItem>
        <MenuItem
          disabled={!edit}
          onSelect={() => handlers.sortColumn(menuTarget.col, "desc")}
        >
          Sort Z → A
        </MenuItem>
        {data.sort ? (
          <MenuItem
            disabled={!edit}
            onSelect={() => handlers.sortColumn(menuTarget.col, null)}
          >
            Clear sort
          </MenuItem>
        ) : null}
        {targetColumn && data.filters?.[targetColumn.id] ? (
          <MenuItem
            disabled={!edit}
            onSelect={() => handlers.applyFilter(menuTarget.col, null)}
          >
            Clear filter
          </MenuItem>
        ) : null}
        {activeFilters.length > 1 ? (
          <MenuItem
            disabled={!edit}
            onSelect={() =>
              commitNow(
                activeFilters.map((colId) => ({
                  type: "setFilter" as const,
                  colId,
                  filter: null,
                }))
              )
            }
          >
            Clear all filters
          </MenuItem>
        ) : null}
        <MenuSeparator />
        <MenuItem
          disabled={!edit}
          onSelect={() => handlers.insertColsAt(range.left, colTargets.length)}
        >
          Insert {colWord} left
        </MenuItem>
        <MenuItem
          disabled={!edit}
          onSelect={() =>
            handlers.insertColsAt(range.right + 1, colTargets.length)
          }
        >
          Insert {colWord} right
        </MenuItem>
        <MenuItem
          disabled={!edit}
          onSelect={() => handlers.duplicateColsAt(colTargets)}
        >
          Duplicate {colWord}
        </MenuItem>
        <MenuItem
          tone="danger"
          disabled={!edit || colTargets.length >= colCount}
          onSelect={() => handlers.requestDelete("col", colTargets)}
        >
          Delete {colWord}
        </MenuItem>
        <MenuSeparator />
        <MenuItem
          disabled={!edit}
          onSelect={() =>
            commitNow(setColumnsHidden(dataRef.current, colTargets, true))
          }
        >
          Hide {colWord}
        </MenuItem>
        {hiddenColsInRange.length > 0 ? (
          <MenuItem
            disabled={!edit}
            onSelect={() =>
              commitNow(
                setColumnsHidden(dataRef.current, hiddenColsInRange, false)
              )
            }
          >
            Unhide columns
          </MenuItem>
        ) : null}
        <MenuItem
          disabled={!edit}
          onSelect={() => setRenaming({ axis: "col", index: menuTarget.col })}
        >
          Rename column
        </MenuItem>
        <MenuItem
          disabled={!edit}
          onSelect={() => handlers.fitColumns(colTargets)}
        >
          Fit {colWord} to content
        </MenuItem>
        <MenuSub label="Cell type">
          {Object.keys(types).map((key) => (
            <MenuItem
              key={key}
              disabled={!edit}
              onSelect={() =>
                commitNow([
                  {
                    type: "patchColumns",
                    patches: colTargets.map((col) => ({
                      id: data.columns[col].id,
                      patch: { type: key },
                    })),
                  },
                ])
              }
            >
              <span className="flex items-center gap-2">
                <CheckIcon
                  aria-hidden
                  className={cn(
                    "size-3.5",
                    (targetColumn?.type ?? "text") !== key && "invisible"
                  )}
                />
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </span>
            </MenuItem>
          ))}
        </MenuSub>
        <MenuSeparator />
        {freezeColsItem}
        {unfreezeItem}
        <MenuSeparator />
        {clipboardItems}
      </>
    )
  } else {
    menu = (
      <>
        {clipboardItems}
        <MenuSeparator />
        <MenuItem
          shortcut="Ctrl+D"
          disabled={!edit}
          onSelect={() => commitNow(fillDown(dataRef.current, range))}
        >
          {range.top === range.bottom ? "Copy cell above" : "Fill down"}
        </MenuItem>
        <MenuItem
          shortcut="Ctrl+R"
          disabled={!edit}
          onSelect={() => commitNow(fillRight(dataRef.current, range))}
        >
          {range.left === range.right ? "Copy cell to the left" : "Fill right"}
        </MenuItem>
        <MenuItem
          shortcut="Del"
          disabled={!edit}
          onSelect={() => commitNow(clearRange(dataRef.current, range))}
        >
          Clear
        </MenuItem>
        <MenuSeparator />
        <MenuSub label="Insert">
          <MenuItem
            disabled={!edit}
            onSelect={() => handlers.insertRowsAt(range.top, rowTargets.length)}
          >
            {rowWord === "row" ? "Row" : rowWord} above
          </MenuItem>
          <MenuItem
            disabled={!edit}
            onSelect={() =>
              handlers.insertRowsAt(range.bottom + 1, rowTargets.length)
            }
          >
            {rowWord === "row" ? "Row" : rowWord} below
          </MenuItem>
          <MenuItem
            disabled={!edit}
            onSelect={() =>
              handlers.insertColsAt(range.left, colTargets.length)
            }
          >
            {colWord === "column" ? "Column" : colWord} left
          </MenuItem>
          <MenuItem
            disabled={!edit}
            onSelect={() =>
              handlers.insertColsAt(range.right + 1, colTargets.length)
            }
          >
            {colWord === "column" ? "Column" : colWord} right
          </MenuItem>
        </MenuSub>
        <MenuSub label="Duplicate">
          <MenuItem
            disabled={!edit}
            onSelect={() => handlers.duplicateRowsAt(rowTargets)}
          >
            {rowWord === "row" ? "Row" : rowWord}
          </MenuItem>
          <MenuItem
            disabled={!edit}
            onSelect={() => handlers.duplicateColsAt(colTargets)}
          >
            {colWord === "column" ? "Column" : colWord}
          </MenuItem>
        </MenuSub>
        <MenuSub label="Delete">
          <MenuItem
            tone="danger"
            disabled={!edit || rowTargets.length >= rowCount}
            onSelect={() => handlers.requestDelete("row", rowTargets)}
          >
            {rowWord === "row" ? "Row" : rowWord}
          </MenuItem>
          <MenuItem
            tone="danger"
            disabled={!edit || colTargets.length >= colCount}
            onSelect={() => handlers.requestDelete("col", colTargets)}
          >
            {colWord === "column" ? "Column" : colWord}
          </MenuItem>
        </MenuSub>
        <MenuSub label="Hide">
          <MenuItem
            disabled={!edit}
            onSelect={() =>
              commitNow(setRowsHidden(dataRef.current, rowTargets, true))
            }
          >
            {rowWord === "row" ? "Row" : rowWord}
          </MenuItem>
          <MenuItem
            disabled={!edit}
            onSelect={() =>
              commitNow(setColumnsHidden(dataRef.current, colTargets, true))
            }
          >
            {colWord === "column" ? "Column" : colWord}
          </MenuItem>
        </MenuSub>
        <MenuSub label="Freeze">
          {freezeRowsItem}
          {freezeColsItem}
          <MenuItem
            disabled={!edit}
            onSelect={() =>
              commitNow(
                setFrozen(dataRef.current, {
                  rows: range.top,
                  cols: range.left,
                })
              )
            }
          >
            Freeze above and left of{" "}
            {formatCellRef({ row: range.top, col: range.left })}
          </MenuItem>
          {unfreezeItem}
        </MenuSub>
      </>
    )
  }

  const frozenRowsShown = rowAxis.frozen.length > 0
  const frozenColsShown = colAxis.frozen.length > 0

  return (
    <div
      data-slot="data-grid"
      className={cn(
        "flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-background text-foreground",
        "[--grid-accent:var(--primary)] [--grid-fill-edge:color-mix(in_oklab,var(--grid-accent)_55%,transparent)] [--grid-tint-strong:color-mix(in_oklab,var(--grid-accent)_16%,transparent)] [--grid-tint:color-mix(in_oklab,var(--grid-accent)_8%,transparent)]",
        className
      )}
      style={style}
      {...props}
    >
      {showNameBox ? (
        <div className="flex h-10 shrink-0 items-center gap-2 border-b border-border px-2">
          <input
            aria-label="Name box"
            value={nameDraft ?? formatRange(range)}
            spellCheck={false}
            className="h-7 w-28 shrink-0 rounded-md border border-input bg-transparent px-2 font-mono text-xs outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            onFocus={(event) => {
              setNameDraft(formatRange(range))
              event.currentTarget.select()
            }}
            onChange={(event) => setNameDraft(event.target.value)}
            onBlur={() => setNameDraft(null)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                handlers.selectRange(event.currentTarget.value)
                setNameDraft(null)
                handlers.focusGrid()
              } else if (event.key === "Escape") {
                setNameDraft(null)
                handlers.focusGrid()
              }
            }}
          />
          <span aria-hidden className="h-5 w-px bg-border" />
          <p
            className="min-w-0 flex-1 truncate text-sm text-muted-foreground"
            aria-live="polite"
          >
            {activeText}
          </p>
          {toolbar}
          {autoFitButton ? (
            <button
              type="button"
              aria-label={
                sel.mode === "cols"
                  ? "Fit selected columns to content"
                  : "Fit all columns to content"
              }
              title={
                sel.mode === "cols"
                  ? "Fit selected columns to content"
                  : "Fit all columns to content"
              }
              disabled={readOnly}
              className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-50"
              onClick={() => {
                handlers.fitColumns(
                  sel.mode === "cols" ? colTargets : undefined
                )
                handlers.focusGrid()
              }}
            >
              <MoveHorizontalIcon aria-hidden className="size-3.5" />
            </button>
          ) : null}
        </div>
      ) : null}

      <ContextMenuPrimitive.Root modal={false}>
        <ContextMenuPrimitive.Trigger asChild>
          <div
            ref={scrollerRef}
            role="grid"
            tabIndex={0}
            aria-label={label}
            aria-rowcount={rowCount + 1}
            aria-colcount={colCount + 1}
            aria-multiselectable
            aria-readonly={readOnly || undefined}
            aria-activedescendant={
              activeRendered && !editing ? `${gridId}-active` : undefined
            }
            className="relative overflow-auto overscroll-contain outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset"
            style={{ height }}
            onKeyDown={handlers.keyDown}
            onCopy={handlers.copy}
            onCut={handlers.cut}
            onPaste={handlers.paste}
            onMouseDown={handlers.mouseDown}
          >
            <div
              className="relative"
              style={{
                display: "grid",
                gridTemplateColumns: `${leftW}px ${colAxis.scrollSize}px`,
                gridTemplateRows: `${topH}px ${rowAxis.scrollSize}px`,
                width: leftW + colAxis.scrollSize,
                height: topH + rowAxis.scrollSize,
              }}
            >
              {/* Body: scrolling rows × scrolling columns */}
              <div
                role="rowgroup"
                className="relative"
                style={{ gridArea: "2 / 2" }}
              >
                {renderRows(bodyRows, bodyCols, scrollRowY, scrollColX)}
              </div>

              {/* Left: row headers and frozen columns */}
              <div
                role="rowgroup"
                className="sticky left-0 z-20 bg-background"
                style={{ gridArea: "2 / 1" }}
              >
                {bodyRows.map((row) => (
                  <div
                    key={data.rows[row].id}
                    role="row"
                    aria-rowindex={row + 2}
                    className="contents"
                  >
                    {renderHeader("row", row, 0, scrollRowY(row))}
                    {colAxis.frozen.map((col) =>
                      renderCell(row, col, frozenColX(col), scrollRowY(row))
                    )}
                  </div>
                ))}
                {frozenColsShown ? (
                  <div
                    aria-hidden
                    className="absolute inset-y-0 right-0 w-0.5 bg-foreground/20"
                  />
                ) : null}
              </div>

              {/* Top: column headers and frozen rows */}
              <div
                role="rowgroup"
                className="sticky top-0 z-20 bg-background"
                style={{ gridArea: "1 / 2" }}
              >
                <div role="row" aria-rowindex={1} className="contents">
                  {bodyCols.map((col) =>
                    renderHeader("col", col, scrollColX(col), 0)
                  )}
                </div>
                {renderRows(rowAxis.frozen, bodyCols, frozenRowY, scrollColX)}
                {frozenRowsShown ? (
                  <div
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-foreground/20"
                  />
                ) : null}
              </div>

              {/* Corner: select-all, frozen headers, frozen × frozen */}
              <div
                role="rowgroup"
                className="sticky top-0 left-0 z-30 bg-background"
                style={{ gridArea: "1 / 1" }}
              >
                <div role="row" aria-rowindex={1} className="contents">
                  <button
                    type="button"
                    aria-label="Select all"
                    data-grid-row={-1}
                    data-grid-col={-1}
                    className="absolute top-0 left-0 border-r border-b border-border bg-muted/60 hover:bg-muted"
                    style={{ width: rowHeaderW, height: headerHeight }}
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={() => {
                      handlers.finishEditing()
                      setSelection({
                        anchor: sel.anchor,
                        focus: sel.anchor,
                        mode: "all",
                      })
                      handlers.focusGrid()
                    }}
                  >
                    <svg
                      aria-hidden
                      viewBox="0 0 8 8"
                      className="absolute right-1 bottom-1 size-2 fill-muted-foreground/50"
                    >
                      <path d="M8 0V8H0Z" />
                    </svg>
                  </button>
                  {colAxis.frozen.map((col) =>
                    renderHeader("col", col, frozenColX(col), 0)
                  )}
                </div>
                {rowAxis.frozen.map((row) => (
                  <div
                    key={data.rows[row].id}
                    role="row"
                    aria-rowindex={row + 2}
                    className="contents"
                  >
                    {renderHeader("row", row, 0, frozenRowY(row))}
                    {colAxis.frozen.map((col) =>
                      renderCell(row, col, frozenColX(col), frozenRowY(row))
                    )}
                  </div>
                ))}
                {frozenRowsShown ? (
                  <div
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-foreground/20"
                  />
                ) : null}
                {frozenColsShown ? (
                  <div
                    aria-hidden
                    className="absolute inset-y-0 right-0 w-0.5 bg-foreground/20"
                  />
                ) : null}
              </div>
            </div>
          </div>
        </ContextMenuPrimitive.Trigger>
        <ContextMenuPrimitive.Portal>
          <ContextMenuPrimitive.Content
            className={menuContentClass}
            onCloseAutoFocus={(event) => {
              event.preventDefault()
              handlers.focusGrid()
            }}
          >
            {menu}
          </ContextMenuPrimitive.Content>
        </ContextMenuPrimitive.Portal>
      </ContextMenuPrimitive.Root>

      <AlertDialogPrimitive.Root
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null)
        }}
      >
        <AlertDialogPrimitive.Portal>
          <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
          <AlertDialogPrimitive.Content
            className="fixed top-1/2 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-xl bg-popover p-5 text-popover-foreground shadow-lg ring-1 ring-foreground/10 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
            onCloseAutoFocus={(event) => {
              event.preventDefault()
              // The dialog's focus trap is still active here; refocus after it unmounts.
              requestAnimationFrame(() => handlers.focusGrid())
            }}
          >
            {pendingDelete ? (
              <>
                <div className="flex flex-col gap-1.5">
                  <AlertDialogPrimitive.Title className="text-base font-medium">
                    {(() => {
                      const count = pendingDelete.indices.length
                      const noun =
                        pendingDelete.axis === "row" ? "row" : "column"
                      return `Delete ${count === 1 ? `this ${noun}` : `${count} ${noun}s`}?`
                    })()}
                  </AlertDialogPrimitive.Title>
                  <AlertDialogPrimitive.Description className="text-sm text-muted-foreground">
                    {describesPendingDelete(pendingDelete)}
                  </AlertDialogPrimitive.Description>
                </div>
                <div className="flex justify-end gap-2">
                  <AlertDialogPrimitive.Cancel asChild>
                    <Button tone="outline" size="sm">
                      Cancel
                    </Button>
                  </AlertDialogPrimitive.Cancel>
                  <AlertDialogPrimitive.Action asChild>
                    <Button
                      tone="danger"
                      size="sm"
                      onClick={() =>
                        handlers.deleteNow(
                          pendingDelete.axis,
                          pendingDelete.indices
                        )
                      }
                    >
                      Delete
                    </Button>
                  </AlertDialogPrimitive.Action>
                </div>
              </>
            ) : null}
          </AlertDialogPrimitive.Content>
        </AlertDialogPrimitive.Portal>
      </AlertDialogPrimitive.Root>
    </div>
  )
}
