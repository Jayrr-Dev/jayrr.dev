/**
 * Headless model for the Data Grid: the data shape, A1 coordinates, the
 * change log every edit goes through, and the fill-series rules. Nothing here
 * touches React, so the same functions work in a server action, a test, or a
 * database sync worker.
 *
 * Every edit is a list of `GridChange`s. The grid applies them locally, keeps
 * their inverses for undo, and hands them to `onChanges` or an adapter so a
 * backend can mirror them one mutation at a time.
 */

export type CellValue = string | number | boolean | null
export type RowId = string
export type ColId = string

export type GridSelectOption = {
  value: string
  label?: string
  tone?: "default" | "quiet" | "outline" | "danger"
}

export type GridColumn = {
  id: ColId
  /** Name shown next to (or instead of) the column letter. */
  label?: string
  width?: number
  hidden?: boolean
  /** Key into the grid's cell types: text, number, checkbox, select, date, or your own. */
  type?: string
  readOnly?: boolean
  /** Choices for `type: "select"`. */
  options?: GridSelectOption[]
  /** Overrides the grid's `sortable` for this column. */
  sortable?: boolean
  /**
   * Shows a filter button at the right of the header. Pass an object to pick
   * which parts of its menu appear (overrides the grid's `filterMenu`).
   */
  filterable?: boolean | GridFilterMenu
}

export type GridRow = {
  id: RowId
  /** Name shown next to (or instead of) the row number. */
  label?: string
  height?: number
  hidden?: boolean
}

export type GridCells = Record<RowId, Record<ColId, CellValue>>
export type GridFrozen = { rows: number; cols: number }

/**
 * Which sections a column's filter menu shows. All default to true.
 * `conditions` can also be a list to offer only those operators.
 */
export type GridFilterMenu = {
  sort?: boolean
  conditions?: boolean | GridConditionOp[]
  values?: boolean
}

export type SortDirection = "asc" | "desc"
export type GridSort = {
  colId: ColId
  direction: SortDirection
  /**
   * Row order from before the first sort, so clearing the sort can put rows
   * back. Kept across re-sorts by other columns.
   */
  unsortedOrder?: RowId[]
}

export type GridConditionOp =
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

/** A test on one value. Text comparisons ignore case; ISO dates compare in order. */
export type GridCondition = {
  op: GridConditionOp
  value?: CellValue
  value2?: CellValue
}

/**
 * A column filter. `values` keeps rows whose value (as text, "" for blank) is
 * listed; `condition` keeps rows that pass the test. With both, rows must pass both.
 */
export type GridFilter = { values?: string[]; condition?: GridCondition }

/**
 * How a rule styles cells. Every field is plain JSON so rules can come from a
 * database. Colors are a tone name (red, orange, amber, yellow, green, teal,
 * blue, violet, pink, gray) or any CSS color; tone backgrounds are tints.
 */
export type GridStyle = {
  background?: string
  color?: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strike?: boolean
  align?: "start" | "center" | "end"
  /** CSS font size, e.g. `"12px"` or `"0.8rem"`. */
  fontSize?: string
  /** Inset outline color (tone name or CSS color). */
  border?: string
  /** Any other inline CSS, camelCase keys: `{ "opacity": 0.6, "letterSpacing": "0.02em" }`. */
  css?: Record<string, string | number>
  /** Extra classes. Only classes that exist at build time will apply. */
  className?: string
}

/**
 * Declarative conditional formatting. Plain JSON, so rules can live in a
 * database and be edited from anywhere.
 *
 * - `cell`: styles each cell (in `columns`, or all) whose own value passes `when`.
 * - `row`: styles the whole row when its values in `columns` pass `when`
 *   (`match: "any"` by default, or `"all"`).
 * - `column`: styles the whole column (in `columns`, or all) when its
 *   non-blank values pass `when` (`any` or `all`).
 *
 * `rows` limits any rule to those rows. No `when` means always. Where rules
 * overlap, fields merge: cell beats row beats column, and earlier rules beat
 * later ones of the same target.
 */
export type GridFormatRule = {
  id: string
  target: "cell" | "row" | "column"
  columns?: ColId[]
  rows?: RowId[]
  when?: GridCondition
  match?: "any" | "all"
  style: GridStyle
}

export type GridData = {
  rows: GridRow[]
  columns: GridColumn[]
  /** Sparse: empty cells have no entry. */
  cells: GridCells
  /** How many leading rows and columns stay pinned, counted by index. */
  frozen: GridFrozen
  /** The column the rows were last sorted by. Shown as an arrow in its header. */
  sort?: GridSort | null
  /** Active filters by column id. Frozen rows are never filtered out. */
  filters?: Record<ColId, GridFilter>
  /** Conditional formatting stored with the data. */
  rules?: GridFormatRule[]
}

/** Zero-based position in the full row and column order, hidden ones included. */
export type CellRef = { row: number; col: number }
export type GridRange = {
  top: number
  left: number
  bottom: number
  right: number
}

export type RowPatch = Partial<Omit<GridRow, "id">>
export type ColumnPatch = Partial<Omit<GridColumn, "id">>
export type CellUpdate = { rowId: RowId; colId: ColId; value: CellValue }

export type GridChange =
  | { type: "setCells"; cells: CellUpdate[] }
  | { type: "insertRows"; index: number; rows: GridRow[]; cells?: GridCells }
  | { type: "deleteRows"; ids: RowId[] }
  | {
      type: "insertColumns"
      index: number
      columns: GridColumn[]
      cells?: GridCells
    }
  | { type: "deleteColumns"; ids: ColId[] }
  | { type: "patchRows"; patches: { id: RowId; patch: RowPatch }[] }
  | { type: "patchColumns"; patches: { id: ColId; patch: ColumnPatch }[] }
  | { type: "setFrozen"; frozen: GridFrozen }
  /** The full row order after a sort. Rows not listed keep their relative order at the end. */
  | { type: "reorderRows"; ids: RowId[] }
  | { type: "setSort"; sort: GridSort | null }
  | { type: "setFilter"; colId: ColId; filter: GridFilter | null }
  | { type: "setRules"; rules: GridFormatRule[] }

export type FillMode = "series" | "copy"

// ---------------------------------------------------------------------------
// Ids and construction

let idCounter = 0

/** Short random id. Pass your own `createId` to the grid to use database ids. */
export function createGridId(prefix: string) {
  idCounter += 1
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10)
  return `${prefix}_${random}${idCounter.toString(36)}`
}

