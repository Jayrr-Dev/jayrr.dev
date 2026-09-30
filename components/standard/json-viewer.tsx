"use client"

import * as React from "react"
import { BracesIcon } from "lucide-react"
import { cn } from "cn"

import {
  DisplayCopyAction,
  DisplayFrame,
  DisplaySwitch,
} from "@/components/standard/display-frame"

/**
 * An interactive JSON explorer laid out on CSS grid, after Ben Nadel's
 * Angular explorer: every entry is a label cell and a value cell, objects
 * and arrays nest as boxed grids under a type header, and clicking any
 * label collapses its value without shifting the rest of the layout.
 * Strings holding JSON can be parsed in place, the path of the hovered
 * entry shows in the footer, and `editable` adds an Input view for pasting
 * JSON to explore.
 *
 * <JsonViewer data={response} title="GET /api/user" />
 * <JsonViewer value={text} editable expandDepth={2} />
 */

type JsonViewerView = "explore" | "input"
type PathPart = string | number

const valueClass = {
  string: "text-emerald-700 dark:text-emerald-400",
  number: "text-sky-700 dark:text-sky-400",
  boolean: "text-violet-700 dark:text-violet-400",
  null: "text-muted-foreground italic",
}

const PathContext = React.createContext<(path: PathPart[] | null) => void>(
  () => {}
)

function isBranch(value: unknown): value is object {
  return typeof value === "object" && value !== null
}

function typeOf(value: unknown) {
  if (value === null || value === undefined) return "Null"
  if (Array.isArray(value)) return "Array"
  if (typeof value === "object") return "Object"
  return typeof value === "string"
    ? "String"
    : typeof value === "number"
      ? "Number"
      : "Boolean"
}

/** `$.address.geo[0]["first name"]` */
function formatPath(path: PathPart[]) {
  return path.reduce<string>((text, part) => {
    if (typeof part === "number") return `${text}[${part}]`
    return /^[A-Za-z_$][\w$]*$/.test(part)
      ? `${text}.${part}`
      : `${text}[${JSON.stringify(part)}]`
  }, "$")
}

