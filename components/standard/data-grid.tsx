"use client"

import * as React from "react"
import { CheckIcon, ChevronRightIcon } from "lucide-react"
import {
  ContextMenu as ContextMenuPrimitive,
  AlertDialog as AlertDialogPrimitive,
} from "radix-ui"
import { cn } from "cn"

import { Button } from "@/components/standard/button"
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
  insertColumns,
  insertRows,
  isEmptyValue,
  parseRange,
  pasteText,
  rangeContains,
  rangeToText,
  readCell,
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
  type GridData,
  type GridFilter,
  type GridFilterMenu,
  type GridFormatRule,
  type GridRange,
  type GridStyle,
  type SortDirection,
} from "@/components/standard/data-grid-model"

import {
  type Axis2,
  type FilterOptions,
  type GridActions,
} from "@/components/standard/data-grid/actions"
import {
  buildAxis,
  firstVisibleIn,
  jumpPos,
  lastVisibleIn,
  nearestVisiblePos,
  windowOf,
} from "@/components/standard/data-grid/axis"
import { GridCell } from "@/components/standard/data-grid/cell"
import {
  CELL_CHROME,
  dataGridCellTypes,
  formatsPlain,
  type DataGridCellType,
  type DataGridEditMove,
} from "@/components/standard/data-grid/cell-types"
import {
  hasFilterSections,
  resolvesFilterSections,
} from "@/components/standard/data-grid/filter"
import {
  HeaderCell,
  type DataGridSortIndicator,
  type HeaderMode,
  type HeaderState,
} from "@/components/standard/data-grid/header"
import {
  AutoFitButton,
  NameBox,
} from "@/components/standard/data-grid/name-box"
import {
  clampIndex,
  clampRef,
  EDGE_BOTTOM,
  EDGE_LEFT,
  EDGE_RIGHT,
  EDGE_TOP,
  indicesOf,
  rangeSelection,
  sameRange,
  sameRef,
  sameSelection,
  selectionRange,
  type Selection,
} from "@/components/standard/data-grid/selection"
import { useStableHandlers } from "@/hooks/use-stable-handlers"

export * from "@/components/standard/data-grid-model"
export {
  dataGridCellTypes,
  type DataGridCellContext,
  type DataGridCellType,
  type DataGridEditMove,
  type DataGridEditorContext,
  type DataGridFitContext,
} from "@/components/standard/data-grid/cell-types"
export type { DataGridSortIndicator } from "@/components/standard/data-grid/header"

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
  /** The selected range, whenever it changes (rows and columns selections span the grid). */
  onSelectionChange?: (range: GridRange) => void
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
  /** Shows the column header strip (letters or labels) above the cells. Defaults to true. */
  showColumnHeaders?: boolean
  /** Shows the row header strip (numbers or labels) left of the cells. Defaults to true. */
  showRowHeaders?: boolean
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
  onSelectionChange,
  adapter,
  cellTypes: customTypes,
  headerMode = "coordinates",
  rowHeaderMode = "coordinates",
  rowHeight = 32,
  columnWidth = 120,
  headerHeight: headerHeightProp = 32,
  rowHeaderWidth,
  showColumnHeaders = true,
  showRowHeaders = true,
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
  const headerHeight = showColumnHeaders ? headerHeightProp : 0
  const rowHeaderW = !showRowHeaders
    ? 0
    : (rowHeaderWidth ??
      (rowHeaderMode === "coordinates"
        ? Math.max(48, String(rowCount).length * 8 + 24)
        : 140))

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

    emitSelection() {
      onSelectionChange?.(range)
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

  React.useEffect(() => {
    handlers.emitSelection()
  }, [handlers, range.top, range.left, range.bottom, range.right])

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
    if (axis === "col" ? !showColumnHeaders : !showRowHeaders) return null
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
        <NameBox
          range={range}
          activeText={activeText}
          onSelectRange={handlers.selectRange}
          onDone={handlers.focusGrid}
          trailing={
            <>
              {toolbar}
              {autoFitButton ? (
                <AutoFitButton
                  selectedOnly={sel.mode === "cols"}
                  disabled={readOnly}
                  onFit={() => {
                    handlers.fitColumns(
                      sel.mode === "cols" ? colTargets : undefined
                    )
                    handlers.focusGrid()
                  }}
                />
              ) : null}
            </>
          }
        />
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
                  {showColumnHeaders && showRowHeaders ? (
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
                  ) : null}
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