export type GridColumnInput = Omit<GridColumn, "id"> & { id?: ColId }

/**
 * Builds grid data from plain values. `rows` is either a row count or a 2D
 * array of values in column order. Ids are deterministic (`row-1`, `col-1`)
 * so the same input renders the same on the server and the client.
 */
export function createGridData({
  columns,
  rows,
  frozen = { rows: 0, cols: 0 },
}: {
  columns: number | GridColumnInput[]
  rows: number | CellValue[][]
  frozen?: GridFrozen
}): GridData {
  const columnList: GridColumn[] =
    typeof columns === "number"
      ? Array.from({ length: columns }, (_, index) => ({
          id: `col-${index + 1}`,
        }))
      : columns.map((column, index) => ({
          ...column,
          id: column.id ?? `col-${index + 1}`,
        }))
  const values = typeof rows === "number" ? [] : rows
  const rowCount = typeof rows === "number" ? rows : rows.length
  const rowList: GridRow[] = Array.from({ length: rowCount }, (_, index) => ({
    id: `row-${index + 1}`,
  }))
  const cells: GridCells = {}
  values.forEach((line, rowIndex) => {
    const record: Record<ColId, CellValue> = {}
    line.forEach((value, colIndex) => {
      const column = columnList[colIndex]
      if (column && !isEmptyValue(value)) {
        record[column.id] = value
      }
    })
    if (Object.keys(record).length > 0) {
      cells[rowList[rowIndex].id] = record
    }
  })
  return { rows: rowList, columns: columnList, cells, frozen }
}

export function isEmptyValue(value: CellValue | undefined): boolean {
  return value === null || value === undefined || value === ""
}

export function readCell(data: GridData, row: number, col: number): CellValue {
  const rowId = data.rows[row]?.id
  const colId = data.columns[col]?.id
  if (rowId === undefined || colId === undefined) {
    return null
  }
  return data.cells[rowId]?.[colId] ?? null
}

// ---------------------------------------------------------------------------
// A1 coordinates

/** 0 → A, 25 → Z, 26 → AA. */
export function columnLetter(index: number): string {
  let letters = ""
  let remaining = index + 1
  while (remaining > 0) {
    const digit = (remaining - 1) % 26
    letters = String.fromCharCode(65 + digit) + letters
    remaining = Math.floor((remaining - 1) / 26)
  }
  return letters
}

/** A → 0, AA → 26. Returns -1 for anything that is not letters. */
export function columnIndex(letters: string): number {
  if (!/^[A-Za-z]+$/.test(letters)) {
    return -1
  }
  let index = 0
  for (const letter of letters.toUpperCase()) {
    index = index * 26 + (letter.charCodeAt(0) - 64)
  }
  return index - 1
}

export function formatCellRef({ row, col }: CellRef): string {
  return `${columnLetter(col)}${row + 1}`
}

export function parseCellRef(text: string): CellRef | null {
  const match = /^\s*\$?([A-Za-z]+)\$?(\d+)\s*$/.exec(text)
  if (!match) {
    return null
  }
  const row = Number(match[2]) - 1
  const col = columnIndex(match[1])
  return row >= 0 && col >= 0 ? { row, col } : null
}

export function normalizeRange(a: CellRef, b: CellRef): GridRange {
  return {
    top: Math.min(a.row, b.row),
    bottom: Math.max(a.row, b.row),
    left: Math.min(a.col, b.col),
    right: Math.max(a.col, b.col),
  }
}

export function formatRange(range: GridRange): string {
  const start = formatCellRef({ row: range.top, col: range.left })
  if (range.top === range.bottom && range.left === range.right) {
    return start
  }
  return `${start}:${formatCellRef({ row: range.bottom, col: range.right })}`
}

/** Accepts `B3` or `B3:D7`. */
export function parseRange(text: string): GridRange | null {
  const [first, second] = text.split(":")
  const start = parseCellRef(first ?? "")
  if (!start) {
    return null
  }
  const end = second === undefined ? start : parseCellRef(second)
  return end ? normalizeRange(start, end) : null
}

export function rangeContains(range: GridRange, row: number, col: number) {
  return (
    row >= range.top &&
    row <= range.bottom &&
    col >= range.left &&
    col <= range.right
  )
}

export function rangeSize(range: GridRange) {
  return {
    rows: range.bottom - range.top + 1,
    cols: range.right - range.left + 1,
  }
}

// ---------------------------------------------------------------------------
// Applying changes

function patchRecord<T extends { id: string }>(
  item: T,
  patch: Partial<Omit<T, "id">>
): T {
  const next = { ...item }
  for (const key of Object.keys(patch) as (keyof T)[]) {
    const value = (patch as Partial<T>)[key]
    if (value === undefined) {
      delete next[key]
    } else {
      next[key] = value as T[keyof T]
    }
  }
  return next
}

function mergeCells(cells: GridCells, extra: GridCells | undefined): GridCells {
  if (!extra) {
    return cells
  }
  const next = { ...cells }
  for (const [rowId, record] of Object.entries(extra)) {
    const merged = { ...next[rowId], ...record }
    for (const [colId, value] of Object.entries(merged)) {
      if (isEmptyValue(value)) {
        delete merged[colId]
      }
    }
    if (Object.keys(merged).length > 0) {
      next[rowId] = merged
    }
  }
  return next
}

