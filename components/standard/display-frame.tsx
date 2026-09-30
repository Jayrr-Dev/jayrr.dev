"use client"

import * as React from "react"
import {
  CheckIcon,
  CopyIcon,
  DownloadIcon,
  ExternalLinkIcon,
} from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"

/**
 * The shared chrome for the Display pieces: a header with an icon, a title,
 * a line of meta and a row of actions, over a body that holds the content.
 *
 * <DisplayFrame icon={<FileTextIcon />} title="report.pdf" meta="PDF"
 *   actions={<DisplayOpenAction href={url} />}>
 *   …
 * </DisplayFrame>
 */
function DisplayFrame({
  className,
  icon,
  title,
  meta,
  actions,
  toolbar,
  bare = false,
  children,
  ...props
}: Omit<React.ComponentProps<"figure">, "title"> & {
  icon?: React.ReactNode
  title?: React.ReactNode
  /** A short line beside the title: a format, a size, dimensions. */
  meta?: React.ReactNode
  /** Buttons at the end of the header. */
  actions?: React.ReactNode
  /** A second row under the header, for view switches and zoom. */
  toolbar?: React.ReactNode
  /** Drop the border and header; the body alone. */
  bare?: boolean
}) {
  const hasHeader = !bare && (icon || title || meta || actions)

  return (
    <figure
      data-slot="display"
      data-bare={bare || undefined}
      className={cn(
        "m-0 flex w-full min-w-0 flex-col overflow-hidden",
        !bare && "rounded-lg border border-border bg-background",
        className
      )}
      {...props}
    >
      {hasHeader ? (
        <figcaption
          data-slot="display-header"
          className="flex min-h-10 items-center gap-2 border-b border-border py-1 pr-1 pl-3"
        >
          {icon ? (
            <span
              aria-hidden
              className="flex shrink-0 text-muted-foreground [&_svg:not([class*='size-'])]:size-4"
            >
              {icon}
            </span>
          ) : null}
          <span className="flex min-w-0 flex-1 items-baseline gap-2">
            {title ? (
              <span className="truncate text-sm font-medium">{title}</span>
            ) : null}
            {meta ? (
              <span className="shrink-0 truncate text-xs text-muted-foreground tabular-nums">
                {meta}
              </span>
            ) : null}
          </span>
          {actions ? (
            <span
              data-slot="display-actions"
              className="flex shrink-0 items-center"
            >
              {actions}
            </span>
          ) : null}
        </figcaption>
      ) : null}
      {toolbar && !bare ? (
        <div
          data-slot="display-toolbar"
          className="flex min-h-9 flex-wrap items-center gap-1 border-b border-border bg-muted/30 px-2 py-1"
        >
          {toolbar}
        </div>
      ) : null}
      <div data-slot="display-body" className="relative min-h-0 min-w-0 flex-1">
        {children}
      </div>
    </figure>
  )
}

/** An icon button for a display header. */
function DisplayAction({
  label,
  className,
  ...props
}: React.ComponentProps<typeof Button> & { label: string }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      title={label}
      className={cn("text-muted-foreground hover:text-foreground", className)}
      {...props}
    />
  )
}

/** Opens `href` in a new tab. */
function DisplayOpenAction({
  href,
  label = "Open in new tab",
}: {
  href: string
  label?: string
}) {
  return (
    <DisplayAction label={label} asChild>
      <a href={href} target="_blank" rel="noopener noreferrer">
        <ExternalLinkIcon />
      </a>
    </DisplayAction>
  )
}

/** Downloads `href`, saved as `filename` when the browser allows it. */
function DisplayDownloadAction({
  href,
  filename,
  label = "Download",
}: {
  href: string
  filename?: string
  label?: string
}) {
  return (
    <DisplayAction label={label} asChild>
      <a href={href} download={filename ?? true}>
        <DownloadIcon />
      </a>
    </DisplayAction>
  )
}

/** Copies `text` (or what it returns) to the clipboard. */
function DisplayCopyAction({
  text,
  label = "Copy",
}: {
  text: string | (() => string)
  label?: string
}) {
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (!copied) return
    const timeout = window.setTimeout(() => setCopied(false), 1500)
    return () => window.clearTimeout(timeout)
  }, [copied])

  return (
    <DisplayAction
      label={copied ? "Copied" : label}
      onClick={() => {
        const value = typeof text === "function" ? text() : text
        void navigator.clipboard?.writeText(value).then(() => setCopied(true))
      }}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </DisplayAction>
  )
}

/** A two-or-more way switch for a display toolbar, e.g. Preview / Code. */
function DisplaySwitch<T extends string>({
  value,
  onValueChange,
  options,
  label,
}: {
  value: T
  onValueChange: (value: T) => void
  options: readonly { value: T; label: string; disabled?: boolean }[]
  label: string
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex rounded-md bg-muted p-0.5"
    >
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={option.disabled}
            onClick={() => onValueChange(option.value)}
            className={cn(
              "rounded-[5px] px-2 py-0.5 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-40",
              selected
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

/** The last path segment of a URL, without its query or hash. */
function fileNameFrom(src: string | undefined) {
  if (!src || src.startsWith("data:") || src.startsWith("blob:"))
    return undefined
  const path = src.split(/[?#]/)[0]
  const name = path.slice(path.lastIndexOf("/") + 1)
  try {
    return decodeURIComponent(name) || undefined
  } catch {
    return name || undefined
  }
}

/** m:ss, or h:mm:ss past an hour. */
function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00"
  const whole = Math.floor(seconds)
  const h = Math.floor(whole / 3600)
  const m = Math.floor((whole % 3600) / 60)
  const s = String(whole % 60).padStart(2, "0")
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`
}

export {
  DisplayFrame,
  DisplayAction,
  DisplayOpenAction,
  DisplayDownloadAction,
  DisplayCopyAction,
  DisplaySwitch,
  fileNameFrom,
  formatDuration,
}
