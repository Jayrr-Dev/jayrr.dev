"use client"

import * as React from "react"
import { BracesIcon, ChevronRightIcon } from "lucide-react"
import { cn } from "cn"

import {
  DisplayCopyAction,
  DisplayFrame,
  DisplaySwitch,
} from "@/components/standard/display-frame"

/**
 * JSON as a collapsible tree: keys, typed and colored values, item counts
 * on collapsed nodes, and a Tree / Raw switch with expand and collapse all.
 * Pass a value as `data`, or JSON text as `value`; text that doesn't parse
 * shows the parser's error over the raw text.
 *
 * <JsonDisplay data={response} title="GET /api/user" />
 * <JsonDisplay value={text} expandDepth={2} maxHeight={320} />
 */

type JsonValue =
  string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }
type JsonView = "tree" | "raw"

const valueClass = {
  string: "text-emerald-700 dark:text-emerald-400",
  number: "text-sky-700 dark:text-sky-400",
  boolean: "text-violet-700 dark:text-violet-400",
  null: "text-muted-foreground italic",
}

function isBranch(
  value: unknown
): value is JsonValue[] | Record<string, JsonValue> {
  return typeof value === "object" && value !== null
}

function Leaf({ value }: { value: unknown }) {
  if (value === null || value === undefined)
    return <span className={valueClass.null}>null</span>
  if (typeof value === "string") {
    return (
      <span className={cn(valueClass.string, "break-all whitespace-pre-wrap")}>
        {JSON.stringify(value)}
      </span>
    )
  }
  if (typeof value === "number")
    return <span className={valueClass.number}>{String(value)}</span>
  if (typeof value === "boolean")
    return <span className={valueClass.boolean}>{String(value)}</span>
  return <span className="text-muted-foreground">{String(value)}</span>
}

function Node({
  name,
  value,
  level,
  openDepth,
  last,
}: {
  name?: string | number
  value: unknown
  level: number
  openDepth: number
  last: boolean
}) {
  const [open, setOpen] = React.useState(level < openDepth)
  const comma = last ? null : <span className="text-muted-foreground">,</span>
  const label =
    name === undefined ? null : (
      <>
        {typeof name === "number" ? (
          <span className="text-muted-foreground">{name}</span>
        ) : (
          <span className="text-rose-700 dark:text-rose-400">
            {JSON.stringify(name)}
          </span>
        )}
        <span className="text-muted-foreground">: </span>
      </>
    )

  if (!isBranch(value)) {
    return (
      <div className="pl-5">
        {label}
        <Leaf value={value} />
        {comma}
      </div>
    )
  }

  const isArray = Array.isArray(value)
  const entries: [string | number, unknown][] = isArray
    ? value.map((item, index) => [index, item])
    : Object.entries(value)
  const [openBracket, closeBracket] = isArray ? ["[", "]"] : ["{", "}"]
  const count = `${entries.length} ${isArray ? (entries.length === 1 ? "item" : "items") : entries.length === 1 ? "key" : "keys"}`

  if (entries.length === 0) {
    return (
      <div className="pl-5">
        {label}
        <span className="text-muted-foreground">
          {openBracket}
          {closeBracket}
        </span>
        {comma}
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="group/row flex w-full items-start rounded-sm text-left outline-none hover:bg-muted/60 focus-visible:bg-muted"
      >
        <ChevronRightIcon
          aria-hidden
          className={cn(
            "mt-0.75 mr-1 size-4 shrink-0 text-muted-foreground transition-transform duration-150",
            open && "rotate-90"
          )}
        />
        <span className="min-w-0">
          {label}
          <span className="text-muted-foreground">{openBracket}</span>
          {open ? null : (
            <>
              <span className="mx-1 rounded bg-muted px-1 text-[0.85em] text-muted-foreground">
                {count}
              </span>
              <span className="text-muted-foreground">{closeBracket}</span>
              {comma}
            </>
          )}
        </span>
      </button>
      {open ? (
        <>
          <div className="ml-2 border-l border-border pl-2.5">
            {entries.map(([key, item], index) => (
              <Node
                key={key}
                name={isArray ? index : key}
                value={item}
                level={level + 1}
                openDepth={openDepth}
                last={index === entries.length - 1}
              />
            ))}
          </div>
          <div className="pl-5">
            <span className="text-muted-foreground">{closeBracket}</span>
            {comma}
          </div>
        </>
      ) : null}
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

function JsonDisplay({
  className,
  data,
  value,
  title,
  expandDepth = 1,
  maxHeight = 360,
  bare = false,
  ...props
}: Omit<React.ComponentProps<"figure">, "title" | "children"> & {
  /** Any JSON-safe value. */
  data?: unknown
  /** JSON text; used when `data` is not given. */
  value?: string
  title?: string
  /** Levels open at first. 0 starts fully collapsed. */
  expandDepth?: number
  /** Scroll the body past this height. */
  maxHeight?: number | string
  bare?: boolean
}) {
  const parsed = React.useMemo(
    () =>
      data !== undefined
        ? ({ ok: true, data } as const)
        : parse(value ?? "null"),
    [data, value]
  )
  const raw = React.useMemo(
    () =>
      parsed.ok
        ? (JSON.stringify(parsed.data, null, 2) ?? "undefined")
        : (value ?? ""),
    [parsed, value]
  )
  const [view, setView] = React.useState<JsonView>("tree")
  // Remounting the tree with a new depth is what expand and collapse all do.
  const [tree, setTree] = React.useState({ depth: expandDepth, generation: 0 })

  const summary = parsed.ok
    ? Array.isArray(parsed.data)
      ? `${parsed.data.length} items`
      : isBranch(parsed.data)
        ? `${Object.keys(parsed.data).length} keys`
        : typeof parsed.data
    : "Invalid"

  return (
    <DisplayFrame
      data-kind="json"
      bare={bare}
      icon={<BracesIcon />}
      title={title ?? "JSON"}
      meta={summary}
      actions={<DisplayCopyAction text={raw} label="Copy JSON" />}
      toolbar={
        parsed.ok ? (
          <>
            <DisplaySwitch
              label="View"
              value={view}
              onValueChange={setView}
              options={[
                { value: "tree", label: "Tree" },
                { value: "raw", label: "Raw" },
              ]}
            />
            {view === "tree" && isBranch(parsed.data) ? (
              <div className="ml-auto flex items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() =>
                    setTree(({ generation }) => ({
                      depth: Infinity,
                      generation: generation + 1,
                    }))
                  }
                  className="rounded-md px-1.5 py-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  Expand all
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setTree(({ generation }) => ({
                      depth: 1,
                      generation: generation + 1,
                    }))
                  }
                  className="rounded-md px-1.5 py-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  Collapse all
                </button>
              </div>
            ) : null}
          </>
        ) : undefined
      }
      className={className}
      {...props}
    >
      <div
        className="overflow-auto p-3 font-mono text-[13px] leading-6"
        style={{ maxHeight }}
      >
        {!parsed.ok ? (
          <>
            <p className="mb-2 rounded-md bg-destructive/10 px-2 py-1 font-sans text-xs text-destructive">
              {parsed.message}
            </p>
            <pre className="m-0 whitespace-pre-wrap text-muted-foreground">
              {raw}
            </pre>
          </>
        ) : view === "raw" ? (
          <pre className="m-0 whitespace-pre-wrap">{raw}</pre>
        ) : (
          <div key={tree.generation} className="-ml-1">
            <Node value={parsed.data} level={0} openDepth={tree.depth} last />
          </div>
        )}
      </div>
    </DisplayFrame>
  )
}

export { JsonDisplay }
export type { JsonValue }