/** Applies one change and returns new data. Inputs are never mutated. */
export function applyGridChange(data: GridData, change: GridChange): GridData {
  switch (change.type) {
    case "setCells": {
      const cells = { ...data.cells }
      const copied = new Set<RowId>()
      for (const { rowId, colId, value } of change.cells) {
        if (!copied.has(rowId)) {
          cells[rowId] = { ...cells[rowId] }
          copied.add(rowId)
        }
        if (isEmptyValue(value)) {
          delete cells[rowId][colId]
        } else {
          cells[rowId][colId] = value
        }
      }
      for (const rowId of copied) {
        if (Object.keys(cells[rowId]).length === 0) {
          delete cells[rowId]
        }
      }
      return { ...data, cells }
    }
    case "insertRows": {
      const rows = [...data.rows]
      rows.splice(change.index, 0, ...change.rows)
      return { ...data, rows, cells: mergeCells(data.cells, change.cells) }
    }
    case "deleteRows": {
      const ids = new Set(change.ids)
      const cells = { ...data.cells }
      for (const id of ids) {
        delete cells[id]
      }
      return {
        ...data,
        rows: data.rows.filter((row) => !ids.has(row.id)),
        cells,
      }
    }
    case "insertColumns": {
      const columns = [...data.columns]
      columns.splice(change.index, 0, ...change.columns)
      return { ...data, columns, cells: mergeCells(data.cells, change.cells) }
    }
    case "deleteColumns": {
      const ids = new Set(change.ids)
      const cells: GridCells = {}
      for (const [rowId, record] of Object.entries(data.cells)) {
        let next = record
        for (const id of ids) {
          if (id in next) {
            if (next === record) {
              next = { ...record }
            }
            delete next[id]
          }
        }
        if (Object.keys(next).length > 0) {
          cells[rowId] = next
        }
      }
      return {
        ...data,
        columns: data.columns.filter((column) => !ids.has(column.id)),
        cells,
      }
    }
    case "patchRows": {
      const patches = new Map(
        change.patches.map(({ id, patch }) => [id, patch])
      )
      return {
        ...data,
        rows: data.rows.map((row) => {
          const patch = patches.get(row.id)
          return patch ? patchRecord(row, patch) : row
        }),
      }
    }
    case "patchColumns": {
      const patches = new Map(
        change.patches.map(({ id, patch }) => [id, patch])
      )
      return {
        ...data,
        columns: data.columns.map((column) => {
          const patch = patches.get(column.id)
          return patch ? patchRecord(column, patch) : column
        }),
      }
    }
    case "setFrozen":
      return { ...data, frozen: change.frozen }
    case "reorderRows": {
      const byId = new Map(data.rows.map((row) => [row.id, row]))
      const listed = new Set<RowId>()
      const rows: GridRow[] = []
      for (const id of change.ids) {
        const row = byId.get(id)
        if (row && !listed.has(id)) {
          rows.push(row)
          listed.add(id)
        }
      }
      for (const row of data.rows) {
        if (!listed.has(row.id)) {
          rows.push(row)
        }
      }
      return { ...data, rows }
    }
    case "setSort":
      return { ...data, sort: change.sort }
    case "setFilter": {
      const filters = { ...data.filters }
      if (change.filter) {
        filters[change.colId] = change.filter
      } else {
        delete filters[change.colId]
      }
      return { ...data, filters }
    }
    case "setRules":
      return { ...data, rules: change.rules }
  }
}

/** Groups sorted indices into runs of consecutive numbers. */
function consecutiveRuns(indices: number[]): number[][] {
  const runs: number[][] = []
  for (const index of indices) {
    const run = runs[runs.length - 1]
    if (run && run[run.length - 1] === index - 1) {
      run.push(index)
    } else {
      runs.push([index])
    }
  }
  return runs
}

/** The changes that undo `change`, computed against the data before it runs. */
export function invertGridChange(
  data: GridData,
  change: GridChange
): GridChange[] {
  switch (change.type) {
    case "setCells": {
      const seen = new Set<string>()
      const cells: CellUpdate[] = []
      for (const { rowId, colId } of change.cells) {
        const key = `${rowId}\u0000${colId}`
        if (!seen.has(key)) {
          seen.add(key)
          cells.push({
            rowId,
            colId,
            value: data.cells[rowId]?.[colId] ?? null,
          })
        }
      }
      return [{ type: "setCells", cells }]
    }
    case "insertRows":
      return [{ type: "deleteRows", ids: change.rows.map((row) => row.id) }]
    case "deleteRows": {
      const ids = new Set(change.ids)
      const indices = data.rows.flatMap((row, index) =>
        ids.has(row.id) ? [index] : []
      )
      return consecutiveRuns(indices).map((run) => {
        const rows = run.map((index) => data.rows[index])
        const cells: GridCells = {}
        for (const row of rows) {
          if (data.cells[row.id]) {
            cells[row.id] = data.cells[row.id]
          }
        }
        return { type: "insertRows", index: run[0], rows, cells }
      })
    }
    case "insertColumns":
      return [
        {
          type: "deleteColumns",
          ids: change.columns.map((column) => column.id),
        },
      ]
    case "deleteColumns": {
      const ids = new Set(change.ids)
      const indices = data.columns.flatMap((column, index) =>
        ids.has(column.id) ? [index] : []
      )
      return consecutiveRuns(indices).map((run) => {
        const columns = run.map((index) => data.columns[index])
        const cells: GridCells = {}
        for (const [rowId, record] of Object.entries(data.cells)) {
          for (const column of columns) {
            if (column.id in record) {
              cells[rowId] = { ...cells[rowId], [column.id]: record[column.id] }
            }
          }
        }
        return { type: "insertColumns", index: run[0], columns, cells }
      })
    }
    case "patchRows": {
      const byId = new Map(data.rows.map((row) => [row.id, row]))
      return [
        {
          type: "patchRows",
          patches: change.patches.map(({ id, patch }) => {
            const row = byId.get(id)
            const previous: RowPatch = {}
            for (const key of Object.keys(patch) as (keyof RowPatch)[]) {
              Object.assign(previous, { [key]: row?.[key] })
            }
            return { id, patch: previous }
          }),
        },
      ]
    }
    case "patchColumns": {
      const byId = new Map(data.columns.map((column) => [column.id, column]))
      return [
        {
          type: "patchColumns",
          patches: change.patches.map(({ id, patch }) => {
            const column = byId.get(id)
            const previous: ColumnPatch = {}
            for (const key of Object.keys(patch) as (keyof ColumnPatch)[]) {
              Object.assign(previous, { [key]: column?.[key] })
            }
            return { id, patch: previous }
          }),
        },
      ]
    }
    case "setFrozen":
      return [{ type: "setFrozen", frozen: data.frozen }]
    case "reorderRows":
      return [{ type: "reorderRows", ids: data.rows.map((row) => row.id) }]
    case "setSort":
      return [{ type: "setSort", sort: data.sort ?? null }]
    case "setFilter":
      return [
        {
          type: "setFilter",
          colId: change.colId,
          filter: data.filters?.[change.colId] ?? null,
        },
      ]
    case "setRules":
      return [{ type: "setRules", rules: data.rules ?? [] }]
  }
}

