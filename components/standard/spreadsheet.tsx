"use client"

import * as React from "react"
import { cn } from "cn"

import {
  createGridData,
  DataGrid,
  dataGridCellTypes,
  formatCellRef,
  formatRange,
  isEmptyValue,
  isFormulaText,
  normalizeRange,
  parseCellRef,
  type CellValue,
  type DataGridCellType,
  type DataGridEditMove,
  type DataGridEditorContext,
  type DataGridProps,
  type GridChange,
  type GridColumn,
  type GridData,
  type GridRange,
} from "@/components/standard/data-grid"
import {
  evaluatesFormula,
  evaluatesVariables,
  formatsCalcValue,
  tokenizesFormula,
  type CalcFunctions,
  type CalcResult,
  type CalcToken,
  type CalcValue,
  type CalcVariables,
} from "@/components/standard/input-calculator-model"

export * from "@/components/standard/data-grid"

/** Result of every formula cell, keyed by its A1 name ("D4"). */
export type SpreadsheetResults = Record<string, CalcResult>

type SheetOptions = {
  /** Named values formulas can use next to cell references, e.g. `{ taxRate: 0.08 }`. */
  variables?: CalcVariables
  /** Extra functions, or replacements for built-ins. Names ignore case. */
  functions?: CalcFunctions
}

/** Every filled cell as a variable named by its A1 reference, plus your own names. */
function sheetVariablesOf(data: GridData, variables?: CalcVariables) {
  const sheet: CalcVariables = { ...variables }
  data.rows.forEach((row, rowIndex) => {
    const cells = data.cells[row.id]
    if (!cells) return
    data.columns.forEach((column, colIndex) => {
      const value = cells[column.id]
      if (!isEmptyValue(value)) {
        sheet[formatCellRef({ row: rowIndex, col: colIndex })] = value as CalcValue
      }
    })
  })
  return sheet
}

/**
 * Works out every formula in the grid. Cells are named A1, B2… by their
 * position; text starting with "=" is a formula. No React: use it on a server
 * to read a sheet's totals.
 */
export function evaluatesSheet(
  data: GridData,
  { variables, functions }: SheetOptions = {}
): SpreadsheetResults {
  return evaluatesVariables({
    variables: sheetVariablesOf(data, variables),
    functions,
    references: true,
  })
}

// ---------------------------------------------------------------------------
// Cells

function formatsResult(value: CalcValue) {
  return typeof value === "number"
    ? value.toLocaleString("en-US", { maximumFractionDigits: 10 })
    : formatsCalcValue(value)
}

function displayOf(result: CalcResult | undefined, format: (value: CalcValue) => string) {
  if (!result || result.status === "empty") return ""
  return result.status === "ok" ? format(result.value) : result.error.code
}

function FormulaResult({
  result,
  format,
}: {
  result: CalcResult | undefined
  format: (value: CalcValue) => string
}) {
  if (!result || result.status === "empty") return null
  if (result.status === "error") {
    return (
      <span
        data-formula="error"
        title={result.error.message}
        className="ml-auto truncate font-medium text-destructive"
      >
        {result.error.code}
      </span>
    )
  }
  const { value } = result
  return (
    <span
      data-formula="ok"
      className={cn(
        "truncate",
        typeof value === "number" && "ml-auto tabular-nums",
        typeof value === "boolean" && "mx-auto"
      )}
    >
      {format(value)}
    </span>
  )
}

/** Colours for the formula editor's tokens. */
const TOKEN_CLASSES =
  "[&_[data-token=equals]]:text-muted-foreground [&_[data-token=number]]:text-sky-600 dark:[&_[data-token=number]]:text-sky-400 [&_[data-token=string]]:text-amber-600 dark:[&_[data-token=string]]:text-amber-400 [&_[data-token=boolean]]:text-violet-600 dark:[&_[data-token=boolean]]:text-violet-400 [&_[data-token=name]]:text-emerald-600 dark:[&_[data-token=name]]:text-emerald-400 [&_[data-token=function]]:font-semibold [&_[data-token=function]]:text-fuchsia-600 dark:[&_[data-token=function]]:text-fuchsia-400 [&_[data-token=operator]]:text-muted-foreground [&_[data-token=paren]]:text-muted-foreground"

