"use client"

import * as React from "react"
import { CheckIcon } from "lucide-react"
import { cn } from "cn"

import { Badge } from "@/components/standard/badge"
import { Checkbox } from "@/components/standard/checkbox"
import {
  formatCellRef,
  isEmptyValue,
  type CellValue,
  type GridColumn,
  type GridRow,
} from "@/components/standard/data-grid-model"

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
export const CELL_CHROME = 17

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

export function formatsPlain(value: CellValue) {
  return value === null ? "" : String(value)
}

export function useRegistersEditor(
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

export function keyMove(event: React.KeyboardEvent): DataGridEditMove | null {
  if (event.key === "Enter") {
    return event.shiftKey ? "up" : "down"
  }
  if (event.key === "Tab") {
    return event.shiftKey ? "left" : "right"
  }
  return null
}

export function TextEditor({
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

export function SelectEditor({ context }: { context: DataGridEditorContext }) {
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

export const TRUE_TEXT = /^(true|yes|y|1|x|on|✓)$/i
export const utcDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
})

export function parsesDate(text: string): CellValue {
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