/** Applies changes in order and returns the new data plus the changes that undo them. */
export function applyGridChanges(
  data: GridData,
  changes: GridChange[]
): { data: GridData; inverse: GridChange[] } {
  let current = data
  const inverses: GridChange[][] = []
  for (const change of changes) {
    inverses.push(invertGridChange(current, change))
    current = applyGridChange(current, change)
  }
  return { data: current, inverse: inverses.reverse().flat() }
}

// ---------------------------------------------------------------------------
// Commands: each one reads the data and returns the changes to make.

type IdFactory = (kind: "row" | "col") => string

const defaultIdFactory: IdFactory = (kind) =>
  createGridId(kind === "row" ? "r" : "c")

function uniqueSorted(indices: number[]) {
  return [...new Set(indices)].sort((a, b) => a - b)
}

function frozenShift(frozen: number, at: number, count: number) {
  return at < frozen ? frozen + count : frozen
}

export function insertRows(
  data: GridData,
  index: number,
  count = 1,
  createId: IdFactory = defaultIdFactory
): GridChange[] {
  const rows = Array.from({ length: count }, () => ({ id: createId("row") }))
  const changes: GridChange[] = [{ type: "insertRows", index, rows }]
  const frozenRows = frozenShift(data.frozen.rows, index, count)
  if (frozenRows !== data.frozen.rows) {
    changes.push({
      type: "setFrozen",
      frozen: { ...data.frozen, rows: frozenRows },
    })
  }
  return changes
}

export function insertColumns(
  data: GridData,
  index: number,
  count = 1,
  createId: IdFactory = defaultIdFactory
): GridChange[] {
  const columns = Array.from({ length: count }, () => ({ id: createId("col") }))
  const changes: GridChange[] = [{ type: "insertColumns", index, columns }]
  const frozenCols = frozenShift(data.frozen.cols, index, count)
  if (frozenCols !== data.frozen.cols) {
    changes.push({
      type: "setFrozen",
      frozen: { ...data.frozen, cols: frozenCols },
    })
  }
  return changes
}

/** Deletes rows by index. Always leaves at least one row behind. */
export function deleteRows(data: GridData, indices: number[]): GridChange[] {
  const targets = uniqueSorted(indices).filter(
    (index) => index < data.rows.length
  )
  if (targets.length === 0 || targets.length >= data.rows.length) {
    return []
  }
  const changes: GridChange[] = [
    { type: "deleteRows", ids: targets.map((index) => data.rows[index].id) },
  ]
  const frozenLost = targets.filter((index) => index < data.frozen.rows).length
  if (frozenLost > 0) {
    changes.push({
      type: "setFrozen",
      frozen: { ...data.frozen, rows: data.frozen.rows - frozenLost },
    })
  }
  return changes
}

/** Deletes columns by index. Always leaves at least one column behind. */
export function deleteColumns(data: GridData, indices: number[]): GridChange[] {
  const targets = uniqueSorted(indices).filter(
    (index) => index < data.columns.length
  )
  if (targets.length === 0 || targets.length >= data.columns.length) {
    return []
  }
  const changes: GridChange[] = [
    {
      type: "deleteColumns",
      ids: targets.map((index) => data.columns[index].id),
    },
  ]
  const frozenLost = targets.filter((index) => index < data.frozen.cols).length
  if (frozenLost > 0) {
    changes.push({
      type: "setFrozen",
      frozen: { ...data.frozen, cols: data.frozen.cols - frozenLost },
    })
  }
  return changes
}

/** Copies the rows (values, label, height) and inserts the copies right after the last one. */
export function duplicateRows(
  data: GridData,
  indices: number[],
  createId: IdFactory = defaultIdFactory
): GridChange[] {
  const targets = uniqueSorted(indices).filter(
    (index) => index < data.rows.length
  )
  if (targets.length === 0) {
    return []
  }
  const cells: GridCells = {}
  const rows = targets.map((index) => {
    const source = data.rows[index]
    const copy: GridRow = { ...source, id: createId("row"), hidden: undefined }
    if (data.cells[source.id]) {
      cells[copy.id] = { ...data.cells[source.id] }
    }
    return copy
  })
  const at = targets[targets.length - 1] + 1
  const changes: GridChange[] = [{ type: "insertRows", index: at, rows, cells }]
  const frozenRows = frozenShift(data.frozen.rows, at, rows.length)
  if (frozenRows !== data.frozen.rows) {
    changes.push({
      type: "setFrozen",
      frozen: { ...data.frozen, rows: frozenRows },
    })
  }
  return changes
}

/** Copies the columns (values, label, type, width) and inserts the copies right after the last one. */
export function duplicateColumns(
  data: GridData,
  indices: number[],
  createId: IdFactory = defaultIdFactory
): GridChange[] {
  const targets = uniqueSorted(indices).filter(
    (index) => index < data.columns.length
  )
  if (targets.length === 0) {
    return []
  }
  const pairs = targets.map((index) => {
    const source = data.columns[index]
    return [
      source.id,
      { ...source, id: createId("col"), hidden: undefined },
    ] as const
  })
  const cells: GridCells = {}
  for (const [rowId, record] of Object.entries(data.cells)) {
    for (const [sourceId, copy] of pairs) {
      if (sourceId in record) {
        cells[rowId] = { ...cells[rowId], [copy.id]: record[sourceId] }
      }
    }
  }
  const at = targets[targets.length - 1] + 1
  const changes: GridChange[] = [
    {
      type: "insertColumns",
      index: at,
      columns: pairs.map(([, copy]) => copy),
      cells,
    },
  ]
  const frozenCols = frozenShift(data.frozen.cols, at, pairs.length)
  if (frozenCols !== data.frozen.cols) {
    changes.push({
      type: "setFrozen",
      frozen: { ...data.frozen, cols: frozenCols },
    })
  }
  return changes
}

export function setRowsHidden(
  data: GridData,
  indices: number[],
  hidden: boolean
): GridChange[] {
  const patches = uniqueSorted(indices)
    .map((index) => data.rows[index])
    .filter((row) => row && Boolean(row.hidden) !== hidden)
    .map((row) => ({ id: row.id, patch: { hidden: hidden || undefined } }))
  return patches.length > 0 ? [{ type: "patchRows", patches }] : []
}

export function setColumnsHidden(
  data: GridData,
  indices: number[],
  hidden: boolean
): GridChange[] {
  const patches = uniqueSorted(indices)
    .map((index) => data.columns[index])
    .filter((column) => column && Boolean(column.hidden) !== hidden)
    .map((column) => ({
      id: column.id,
      patch: { hidden: hidden || undefined },
    }))
  return patches.length > 0 ? [{ type: "patchColumns", patches }] : []
}