/** Excel-style colours, one per distinct cell or range in the formula being edited. */
const REFERENCE_COLORS = [
  { text: "text-sky-600 dark:text-sky-400", box: "border-sky-500 bg-sky-500/10" },
  { text: "text-rose-600 dark:text-rose-400", box: "border-rose-500 bg-rose-500/10" },
  { text: "text-violet-600 dark:text-violet-400", box: "border-violet-500 bg-violet-500/10" },
  { text: "text-emerald-600 dark:text-emerald-400", box: "border-emerald-500 bg-emerald-500/10" },
  { text: "text-amber-600 dark:text-amber-400", box: "border-amber-500 bg-amber-500/10" },
  { text: "text-pink-600 dark:text-pink-400", box: "border-pink-500 bg-pink-500/10" },
  { text: "text-teal-600 dark:text-teal-400", box: "border-teal-500 bg-teal-500/10" },
]

type FormulaReference = GridRange & {
  color: number
  /** Start offsets of the tokens that spell it: `B2`, or `B2`, `:` and `C9`. */
  tokens: number[]
}

/** The cells and ranges a formula points at, each with its colour. */
function referencesIn(tokens: CalcToken[]): FormulaReference[] {
  const solid = tokens.filter((token) => token.type !== "space")
  const colors = new Map<string, number>()
  const found: FormulaReference[] = []

  for (let index = 0; index < solid.length; index += 1) {
    const token = solid[index]
    if (token.type !== "reference") continue
    const from = parseCellRef(token.text)
    if (!from) continue

    let to = from
    const starts = [token.start]
    const colon = solid[index + 1]
    const end = solid[index + 2]
    const endRef = colon?.type === "colon" && end?.type === "reference" ? parseCellRef(end.text) : null
    if (endRef) {
      to = endRef
      starts.push(colon.start, end.start)
      index += 2
    }

    const range = normalizeRange(from, to)
    const key = formatRange(range)
    if (!colors.has(key)) colors.set(key, colors.size % REFERENCE_COLORS.length)
    found.push({ ...range, color: colors.get(key)!, tokens: starts })
  }
  return found
}

/**
 * Holds the references of the formula being edited. Cells subscribe on their
 * own, so typing repaints the outlines without re-rendering the whole grid.
 */