/** A string worth offering to parse: one that holds an object or array. */
function parseEmbedded(text: string): object | undefined {
  const trimmed = text.trim()
  if (!/^[[{]/.test(trimmed)) return undefined
  try {
    const parsed: unknown = JSON.parse(trimmed)
    return isBranch(parsed) ? parsed : undefined
  } catch {
    return undefined
  }
}

function summaryOf(value: unknown) {
  if (Array.isArray(value)) return `[ ${value.length} ]`
  if (isBranch(value)) return `{ ${Object.keys(value).length} }`
  if (typeof value === "string")
    return JSON.stringify(value.length > 24 ? `${value.slice(0, 24)}…` : value)
  return String(value ?? null)
}

function Primitive({
  value,
  path,
  openDepth,
}: {
  value: unknown
  path: PathPart[]
  openDepth: number
}) {
  const [parsed, setParsed] = React.useState<object | undefined>()
  const embedded = React.useMemo(
    () => (typeof value === "string" ? parseEmbedded(value) : undefined),
    [value]
  )

  if (parsed) {
    return (
      <div className="flex min-w-0 flex-col items-start gap-1">
        <button
          type="button"
          onClick={() => setParsed(undefined)}
          className="rounded bg-muted px-1.5 font-sans text-[11px] text-muted-foreground hover:text-foreground"
        >
          Parsed string · show text
        </button>
        <Branch value={parsed} path={path} level={0} openDepth={openDepth} />
      </div>
    )
  }

  if (value === null || value === undefined)
    return <span className={valueClass.null}>null</span>
  if (typeof value === "string") {
    return (
      <span className="min-w-0">
        <span
          className={cn(valueClass.string, "break-words whitespace-pre-wrap")}
        >
          {JSON.stringify(value)}
        </span>
        {embedded ? (
          <button
            type="button"
            onClick={() => setParsed(embedded)}
            className="ml-1.5 rounded bg-muted px-1.5 align-[1px] font-sans text-[11px] text-muted-foreground hover:text-foreground"
          >
            Parse JSON
          </button>
        ) : null}
      </span>
    )
  }
  if (typeof value === "number")
    return <span className={valueClass.number}>{String(value)}</span>
  if (typeof value === "boolean")
    return <span className={valueClass.boolean}>{String(value)}</span>
  return <span className="text-muted-foreground">{String(value)}</span>
}

function Entry({
  name,
  value,
  path,
  level,
  openDepth,
}: {
  name: PathPart
  value: unknown
  path: PathPart[]
  level: number
  openDepth: number
}) {
  const setPath = React.useContext(PathContext)
  // Primitives start open; the root box counts as the first open level.
  const [open, setOpen] = React.useState(
    !isBranch(value) || level + 1 < openDepth
  )

  return (
    // `contents` puts the label and value straight into the parent grid, so
    // a collapsed value frees its cell without moving any other row.
    <div
      className="contents"
      // The deepest entry under the pointer wins, so stop at the first one.
      onPointerOver={(event) => {
        event.stopPropagation()
        setPath(path)
      }}
      onFocus={(event) => {
        event.stopPropagation()
        setPath(path)
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "self-start rounded-sm px-1.5 text-left break-words outline-none hover:bg-muted focus-visible:bg-muted",
          typeof name === "number"
            ? "text-muted-foreground"
            : "text-rose-700 dark:text-rose-400",
          !open && "opacity-60"
        )}
      >
        {name}
      </button>
      <div className="self-start">
        {!open ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-sm bg-muted/70 px-1.5 text-muted-foreground hover:text-foreground"
          >
            {summaryOf(value)}
          </button>
        ) : isBranch(value) ? (
          <Branch
            value={value}
            path={path}
            level={level + 1}
            openDepth={openDepth}
          />
        ) : (
          <Primitive value={value} path={path} openDepth={openDepth} />
        )}
      </div>
    </div>
  )
}

function Branch({
  value,
  path,
  level,
  openDepth,
}: {
  value: object
  path: PathPart[]
  level: number
  openDepth: number
}) {
  const isArray = Array.isArray(value)
  const entries: [PathPart, unknown][] = isArray
    ? (value as unknown[]).map((item, index) => [index, item])
    : Object.entries(value)
  const type = typeOf(value)

  return (
    <div className="inline-flex flex-col rounded-md border border-border align-top">
      <div className="flex items-baseline gap-1.5 rounded-t-md border-b border-border bg-muted/40 px-1.5 font-sans text-[11px] leading-5">
        <span className="font-medium text-foreground">{type}</span>
        <span className="text-muted-foreground tabular-nums">
          {entries.length} {isArray ? "items" : "keys"}
        </span>
      </div>
      {entries.length === 0 ? (
        <span className="px-1.5 text-muted-foreground">
          {isArray ? "[ ]" : "{ }"}
        </span>
      ) : (
        <div className="grid grid-cols-[auto_minmax(min-content,1fr)] gap-x-1 gap-y-0.5 py-1 pr-1.5">
          {entries.map(([key, item]) => (
            <Entry
              key={key}
              name={key}
              value={item}
              path={[...path, key]}
              level={level}
              openDepth={openDepth}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function parse(
  text: string
): { ok: true; data: unknown } | { ok: false; message: string } {
  try {
    return { ok: true, data: JSON.parse(text) }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Invalid JSON",
    }
  }
}

function JsonViewer({
  className,
  data,
  value,
  defaultValue,
  onValueChange,
  title,
  editable = false,
  expandDepth = 3,
  maxHeight = 420,
  bare = false,
  ...props
}: Omit<
  React.ComponentProps<"figure">,
  "title" | "children" | "defaultValue"
> & {
  /** Any JSON-safe value. */
  data?: unknown
  /** JSON text, controlled; used when `data` is not given. */
  value?: string
  /** JSON text to start from when uncontrolled. */
  defaultValue?: string
  /** Called with the text typed in the Input view. */
  onValueChange?: (value: string) => void
  title?: string
  /** Add an Input view for pasting or editing the JSON. */
  editable?: boolean
  /** Levels open at first. 1 shows only the top-level keys. */
  expandDepth?: number
  /** Scroll the body past this height. */
  maxHeight?: number | string
  bare?: boolean
}) {
  const [draft, setDraft] = React.useState(
    () =>
      value ??
      defaultValue ??
      (data !== undefined ? JSON.stringify(data, null, 2) : "null")
  )
  const text = value ?? draft
  const parsed = React.useMemo(
    () =>
      data !== undefined && !editable
        ? ({ ok: true, data } as const)
        : parse(text),
    [data, editable, text]
  )
  const raw = React.useMemo(
    () => (parsed.ok ? (JSON.stringify(parsed.data, null, 2) ?? "null") : text),
    [parsed, text]
  )
  const [view, setView] = React.useState<JsonViewerView>("explore")
  const [hovered, setHovered] = React.useState<PathPart[] | null>(null)
  // Remounting the tree with a new depth is what expand and collapse all do.
  const [tree, setTree] = React.useState({ depth: expandDepth, generation: 0 })
  const reset = (depth: number) =>
    setTree(({ generation }) => ({ depth, generation: generation + 1 }))

  // Paths inside a string parsed in place don't resolve against the data.
  const hoveredValue =
    parsed.ok && hovered
      ? hovered.reduce<unknown>(
          (node, part) =>
            isBranch(node)
              ? (node as Record<PathPart, unknown>)[part]
              : undefined,
          parsed.data
        )
      : undefined
  const hoveredType =
    hoveredValue === undefined ? undefined : typeOf(hoveredValue)

  const summary = parsed.ok
    ? isBranch(parsed.data)
      ? Array.isArray(parsed.data)
        ? `${parsed.data.length} items`
        : `${Object.keys(parsed.data).length} keys`
      : typeOf(parsed.data).toLowerCase()
    : "Invalid"

  const toolbarButton =
    "rounded-md px-1.5 py-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"

  return (
    <DisplayFrame
      data-kind="json-viewer"
      bare={bare}
      icon={<BracesIcon />}
      title={title ?? "JSON Viewer"}
      meta={summary}
      actions={<DisplayCopyAction text={raw} label="Copy JSON" />}
      toolbar={
        <>
          {editable ? (
            <DisplaySwitch
              label="View"
              value={view}
              onValueChange={setView}
              options={[
                { value: "explore", label: "Explore" },
                { value: "input", label: "Input" },
              ]}
            />
          ) : null}
          {view === "explore" && parsed.ok && isBranch(parsed.data) ? (
            <div className="ml-auto flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => reset(Infinity)}
                className={toolbarButton}
              >
                Expand all
              </button>
              <button
                type="button"
                onClick={() => reset(1)}
                className={toolbarButton}
              >
                Collapse all
              </button>
            </div>
          ) : null}
        </>
      }
      className={className}
      {...props}
    >
      {view === "input" ? (
        <div className="flex flex-col" style={{ maxHeight }}>
          {!parsed.ok ? (
            <p className="m-2 mb-0 rounded-md bg-destructive/10 px-2 py-1 text-xs text-destructive">
              {parsed.message}
            </p>
          ) : null}
          <textarea
            aria-label="JSON input"
            spellCheck={false}
            value={text}
            onChange={(event) => {
              setDraft(event.target.value)
              onValueChange?.(event.target.value)
            }}
            className="min-h-48 flex-1 resize-y bg-transparent p-3 font-mono text-[13px] leading-6 outline-none"
            style={{ maxHeight }}
          />
        </div>
      ) : (
        <>
          <div
            className="overflow-auto p-3 font-mono text-[13px] leading-6"
            style={{ maxHeight }}
            onPointerLeave={() => setHovered(null)}
          >
            {!parsed.ok ? (
              <>
                <p className="mb-2 rounded-md bg-destructive/10 px-2 py-1 font-sans text-xs text-destructive">
                  {parsed.message}
                </p>
                <pre className="m-0 whitespace-pre-wrap text-muted-foreground">
                  {text}
                </pre>
              </>
            ) : (
              <PathContext.Provider value={setHovered}>
                <div key={tree.generation} className="min-w-0">
                  {isBranch(parsed.data) ? (
                    <Branch
                      value={parsed.data}
                      path={[]}
                      level={0}
                      openDepth={tree.depth}
                    />
                  ) : (
                    <Primitive
                      value={parsed.data}
                      path={[]}
                      openDepth={tree.depth}
                    />
                  )}
                </div>
              </PathContext.Provider>
            )}
          </div>
          {parsed.ok && isBranch(parsed.data) ? (
            <div className="flex min-h-8 items-center gap-2 border-t border-border bg-muted/30 px-3 font-mono text-xs text-muted-foreground">
              <span className="min-w-0 flex-1 truncate" aria-live="polite">
                {hovered ? formatPath(hovered) : "$"}
              </span>
              {hoveredType ? (
                <span className="shrink-0 font-sans">{hoveredType}</span>
              ) : null}
            </div>
          ) : null}
        </>
      )}
    </DisplayFrame>
  )
}

export { JsonViewer }