export function setFrozen(
  data: GridData,
  frozen: Partial<GridFrozen>
): GridChange[] {
  const next = { ...data.frozen, ...frozen }
  if (next.rows === data.frozen.rows && next.cols === data.frozen.cols) {
    return []
  }
  return [{ type: "setFrozen", frozen: next }]
}

function writableColumn(data: GridData, col: number) {
  const column = data.columns[col]
  return column && !column.readOnly ? column : null
}

/** Writes values into cells, skipping read-only columns and unchanged values. */
export function setCellValues(
  data: GridData,
  entries: { row: number; col: number; value: CellValue }[]
): GridChange[] {
  const cells: CellUpdate[] = []
  for (const { row, col, value } of entries) {
    const rowId = data.rows[row]?.id
    const column = writableColumn(data, col)
    if (!rowId || !column) {
      continue
    }
    const current = data.cells[rowId]?.[column.id] ?? null
    const same =
      current === value || (isEmptyValue(current) && isEmptyValue(value))
    if (!same) {
      cells.push({ rowId, colId: column.id, value })
    }
  }
  return cells.length > 0 ? [{ type: "setCells", cells }] : []
}

function eachCell(range: GridRange, visit: (row: number, col: number) => void) {
  for (let row = range.top; row <= range.bottom; row += 1) {
    for (let col = range.left; col <= range.right; col += 1) {
      visit(row, col)
    }
  }
}

/** Clears the range, skipping hidden and filtered-out rows like Excel does. */
export function clearRange(data: GridData, range: GridRange): GridChange[] {
  const shown = rowShownTest(data)
  const entries: { row: number; col: number; value: CellValue }[] = []
  eachCell(range, (row, col) => {
    if (shown(row)) {
      entries.push({ row, col, value: null })
    }
  })
  return setCellValues(data, entries)
}

/**
 * Fills `target` from `source`, the way dragging the fill handle does.
 * `target` must contain `source`. Columns fill first (down or up), then every
 * row fills sideways from that result, so a diagonal drag covers the whole
 * rectangle and still continues series in both directions.
 */
export function fillRange(
  data: GridData,
  source: GridRange,
  target: GridRange,
  mode: FillMode = "series"
): GridChange[] {
  const width = target.right - target.left + 1
  const grid: CellValue[][] = []
  for (let row = target.top; row <= target.bottom; row += 1) {
    grid.push(new Array<CellValue>(width).fill(null))
  }

  for (let col = source.left; col <= source.right; col += 1) {
    const values: CellValue[] = []
    for (let row = source.top; row <= source.bottom; row += 1) {
      values.push(readCell(data, row, col))
    }
    const series = createFillSeries(values, mode)
    for (let row = target.top; row <= target.bottom; row += 1) {
      grid[row - target.top][col - target.left] = series(row - source.top)
    }
  }

  for (let row = target.top; row <= target.bottom; row += 1) {
    const line = grid[row - target.top]
    const values = line.slice(
      source.left - target.left,
      source.right - target.left + 1
    )
    const series = createFillSeries(values, mode)
    for (let col = target.left; col <= target.right; col += 1) {
      line[col - target.left] = series(col - source.left)
    }
  }

  const entries: { row: number; col: number; value: CellValue }[] = []
  eachCell(target, (row, col) => {
    if (!rangeContains(source, row, col)) {
      entries.push({
        row,
        col,
        value: grid[row - target.top][col - target.left],
      })
    }
  })
  return setCellValues(data, entries)
}

function previousVisible(shown: (index: number) => boolean, index: number) {
  for (let at = index - 1; at >= 0; at -= 1) {
    if (shown(at)) {
      return at
    }
  }
  return -1
}

/**
 * Ctrl+D. One row selected: copies the visible row above into it. Taller
 * selections copy their top row down through the rest.
 */
export function fillDown(data: GridData, range: GridRange): GridChange[] {
  if (range.top === range.bottom) {
    const above = previousVisible(rowShownTest(data), range.top)
    if (above < 0) {
      return []
    }
    return fillRange(
      data,
      { ...range, top: above, bottom: above },
      { ...range, top: above },
      "copy"
    )
  }
  return fillRange(data, { ...range, bottom: range.top }, range, "copy")
}

/** Ctrl+R. The sideways version of `fillDown`. */
export function fillRight(data: GridData, range: GridRange): GridChange[] {
  if (range.left === range.right) {
    const before = previousVisible(
      (col) => !data.columns[col]?.hidden,
      range.left
    )
    if (before < 0) {
      return []
    }
    return fillRange(
      data,
      { ...range, left: before, right: before },
      { ...range, left: before },
      "copy"
    )
  }
  return fillRange(data, { ...range, right: range.left }, range, "copy")
}

// ---------------------------------------------------------------------------
// Fill series

const LISTS = [
  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],
  [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  ["Q1", "Q2", "Q3", "Q4"],
]

const NUMBER_TEXT = /^-?\d+(\.\d+)?$/
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const TRAILING_NUMBER = /^(.*?)(\d+)$/
const DAY_MS = 86_400_000

function mod(value: number, size: number) {
  return ((value % size) + size) % size
}

function asNumber(value: CellValue): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null
  }
  if (typeof value === "string" && NUMBER_TEXT.test(value.trim())) {
    return Number(value)
  }
  return null
}

/** Least-squares line through (0, y0), (1, y1), … — Excel's linear trend. */
function linearTrend(values: number[]) {
  const count = values.length
  const meanX = (count - 1) / 2
  const meanY = values.reduce((sum, value) => sum + value, 0) / count
  let numerator = 0
  let denominator = 0
  values.forEach((value, index) => {
    numerator += (index - meanX) * (value - meanY)
    denominator += (index - meanX) ** 2
  })
  const slope = denominator === 0 ? 0 : numerator / denominator
  return { slope, intercept: meanY - slope * meanX }
}

function clean(value: number) {
  return Number(value.toFixed(10))
}

function matchCase(word: string, sample: string) {
  if (sample === sample.toUpperCase()) {
    return word.toUpperCase()
  }
  if (sample === sample.toLowerCase()) {
    return word.toLowerCase()
  }
  return word
}