function createsReferenceStore() {
  let references: FormulaReference[] = []
  const listeners = new Set<() => void>()
  return {
    get: () => references,
    set(next: FormulaReference[]) {
      if (next.length === 0 && references.length === 0) return
      references = next
      for (const listener of listeners) listener()
    },
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

type ReferenceStore = ReturnType<typeof createsReferenceStore>

const NO_REFERENCES: FormulaReference[] = []

/** A coloured outline on cells the edited formula points at; ranges get one box. */
function ReferenceOutline({
  store,
  row,
  col,
}: {
  store: ReferenceStore
  row: number
  col: number
}) {
  const references = React.useSyncExternalStore(store.subscribe, store.get, () => NO_REFERENCES)
  const hit = references.find(
    (range) =>
      row >= range.top && row <= range.bottom && col >= range.left && col <= range.right
  )
  if (!hit) return null

  return (
    <span
      aria-hidden
      data-formula-reference={formatRange(hit)}
      className={cn(
        "pointer-events-none absolute inset-0 border-0 border-dashed",
        REFERENCE_COLORS[hit.color].box,
        row === hit.top && "border-t-2",
        row === hit.bottom && "border-b-2",
        col === hit.left && "border-l-2",
        col === hit.right && "border-r-2"
      )}
    />
  )
}

function movesFrom(event: React.KeyboardEvent): DataGridEditMove | null {
  if (event.key === "Enter") return event.shiftKey ? "up" : "down"
  if (event.key === "Tab") return event.shiftKey ? "left" : "right"
  return null
}

/**
 * The grid's text editor, plus formula colouring and a live result under the
 * cell while the text starts with "=".
 */
function FormulaEditor({
  context,
  preview,
  format,
  store,
}: {
  context: DataGridEditorContext
  preview: (formula: string, ref: string) => CalcResult
  format: (value: CalcValue) => string
  store: ReferenceStore
}) {
  const [draft, setDraft] = React.useState(context.initialText ?? context.text)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const highlightRef = React.useRef<HTMLSpanElement>(null)
  const ref = formatCellRef({ row: context.rowIndex, col: context.colIndex })

  const draftRef = React.useRef(draft)
  React.useLayoutEffect(() => {
    draftRef.current = draft
  })
  const { register, commit, parse } = context
  React.useEffect(() => {
    register(() => commit(parse(draftRef.current), "none"))
    return () => register(null)
  }, [register, commit, parse])

  React.useLayoutEffect(() => {
    const input = inputRef.current
    if (!input) return
    input.focus({ preventScroll: true })
    input.setSelectionRange(input.value.length, input.value.length)
  }, [])

  const isFormula = isFormulaText(draft)
  const result = isFormula ? preview(draft, ref) : null
  const error = result?.status === "error" ? result.error : null
  const tokens = React.useMemo(
    () => (isFormulaText(draft) ? tokenizesFormula(draft) : []),
    [draft]
  )
  const references = React.useMemo(() => referencesIn(tokens), [tokens])
  const colorAt = new Map(
    references.flatMap((reference) => reference.tokens.map((start) => [start, reference.color]))
  )

  React.useEffect(() => store.set(references), [store, references])
  React.useEffect(() => () => store.set([]), [store])

  return (
    <>
      <div className="absolute inset-0 grid items-center bg-background">
        {isFormula ? (
          <span
            ref={highlightRef}
            aria-hidden
            className={cn(
              "pointer-events-none col-start-1 row-start-1 overflow-hidden px-2 text-sm whitespace-pre",
              TOKEN_CLASSES
            )}
          >
            {tokens.map((token) => (
              <span
                key={token.start}
                data-token={token.type}
                className={cn(
                  colorAt.has(token.start) && REFERENCE_COLORS[colorAt.get(token.start)!].text,
                  error &&
                    !error.incomplete &&
                    error.start !== undefined &&
                    error.end !== undefined &&
                    token.type !== "space" &&
                    token.start < error.end &&
                    token.end > error.start &&
                    "underline decoration-destructive decoration-wavy"
                )}
              >
                {token.text}
              </span>
            ))}
          </span>
        ) : null}
        <input
          ref={inputRef}
          data-grid-editor
          type="text"
          value={draft}
          spellCheck={false}
          autoComplete="off"
          aria-label={`Edit ${ref}`}
          aria-describedby={result ? `${ref}-formula-preview` : undefined}
          className={cn(
            "col-start-1 row-start-1 size-full min-w-0 bg-transparent px-2 text-sm outline-none",
            isFormula && "text-transparent caret-foreground",
            !isFormula && context.column.type === "number" && "text-right tabular-nums"
          )}
          onChange={(event) => setDraft(event.target.value)}
          onScroll={(event) => {
            if (highlightRef.current) {
              highlightRef.current.scrollLeft = event.currentTarget.scrollLeft
            }
          }}
          onBlur={() => commit(parse(draft), "none")}
          onKeyDown={(event) => {
            event.stopPropagation()
            const move = movesFrom(event)
            if (move) {
              event.preventDefault()
              commit(parse(draft), move)
            } else if (event.key === "Escape") {
              event.preventDefault()
              context.cancel()
            }
          }}
        />
      </div>
      {result && result.status !== "empty" ? (
        <div
          id={`${ref}-formula-preview`}
          role="status"
          className={cn(
            "pointer-events-none absolute top-full left-0 z-50 mt-1 max-w-72 truncate rounded-md bg-popover px-2 py-1 font-mono text-xs text-popover-foreground shadow-md ring-1 ring-foreground/10",
            error && !error.incomplete && "text-destructive"
          )}
        >
          {result.status === "ok"
            ? `= ${format(result.value)}`
            : error!.incomplete
              ? "…"
              : `${error!.code} ${error!.message}`}
        </div>
      ) : null}
    </>
  )
}

// ---------------------------------------------------------------------------
// Spreadsheet

export type SpreadsheetProps = DataGridProps &
  SheetOptions & {
    /** Display text for formula results. Numbers default to en-US grouping. */
    formatResult?: (value: CalcValue) => string
    /** Every formula's result, after each change. */
    onResults?: (results: SpreadsheetResults) => void
  }

/**
 * A Data Grid whose cells take formulas: type `=SUM(B2:B9)` or `=B2 * $C$1`
 * and the cell shows the result, recalculated as other cells change. Cells
 * are named by position (A1, B2…), dragging the fill handle moves relative
 * references, and the value bar shows the formula behind the active cell.
 * Everything else (undo, copy and paste, sort, adapters) is the Data Grid.
 */
export function Spreadsheet({
  value,
  defaultValue,
  onValueChange,
  cellTypes,
  variables,
  functions,
  formatResult = formatsResult,
  onResults,
  label = "Spreadsheet",
  ...props
}: SpreadsheetProps) {
  // The grid owns editing; this mirror only feeds the formulas.
  const [initial] = React.useState(
    () => defaultValue ?? createGridData({ columns: 8, rows: 40 })
  )
  const [mirror, setMirror] = React.useState(initial)
  const data = value ?? mirror
  const [references] = React.useState(createsReferenceStore)

  const sheetVariables = React.useMemo(
    () => sheetVariablesOf(data, variables),
    [data, variables]
  )
  const results = React.useMemo(
    () => evaluatesVariables({ variables: sheetVariables, functions, references: true }),
    [sheetVariables, functions]
  )

  const onResultsRef = React.useRef(onResults)
  React.useEffect(() => {
    onResultsRef.current = onResults
  })
  React.useEffect(() => {
    onResultsRef.current?.(results)
  }, [results])

  const preview = React.useCallback(
    (formula: string, ref: string) =>
      evaluatesFormula(formula, {
        variables: { ...sheetVariables, [ref]: formula },
        functions,
        references: true,
      }),
    [sheetVariables, functions]
  )

  const types = React.useMemo(() => {
    // fitWidth has no cell position, so it sizes a formula by its latest result.
    const displayByFormula = new Map<string, string>()
    for (const result of Object.values(results)) {
      displayByFormula.set(result.formula, displayOf(result, formatResult))
    }

    const wrapped: Record<string, DataGridCellType> = {}
    for (const [name, type] of Object.entries({ ...dataGridCellTypes, ...cellTypes })) {
      const plain = (value: CellValue, column: GridColumn) =>
        type.format ? type.format(value, column) : value === null ? "" : String(value)
      // Text-like types get the formula editor; select, date and custom editors keep theirs.
      const takesFormulas = type.edit === undefined || name === "number"

      wrapped[name] = {
        ...type,
        render: (context) => {
          const ref = formatCellRef({ row: context.rowIndex, col: context.colIndex })
          const content = isFormulaText(context.value) ? (
            <FormulaResult result={results[ref]} format={formatResult} />
          ) : type.render ? (
            type.render(context)
          ) : (
            <span className="truncate">{plain(context.value, context.column)}</span>
          )
          return (
            <>
              {content}
              <ReferenceOutline store={references} row={context.rowIndex} col={context.colIndex} />
            </>
          )
        },
        edit: takesFormulas
          ? (context) => (
              <FormulaEditor
                context={context}
                preview={preview}
                format={formatResult}
                store={references}
              />
            )
          : type.edit,
        fitWidth: (context) => {
          if (isFormulaText(context.value)) {
            return context.measure(displayByFormula.get(context.value) ?? context.text) + 17
          }
          return type.fitWidth ? type.fitWidth(context) : context.measure(context.text) + 17
        },
      }
    }
    return wrapped
  }, [cellTypes, results, formatResult, preview, references])

  const handlesValueChange = (next: GridData, changes: GridChange[]) => {
    if (value === undefined) setMirror(next)
    onValueChange?.(next, changes)
  }

  return (
    <DataGrid
      {...props}
      data-slot="spreadsheet"
      label={label}
      value={value}
      defaultValue={value === undefined ? initial : undefined}
      onValueChange={handlesValueChange}
      cellTypes={types}
    />
  )
}