/**
 * Returns the value at position `p` of the series that `values` starts, where
 * `values` sit at positions 0…n-1. Negative positions extend backward, which
 * is how fills up and left work.
 *
 * Recognizes numbers (2+ values), ISO dates, weekday and month names,
 * quarters, and text ending in a number (`Item 1` → `Item 2`). Anything else
 * repeats. `copy` mode always repeats.
 */
export function createFillSeries(
  values: CellValue[],
  mode: FillMode = "series"
) {
  const count = values.length
  const repeat = (position: number) =>
    count === 0 ? null : values[mod(position, count)]
  if (
    count === 0 ||
    mode === "copy" ||
    values.some((value) => isEmptyValue(value))
  ) {
    return repeat
  }

  const numbers = values.map(asNumber)
  if (numbers.every((value) => value !== null)) {
    if (count === 1) {
      return repeat
    }
    const { slope, intercept } = linearTrend(numbers as number[])
    const asText = values.some((value) => typeof value === "string")
    return (position: number) => {
      const next = clean(intercept + slope * position)
      return asText ? String(next) : next
    }
  }

  const texts = values.map((value) =>
    typeof value === "string" ? value.trim() : null
  )
  if (texts.some((text) => text === null)) {
    return repeat
  }
  const words = texts as string[]

  if (words.every((word) => ISO_DATE.test(word))) {
    const days = words.map((word) => Date.parse(`${word}T00:00:00Z`) / DAY_MS)
    const step =
      count === 1 ? 1 : Math.round((days[count - 1] - days[0]) / (count - 1))
    return (position: number) =>
      new Date((days[0] + step * position) * DAY_MS).toISOString().slice(0, 10)
  }

  for (const list of LISTS) {
    const lower = list.map((word) => word.toLowerCase())
    const indices = words.map((word) => lower.indexOf(word.toLowerCase()))
    if (indices.every((index) => index >= 0)) {
      const step = count === 1 ? 1 : mod(indices[1] - indices[0], list.length)
      const steady = indices.every(
        (index, at) =>
          at === 0 || mod(index - indices[at - 1], list.length) === step
      )
      if (!steady) {
        return repeat
      }
      return (position: number) =>
        matchCase(
          list[mod(indices[0] + step * position, list.length)],
          words[0]
        )
    }
  }

  const parts = words.map((word) => TRAILING_NUMBER.exec(word))
  if (parts.every((part) => part !== null)) {
    const matches = parts as RegExpExecArray[]
    const prefix = matches[0][1]
    if (matches.every((part) => part[1] === prefix)) {
      const nums = matches.map((part) => Number(part[2]))
      const step = count === 1 ? 1 : (nums[count - 1] - nums[0]) / (count - 1)
      if (Number.isInteger(step)) {
        const pad = matches[0][2].startsWith("0") ? matches[0][2].length : 0
        return (position: number) => {
          const next = nums[0] + step * position
          const digits = String(Math.abs(next)).padStart(pad, "0")
          return `${prefix}${next < 0 ? "-" : ""}${digits}`
        }
      }
    }
  }

  return repeat
}

// ---------------------------------------------------------------------------
// Clipboard: tab-separated text, the format Excel and Sheets read and write.

function quoteField(text: string) {
  return /[\t\n\r"]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/** Copies the visible cells of `range` as TSV. */
export function rangeToText(
  data: GridData,
  range: GridRange,
  format: (value: CellValue, column: GridColumn) => string = (value) =>
    value === null ? "" : String(value)
): string {
  const shown = rowShownTest(data)
  const lines: string[] = []
  for (let row = range.top; row <= range.bottom; row += 1) {
    if (!shown(row)) {
      continue
    }
    const fields: string[] = []
    for (let col = range.left; col <= range.right; col += 1) {
      const column = data.columns[col]
      if (!column || column.hidden) {
        continue
      }
      fields.push(quoteField(format(readCell(data, row, col), column)))
    }
    lines.push(fields.join("\t"))
  }
  return lines.join("\n")
}

/** Parses TSV, including quoted fields that hold tabs, quotes, or line breaks. */
export function parseTabularText(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let quoted = false
  const source = text.replace(/\r\n?/g, "\n").replace(/\n$/, "")
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index]
    if (quoted) {
      if (char === '"' && source[index + 1] === '"') {
        field += '"'
        index += 1
      } else if (char === '"') {
        quoted = false
      } else {
        field += char
      }
    } else if (char === '"' && field === "") {
      quoted = true
    } else if (char === "\t") {
      row.push(field)
      field = ""
    } else if (char === "\n") {
      row.push(field)
      rows.push(row)
      row = []
      field = ""
    } else {
      field += char
    }
  }
  row.push(field)
  rows.push(row)
  return rows
}

function visibleIndicesFrom(
  length: number,
  shown: (index: number) => boolean,
  start: number,
  count: number
) {
  const indices: number[] = []
  for (
    let index = start;
    index < length && indices.length < count;
    index += 1
  ) {
    if (shown(index)) {
      indices.push(index)
    }
  }
  return indices
}

/**
 * Pastes TSV at the top-left of `range`, skipping hidden rows and columns.
 * A single copied value fills the whole selection, like Excel.
 */
export function pasteText(
  data: GridData,
  range: GridRange,
  text: string,
  parse: (text: string, column: GridColumn) => CellValue = (value) => value
): GridChange[] {
  const table = parseTabularText(text)
  const single = table.length === 1 && table[0].length === 1
  const { rows: height, cols: width } = rangeSize(range)
  const rowIndices = visibleIndicesFrom(
    data.rows.length,
    rowShownTest(data),
    range.top,
    single ? height : table.length
  )
  const colIndices = visibleIndicesFrom(
    data.columns.length,
    (col) => !data.columns[col].hidden,
    range.left,
    single ? width : Math.max(...table.map((line) => line.length))
  )
  const entries: { row: number; col: number; value: CellValue }[] = []
  rowIndices.forEach((row, rowAt) => {
    colIndices.forEach((col, colAt) => {
      const field = single ? table[0][0] : table[rowAt]?.[colAt]
      if (field !== undefined) {
        entries.push({ row, col, value: parse(field, data.columns[col]) })
      }
    })
  })
  return setCellValues(data, entries)
}

// ---------------------------------------------------------------------------
// Conditions, sorting, filtering

function compareText(a: string, b: string) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
}

/** Orders two non-blank values numerically when both are numbers, else as text. */
function compareValues(a: CellValue, b: CellValue): number | null {
  const left = asNumber(a)
  const right = asNumber(b)
  if (left !== null && right !== null) {
    return left - right
  }
  // Text never orders against a number: `"x" > 3` is false, not a string compare.
  if (
    isEmptyValue(a) ||
    isEmptyValue(b) ||
    (left === null) !== (right === null)
  ) {
    return null
  }
  return compareText(String(a), String(b))
}

function isTrue(value: CellValue) {
  return (
    value === true ||
    (typeof value === "string" && value.toLowerCase() === "true")
  )
}

export function matchesCondition(
  value: CellValue,
  condition: GridCondition
): boolean {
  const { op } = condition
  if (op === "empty") return isEmptyValue(value)
  if (op === "notEmpty") return !isEmptyValue(value)
  if (op === "true") return isTrue(value)
  if (op === "false") return !isTrue(value)

  const target = condition.value ?? null
  const text = value === null ? "" : String(value).toLowerCase()
  const targetText = target === null ? "" : String(target).toLowerCase()
  if (op === "contains") return text.includes(targetText)
  if (op === "notContains") return !text.includes(targetText)
  if (op === "startsWith") return text.startsWith(targetText)
  if (op === "endsWith") return text.endsWith(targetText)
  if (op === "equals" || op === "notEquals") {
    const order = compareValues(value, target)
    const same = order === null ? text === targetText : order === 0
    return op === "equals" ? same : !same
  }
  if (op === "between") {
    const low = compareValues(value, target)
    const high = compareValues(value, condition.value2 ?? null)
    return low !== null && high !== null && low >= 0 && high <= 0
  }
  const order = compareValues(value, target)
  if (order === null) return false
  if (op === "gt") return order > 0
  if (op === "gte") return order >= 0
  if (op === "lt") return order < 0
  return order <= 0
}

/** The text a `values` filter lists for a value: blank is "". */
export function filterKey(value: CellValue): string {
  return value === null ? "" : String(value)
}

export function matchesFilter(value: CellValue, filter: GridFilter): boolean {
  if (filter.values && !filter.values.includes(filterKey(value))) {
    return false
  }
  return filter.condition ? matchesCondition(value, filter.condition) : true
}

/**
 * Marks rows the filters remove (1) by index, or null when nothing is
 * filtered. Frozen rows always stay. `ignore` leaves one column's filter out,
 * which is how a filter menu lists the values the other filters still allow.
 */
export function filteredOutRows(
  data: GridData,
  ignore?: ColId
): Uint8Array | null {
  const active = Object.entries(data.filters ?? {}).filter(
    ([colId]) => colId !== ignore
  )
  if (active.length === 0) {
    return null
  }
  const out = new Uint8Array(data.rows.length)
  data.rows.forEach((row, index) => {
    if (index < data.frozen.rows) {
      return
    }
    const record = data.cells[row.id]
    for (const [colId, filter] of active) {
      if (!matchesFilter(record?.[colId] ?? null, filter)) {
        out[index] = 1
        return
      }
    }
  })
  return out
}

/** A test for rows that are neither hidden nor filtered out. */
export function rowShownTest(data: GridData): (index: number) => boolean {
  const filtered = filteredOutRows(data)
  return (index) =>
    Boolean(data.rows[index]) && !data.rows[index].hidden && !filtered?.[index]
}

function sortKey(
  value: CellValue,
  column: GridColumn
): [number, number | string] {
  if (column.type === "select" && column.options) {
    const at = column.options.findIndex((option) => option.value === value)
    if (at >= 0) {
      return [0, at]
    }
  }
  if (typeof value === "boolean") {
    return [3, value ? 1 : 0]
  }
  const number = asNumber(value)
  return number !== null ? [1, number] : [2, String(value)]
}

/**
 * Sorts the rows below the frozen ones by a column, like Excel: the rows
 * move. Select columns sort by option order, then numbers, text, and
 * booleans. Blanks go last either way and ties keep their order. Returns a
 * `reorderRows` change with the full new order, plus `setSort`.
 */
export function sortRows(
  data: GridData,
  col: number,
  direction: SortDirection
): GridChange[] {
  const column = data.columns[col]
  if (!column) {
    return []
  }
  const start = Math.min(data.frozen.rows, data.rows.length)
  const body = data.rows.slice(start).map((row, at) => ({
    row,
    at,
    value: data.cells[row.id]?.[column.id] ?? null,
  }))
  const sign = direction === "asc" ? 1 : -1
  body.sort((a, b) => {
    const blankA = isEmptyValue(a.value)
    const blankB = isEmptyValue(b.value)
    if (blankA || blankB) {
      return blankA === blankB ? a.at - b.at : blankA ? 1 : -1
    }
    const [rankA, keyA] = sortKey(a.value, column)
    const [rankB, keyB] = sortKey(b.value, column)
    let order = rankA - rankB
    if (order === 0) {
      order =
        typeof keyA === "number" && typeof keyB === "number"
          ? keyA - keyB
          : compareText(String(keyA), String(keyB))
    }
    return order * sign || a.at - b.at
  })
  const ids = [
    ...data.rows.slice(0, start),
    ...body.map((item) => item.row),
  ].map((row) => row.id)
  const changes: GridChange[] = []
  if (ids.some((id, index) => data.rows[index].id !== id)) {
    changes.push({ type: "reorderRows", ids })
  }
  if (data.sort?.colId !== column.id || data.sort.direction !== direction) {
    changes.push({
      type: "setSort",
      sort: {
        colId: column.id,
        direction,
        unsortedOrder:
          data.sort?.unsortedOrder ?? data.rows.map((row) => row.id),
      },
    })
  }
  return changes
}

/**
 * Removes the sort and puts rows back in their pre-sort order. Rows added
 * while sorted stay right after the row they followed; deleted rows are skipped.
 */
export function clearSort(data: GridData): GridChange[] {
  if (!data.sort) {
    return []
  }
  const changes: GridChange[] = []
  const original = data.sort.unsortedOrder
  if (original) {
    const known = new Set(original)
    const present = new Set(data.rows.map((row) => row.id))
    const added = new Map<RowId | null, RowId[]>()
    let previous: RowId | null = null
    for (const row of data.rows) {
      if (known.has(row.id)) {
        previous = row.id
      } else {
        added.set(previous, [...(added.get(previous) ?? []), row.id])
      }
    }
    const ids = [...(added.get(null) ?? [])]
    for (const id of original) {
      if (present.has(id)) {
        ids.push(id, ...(added.get(id) ?? []))
      }
    }
    if (ids.some((id, index) => data.rows[index]?.id !== id)) {
      changes.push({ type: "reorderRows", ids })
    }
  }
  changes.push({ type: "setSort", sort: null })
  return changes
}

export function setFilter(
  data: GridData,
  colId: ColId,
  filter: GridFilter | null
): GridChange[] {
  const next =
    !filter || (filter.values === undefined && filter.condition === undefined)
      ? null
      : filter
  if (JSON.stringify(data.filters?.[colId] ?? null) === JSON.stringify(next)) {
    return []
  }
  return [{ type: "setFilter", colId, filter: next }]
}

// ---------------------------------------------------------------------------
// Conditional formatting

/** Tone names usable in `GridStyle` colors. Anything else passes through as CSS. */
export const GRID_TONES: Record<string, string> = {
  red: "oklch(0.637 0.237 25.331)",
  orange: "oklch(0.705 0.213 47.604)",
  amber: "oklch(0.769 0.188 70.08)",
  yellow: "oklch(0.795 0.184 86.047)",
  green: "oklch(0.723 0.219 149.579)",
  teal: "oklch(0.704 0.14 182.503)",
  blue: "oklch(0.623 0.214 259.815)",
  violet: "oklch(0.606 0.25 292.717)",
  pink: "oklch(0.656 0.241 354.308)",
  gray: "oklch(0.551 0.027 264.364)",
}

/** CSS for a style color: a tone becomes a tint (background) or the tone itself (text, border). */
export function resolveGridColor(
  color: string,
  role: "background" | "text"
): string {
  const tone = GRID_TONES[color]
  if (!tone) {
    return color
  }
  return role === "background"
    ? `color-mix(in oklab, ${tone} 24%, transparent)`
    : tone
}

/** Merges styles left to right; later fields win and `css` objects combine. */
export function mergeGridStyles(
  ...styles: (GridStyle | undefined)[]
): GridStyle | null {
  let merged: GridStyle | null = null
  for (const style of styles) {
    if (!style) {
      continue
    }
    const base: GridStyle = merged ?? {}
    const next: GridStyle = { ...base, ...style }
    if (base.css || style.css) {
      next.css = { ...base.css, ...style.css }
    }
    const className = [base.className, style.className].filter(Boolean)
    if (className.length > 0) {
      next.className = className.join(" ")
    }
    merged = next
  }
  return merged
}

/**
 * Builds a function that returns the merged rule style for a cell, or null.
 * Row and column tests are cached, so it stays cheap while scrolling.
 */
export function createStyleResolver(
  data: GridData,
  rules: GridFormatRule[]
): (row: number, col: number) => GridStyle | null {
  if (rules.length === 0) {
    return () => null
  }
  const rowSets = rules.map((rule) => (rule.rows ? new Set(rule.rows) : null))
  const colSets = rules.map((rule) =>
    rule.columns ? new Set(rule.columns) : null
  )
  const rowHits = rules.map(() => new Map<number, boolean>())
  const colHits = rules.map(() => new Map<ColId, boolean>())
  const allColumnIds = data.columns.map((column) => column.id)

  const passes = (rule: GridFormatRule, values: CellValue[]) => {
    const when = rule.when
    if (!when) {
      return true
    }
    return rule.match === "all"
      ? values.length > 0 &&
          values.every((value) => matchesCondition(value, when))
      : values.some((value) => matchesCondition(value, when))
  }

  return (row, col) => {
    const rowData = data.rows[row]
    const column = data.columns[col]
    if (!rowData || !column) {
      return null
    }
    const record = data.cells[rowData.id]
    const cellStyles: GridStyle[] = []
    const rowStyles: GridStyle[] = []
    const columnStyles: GridStyle[] = []

    rules.forEach((rule, at) => {
      const rowsOnly = rowSets[at]
      const columnsOnly = colSets[at]
      if (rowsOnly && !rowsOnly.has(rowData.id)) {
        return
      }
      if (rule.target === "cell") {
        if (columnsOnly && !columnsOnly.has(column.id)) {
          return
        }
        if (
          !rule.when ||
          matchesCondition(record?.[column.id] ?? null, rule.when)
        ) {
          cellStyles.push(rule.style)
        }
      } else if (rule.target === "row") {
        let hit = rowHits[at].get(row)
        if (hit === undefined) {
          hit = passes(
            rule,
            (rule.columns ?? allColumnIds).map((id) => record?.[id] ?? null)
          )
          rowHits[at].set(row, hit)
        }
        if (hit) {
          rowStyles.push(rule.style)
        }
      } else {
        if (columnsOnly && !columnsOnly.has(column.id)) {
          return
        }
        let hit = colHits[at].get(column.id)
        if (hit === undefined) {
          const values: CellValue[] = []
          for (const item of data.rows) {
            const value = data.cells[item.id]?.[column.id] ?? null
            if (!isEmptyValue(value) && (!rowsOnly || rowsOnly.has(item.id))) {
              values.push(value)
            }
          }
          hit = passes(rule, values)
          colHits[at].set(column.id, hit)
        }
        if (hit) {
          columnStyles.push(rule.style)
        }
      }
    })

    // Earlier rules win, so merge each group in reverse; then cell > row > column.
    return mergeGridStyles(
      ...columnStyles.reverse(),
      ...rowStyles.reverse(),
      ...cellStyles.reverse()
    )
  }
}

// ---------------------------------------------------------------------------
// Persistence

/**
 * Connects a grid to storage. `load` supplies the starting data, `save`
 * receives every change batch (user edits, undo, and redo) with the data after
 * it, and `subscribe` pushes changes made elsewhere into the grid.
 */
export type DataGridAdapter = {
  load?: () => GridData | null | Promise<GridData | null>
  save?: (changes: GridChange[], data: GridData) => void | Promise<void>
  subscribe?: (apply: (changes: GridChange[]) => void) => () => void
}

/** Keeps the whole grid in localStorage under `key`. */
export function createLocalStorageAdapter(key: string): DataGridAdapter {
  return {
    load() {
      try {
        const saved = window.localStorage.getItem(key)
        return saved ? (JSON.parse(saved) as GridData) : null
      } catch {
        return null
      }
    },
    save(_changes, data) {
      try {
        window.localStorage.setItem(key, JSON.stringify(data))
      } catch {
        // Storage full or blocked; the grid keeps working in memory.
      }
    },
  }
}
