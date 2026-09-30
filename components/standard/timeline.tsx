"use client"

import * as React from "react"
import { cn } from "cn"

/**
 * A list of events along a line. Each entry takes elements, not just text:
 * a badge, a date, a title with trailing badges, a description, any extra
 * content and a custom marker, all `ReactNode`s. Runs down the page or across
 * it, with content on one side or alternating, and the date beside the
 * content or across the line.
 *
 * Give entries an `at` date and the timeline reads time: `spacing="time"`
 * spreads entries by the gap between them, `line="auto"` draws short gaps
 * solid, longer ones dashed and long ones dotted, `showGaps` labels each gap
 * ("1m 3w"), and `groupBy` adds a heading per day, month or year. Mark one
 * entry `current` and the ones after it read as upcoming.
 *
 * <Timeline items={entries} />
 * <Timeline items={entries} side="alternate" markers="number" connector="dashed" />
 * <Timeline items={events} spacing="time" line="auto" showGaps groupBy="month" />
 *
 * Or compose it:
 *
 * <Timeline>
 *   <TimelineHeading>2026</TimelineHeading>
 *   <TimelineItem at="2026-01-12" title="Founded" marker={<RocketIcon />} />
 *   <TimelineItem at="2026-03-02" title="First product" current>…</TimelineItem>
 * </Timeline>
 */

/** A Date, a timestamp, or a string; "YYYY-MM-DD" reads as a local date. */
type TimelineDate = Date | string | number

type TimelineEntry = {
  id: string
  /** A pill above the rest, tinted with the entry's color. */
  badge?: React.ReactNode
  /** Shown as the date. Formatted from `at` when left out. */
  date?: React.ReactNode
  /** When it happened. Drives time spacing, gap lines, gap labels and grouping. */
  at?: TimelineDate
  title?: React.ReactNode
  /** Beside the title, like a status badge or an icon with a tooltip. */
  trailing?: React.ReactNode
  description?: React.ReactNode
  /** Anything else, under the description. */
  content?: React.ReactNode
  /** Shown inside a ring marker, like an icon or a number. */
  marker?: React.ReactNode
  /** Accent for the marker, badge and date; any CSS color. */
  color?: string
  /** The entry in progress. Its marker fills in; the ones after it read as upcoming. */
  current?: boolean
}

type TimelineOrientation = "vertical" | "horizontal"

/**
 * Which side of the line the content goes on. `before` is left of a vertical
 * line or above a horizontal one; `alternate` starts before.
 */
type TimelineSide = "before" | "after" | "alternate"

type TimelineMarkers = "dot" | "ring" | "number" | "none"

/** `auto` picks per gap: up to a week solid, up to four dashed, longer dotted. */
type TimelineLine = "solid" | "dashed" | "dotted" | "auto"

type TimelineStroke = Exclude<TimelineLine, "auto">

/** The stroke from the marker out to the content. `pin` ends in a small ring. */
type TimelineConnector = "none" | "solid" | "dashed" | "pin"

type TimelineSize = "sm" | "default" | "lg"

type TimelineGroupBy = "day" | "month" | "year"

type TimelineConfig = {
  orientation: TimelineOrientation
  side: TimelineSide
  datePlacement: "content" | "opposite"
  markers: TimelineMarkers
  size: TimelineSize
  connector: TimelineConnector
  colors?: string[]
  showGaps: boolean
  locale: string
  dateFormat: Intl.DateTimeFormatOptions
}

/** Where a row sits among the others, worked out by the Timeline. */
type TimelineRowLayout = {
  /** Position among the entries, headings skipped; sets the alternating side. */
  index: number
  number: number
  hasBefore: boolean
  hasAfter: boolean
  lineBefore: TimelineStroke
  lineAfter: TimelineStroke
  mutedBefore: boolean
  mutedAfter: boolean
  /** Days to the next entry, when both have a date. */
  gapAfter: number | null
  /** Extra room after this row for `spacing="time"`, in px. */
  extraAfter: number
  upcoming: boolean
}

const TimelineContext = React.createContext<TimelineConfig | null>(null)
const TimelineExtendContext = React.createContext(false)
const TimelineRowContext = React.createContext<TimelineRowLayout>({
  index: 0,
  number: 1,
  hasBefore: false,
  hasAfter: false,
  lineBefore: "solid",
  lineAfter: "solid",
  mutedBefore: false,
  mutedAfter: false,
  gapAfter: null,
  extraAfter: 0,
  upcoming: false,
})

const RING_SIZES: Record<TimelineSize, string> = {
  sm: "2rem",
  default: "2.5rem",
  lg: "3.25rem",
}

const DOT_SIZES: Record<TimelineSize, string> = {
  sm: "0.625rem",
  default: "0.75rem",
  lg: "1rem",
}

const SIZE_CLASSES: Record<
  TimelineSize,
  { ring: string; date: string; title: string; description: string }
> = {
  sm: {
    ring: "border-2 text-xs",
    date: "text-sm",
    title: "text-sm",
    description: "text-xs",
  },
  default: {
    ring: "border-[2.5px] text-sm",
    date: "text-lg",
    title: "text-sm",
    description: "text-sm",
  },
  lg: {
    ring: "border-[3px] text-xl",
    date: "text-2xl",
    title: "text-base",
    description: "text-sm",
  },
}

const DAY = 86_400_000

// Extra room per gap for spacing="time": grows with the square root of the
// days between entries, so a year apart isn't 52 times a week apart.
const TIME_SPACING_PX_PER_ROOT_DAY = 28
const TIME_SPACING_MAX_PX = 160

/** Milliseconds for `at`, or null when there's no usable date. */
function readsTime(at?: TimelineDate) {
  if (at == null) return null
  if (typeof at === "string" && /^\d{4}-\d{2}-\d{2}$/.test(at)) {
    const [year, month, day] = at.split("-").map(Number)
    return new Date(year, month - 1, day).getTime()
  }
  const time = new Date(at).getTime()
  return Number.isNaN(time) ? null : time
}

function daysBetween(a: number, b: number) {
  return Math.round(Math.abs(b - a) / DAY)
}

function strokeFor(line: TimelineLine, days: number | null): TimelineStroke {
  if (line !== "auto") return line
  if (days == null || days <= 7) return "solid"
  return days <= 28 ? "dashed" : "dotted"
}

/** "1m 3w" when short (two units at most), "1 month 3 weeks 2 days" when long. */
function formatsGap(days: number, short: boolean) {
  const units: [number, string, string][] = [
    [Math.floor(days / 30), "m", "month"],
    [Math.floor((days % 30) / 7), "w", "week"],
    [(days % 30) % 7, "d", "day"],
  ]
  const parts = units.filter(([count]) => count > 0)
  if (!parts.length) return short ? "" : "Same day"
  return short
    ? parts
        .slice(0, 2)
        .map(([count, unit]) => `${count}${unit}`)
        .join(" ")
    : parts
        .map(([count, , unit]) => `${count} ${unit}${count === 1 ? "" : "s"}`)
        .join(" ")
}

function isoDate(time: number) {
  const date = new Date(time)
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const DEFAULT_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  year: "numeric",
}

const GROUP_FORMATS: Record<TimelineGroupBy, Intl.DateTimeFormatOptions> = {
  day: { weekday: "short", month: "long", day: "numeric", year: "numeric" },
  month: { month: "long", year: "numeric" },
  year: { year: "numeric" },
}

function groupKeyFor(time: number, by: TimelineGroupBy) {
  const date = new Date(time)
  if (by === "year") return `${date.getFullYear()}`
  if (by === "month") return `${date.getFullYear()}-${date.getMonth()}`
  return isoDate(time)
}

/** Draws a line of `style` running `direction` in currentColor. */
function strokes(style: TimelineStroke, direction: "down" | "across") {
  if (style === "solid") return { background: "currentColor" }
  const [dash, gap] = style === "dashed" ? [6, 5] : [2, 4]
  return {
    background: `repeating-linear-gradient(${direction === "down" ? "to bottom" : "to right"}, currentColor 0 ${dash}px, transparent ${dash}px ${dash + gap}px)`,
  }
}

/**
 * The line through one row: a piece from the row before to the marker, and a
 * piece from the marker to the row after. Each piece takes the stroke of its
 * own gap, and the ends run on past the first and last rows with `extend`.
 */
function TimelineSegments({
  center,
  gapLabel,
}: {
  /** Where the marker sits along the row, as a CSS length. */
  center: string
  gapLabel?: React.ReactNode
}) {
  const { orientation } = React.useContext(TimelineContext)!
  const layout = React.useContext(TimelineRowContext)
  const vertical = orientation === "vertical"
  const extend = "calc(-1 * var(--timeline-extend, 0px))"
  const extended = React.useContext(TimelineExtendContext)

  const pieces = [
    layout.hasBefore || extended
      ? {
          key: "before",
          stroke: layout.lineBefore,
          muted: layout.mutedBefore,
          start: layout.hasBefore ? "0px" : extend,
          end: `calc(100% - ${center})`,
          cap: !layout.hasBefore ? "start" : null,
        }
      : null,
    layout.hasAfter || extended
      ? {
          key: "after",
          stroke: layout.lineAfter,
          muted: layout.mutedAfter,
          start: center,
          end: layout.hasAfter ? "0px" : extend,
          cap: !layout.hasAfter ? "end" : null,
        }
      : null,
  ]

  return pieces.map((piece) =>
    piece ? (
      <span
        key={piece.key}
        aria-hidden
        data-slot="timeline-line"
        className={cn(
          "absolute",
          piece.muted ? "text-muted-foreground/20" : "text-muted-foreground/40",
          vertical
            ? "left-1/2 w-0.5 -translate-x-1/2"
            : "top-1/2 h-0.5 -translate-y-1/2"
        )}
        style={{
          ...strokes(piece.stroke, vertical ? "down" : "across"),
          ...(vertical
            ? { top: piece.start, bottom: piece.end }
            : { left: piece.start, right: piece.end }),
        }}
      >
        {piece.cap ? (
          <span
            className={cn(
              "absolute size-1.5 rounded-full bg-current",
              vertical
                ? cn(
                    "left-1/2 -translate-x-1/2",
                    piece.cap === "start"
                      ? "top-0 -translate-y-1/2"
                      : "bottom-0 translate-y-1/2"
                  )
                : cn(
                    "top-1/2 -translate-y-1/2",
                    piece.cap === "start"
                      ? "left-0 -translate-x-1/2"
                      : "right-0 translate-x-1/2"
                  )
            )}
          />
        ) : null}
        {piece.key === "after" && gapLabel ? (
          <span className="absolute top-1/2 left-1/2 z-10 -translate-1/2 rounded-full bg-background px-1.5 text-[10px] leading-4 font-medium whitespace-nowrap text-muted-foreground tabular-nums">
            {gapLabel}
          </span>
        ) : null}
      </span>
    ) : null
  )
}

function TimelineMarker({
  kind,
  number,
  current,
  children,
}: {
  kind: TimelineMarkers
  number: number
  current: boolean
  children?: React.ReactNode
}) {
  const config = React.useContext(TimelineContext)!
  const halo =
    "ring-4 ring-[color-mix(in_oklab,var(--timeline-color)_22%,transparent)]"

  if (kind === "none") return null

  if (kind === "dot") {
    return (
      <span
        data-slot="timeline-marker"
        className={cn(
          "block size-(--timeline-marker) shrink-0 rounded-full bg-(--timeline-color)",
          current ? halo : "ring-4 ring-background"
        )}
      />
    )
  }

  return (
    <span
      data-slot="timeline-marker"
      className={cn(
        "flex size-(--timeline-marker) shrink-0 items-center justify-center rounded-full border-(--timeline-color) font-bold tabular-nums [&_svg]:size-[45%]",
        SIZE_CLASSES[config.size].ring,
        current
          ? cn("bg-(--timeline-color) text-background", halo)
          : "bg-background text-(--timeline-color)"
      )}
    >
      {children ?? (kind === "number" ? number : null)}
    </span>
  )
}

function TimelineConnectorStroke({ reversed }: { reversed: boolean }) {
  const { connector, orientation } = React.useContext(TimelineContext)!
  if (connector === "none") return null

  const along = orientation === "vertical"

  return (
    <span
      aria-hidden
      data-slot="timeline-connector"
      className={cn(
        "flex shrink-0 items-center justify-center text-muted-foreground/50",
        along
          ? "h-(--timeline-row) w-(--timeline-connector)"
          : "h-(--timeline-connector) w-full flex-col",
        // The pin's ring sits at the content end, away from the line.
        reversed && (along ? "flex-row-reverse" : "flex-col-reverse")
      )}
    >
      <span
        className={along ? "h-0.5 flex-1" : "w-0.5 flex-1"}
        style={strokes(
          connector === "dashed" ? "dashed" : "solid",
          along ? "across" : "down"
        )}
      />
      {connector === "pin" ? (
        <span className="size-2 shrink-0 rounded-full border-2 border-(--timeline-color) bg-background" />
      ) : null}
    </span>
  )
}

type TimelineItemProps = Omit<TimelineEntry, "id"> & {
  id?: string
} & Omit<React.ComponentProps<"li">, "title" | "content" | "color">

function TimelineItem({
  id,
  badge,
  date,
  at,
  title,
  trailing,
  description,
  content,
  marker,
  color,
  current = false,
  children,
  className,
  style,
  ...props
}: TimelineItemProps) {
  const config = React.useContext(TimelineContext)
  if (!config) throw new Error("TimelineItem must be inside a Timeline.")
  const layout = React.useContext(TimelineRowContext)

  const vertical = config.orientation === "vertical"
  const contentSide =
    config.side === "alternate"
      ? layout.index % 2 === 0
        ? "before"
        : "after"
      : config.side
  const kind: TimelineMarkers =
    marker != null && config.markers !== "ring" && config.markers !== "number"
      ? "ring"
      : config.markers
  const markerSize =
    kind === "none"
      ? "0px"
      : kind === "dot"
        ? DOT_SIZES[config.size]
        : RING_SIZES[config.size]
  const accent = layout.upcoming
    ? "var(--muted-foreground)"
    : (color ??
      (config.colors?.length
        ? config.colors[layout.index % config.colors.length]
        : "var(--primary)"))
  const sizes = SIZE_CLASSES[config.size]

  const time = readsTime(at)
  const shownDate =
    date ??
    (time != null
      ? new Intl.DateTimeFormat(config.locale, config.dateFormat).format(time)
      : null)
  const dateOpposite = config.datePlacement === "opposite" && shownDate != null

  const dateNode =
    shownDate != null ? (
      <time
        data-slot="timeline-date"
        dateTime={time != null ? isoDate(time) : undefined}
        className={cn(
          "leading-tight font-bold text-(--timeline-color) tabular-nums",
          sizes.date
        )}
      >
        {shownDate}
      </time>
    ) : null

  const parts = [
    badge != null ? (
      <span
        key="badge"
        data-slot="timeline-badge"
        className="inline-flex items-center rounded-full bg-[color-mix(in_oklab,var(--timeline-color)_28%,transparent)] px-2.5 py-0.5 text-xs font-semibold text-foreground"
      >
        {badge}
      </span>
    ) : null,
    dateOpposite ? null : dateNode ? (
      <React.Fragment key="date">{dateNode}</React.Fragment>
    ) : null,
    title != null || trailing != null ? (
      <span
        key="title"
        data-slot="timeline-title"
        className={cn(
          "inline-flex flex-wrap items-center gap-x-1.5 gap-y-1 leading-snug font-semibold text-foreground",
          contentSide === "before" && vertical && "justify-end",
          !vertical && "justify-center",
          sizes.title
        )}
      >
        {title}
        {trailing}
      </span>
    ) : null,
    description != null ? (
      <div
        key="description"
        data-slot="timeline-description"
        className={cn(
          "leading-relaxed text-muted-foreground",
          sizes.description
        )}
      >
        {description}
      </div>
    ) : null,
    content != null || children != null ? (
      <div key="content" data-slot="timeline-content" className="text-sm">
        {content}
        {children}
      </div>
    ) : null,
  ].filter(Boolean)

  const body = (
    <div
      data-slot="timeline-body"
      className={cn(
        "flex min-w-0 flex-1 flex-col gap-1 transition-opacity",
        layout.upcoming && "opacity-60",
        vertical
          ? contentSide === "before"
            ? "items-end text-right"
            : "items-start text-left"
          : "items-center text-center"
      )}
    >
      {parts.map((part, partIndex) =>
        // On a vertical line the first part lines up with the marker.
        vertical && partIndex === 0 ? (
          <div key="lead" className="flex min-h-(--timeline-row) items-center">
            {part}
          </div>
        ) : (
          part
        )
      )}
    </div>
  )

  const contentCell = (
    <div
      data-slot="timeline-side"
      data-content=""
      className={cn(
        "flex min-w-0",
        vertical
          ? contentSide === "before"
            ? "flex-row-reverse"
            : "flex-row"
          : contentSide === "before"
            ? "flex-col-reverse"
            : "flex-col",
        vertical ? "px-(--timeline-space)" : "px-2 py-(--timeline-space)",
        config.connector !== "none" &&
          (vertical
            ? contentSide === "before"
              ? "pr-0"
              : "pl-0"
            : contentSide === "before"
              ? "pb-0"
              : "pt-0"),
        config.connector !== "none" && (vertical ? "gap-2" : "gap-1.5")
      )}
    >
      <TimelineConnectorStroke reversed={contentSide === "before"} />
      {body}
    </div>
  )

  const oppositeCell = (
    <div
      data-slot="timeline-side"
      className={cn(
        "flex min-w-0",
        vertical
          ? cn(
              "items-start px-(--timeline-space)",
              contentSide === "before"
                ? "justify-start text-left"
                : "justify-end text-right"
            )
          : cn(
              "flex-col items-center px-2 py-(--timeline-space) text-center",
              contentSide === "before" ? "justify-start" : "justify-end"
            )
      )}
    >
      {dateOpposite ? (
        <span
          className={cn(
            "flex items-center",
            vertical && "min-h-(--timeline-row)",
            layout.upcoming && "opacity-60"
          )}
        >
          {dateNode}
        </span>
      ) : null}
    </div>
  )

  const gapLabel =
    config.showGaps && layout.gapAfter != null && layout.hasAfter ? (
      <span title={formatsGap(layout.gapAfter, false)}>
        {formatsGap(layout.gapAfter, true)}
      </span>
    ) : null

  const axisCell = (
    <div
      data-slot="timeline-axis"
      className={cn(
        "relative flex justify-center",
        vertical ? "w-(--timeline-marker) items-start" : "h-full items-center"
      )}
    >
      <TimelineSegments
        center={vertical ? "calc(var(--timeline-row) / 2)" : "50%"}
        gapLabel={gapLabel}
      />
      <span
        className={cn(
          "relative flex h-(--timeline-row) items-center justify-center",
          !vertical && "w-full"
        )}
      >
        <TimelineMarker kind={kind} number={layout.number} current={current}>
          {marker}
        </TimelineMarker>
      </span>
    </div>
  )

  return (
    <li
      id={id}
      data-slot="timeline-item"
      data-side={contentSide}
      data-current={current || undefined}
      data-upcoming={layout.upcoming || undefined}
      aria-current={current ? "step" : undefined}
      className={cn(
        "grid",
        vertical
          ? "col-span-full grid-cols-subgrid"
          : "row-span-full grid-rows-subgrid",
        vertical && layout.hasAfter && "*:pb-(--timeline-after)",
        className
      )}
      style={
        {
          "--timeline-color": accent,
          "--timeline-marker": markerSize,
          "--timeline-row": `max(${markerSize}, 1.75rem)`,
          "--timeline-after": `calc(var(--timeline-gap) + ${layout.extraAfter}px)`,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      {contentSide === "before" ? contentCell : oppositeCell}
      {axisCell}
      {contentSide === "before" ? oppositeCell : contentCell}
    </li>
  )
}

/** A label on the line between entries, like a month. `groupBy` adds these for you. */
function TimelineHeading({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) {
  const config = React.useContext(TimelineContext)
  if (!config) throw new Error("TimelineHeading must be inside a Timeline.")
  const vertical = config.orientation === "vertical"

  const pill = (
    <span
      data-slot="timeline-heading-label"
      className="relative z-10 rounded-full border border-border bg-background px-2.5 py-0.5 text-xs font-medium whitespace-nowrap text-muted-foreground"
    >
      {children}
    </span>
  )

  // On a centred line the pill sits on it; otherwise it sits on the content
  // side, so it never pushes the line out of place.
  const onLine = !vertical || config.side === "alternate"

  const side = (placed: boolean) => (
    <div
      className={cn(
        "flex items-center px-(--timeline-space)",
        config.side === "before" && "justify-end"
      )}
    >
      {placed ? pill : null}
    </div>
  )

  return (
    <li
      data-slot="timeline-heading"
      className={cn(
        "grid",
        vertical
          ? "col-span-full grid-cols-subgrid *:min-h-8 *:py-2"
          : "row-span-full grid-rows-subgrid",
        className
      )}
      {...props}
    >
      {vertical ? side(!onLine && config.side === "before") : <div />}
      <div
        className={cn(
          "relative flex items-center justify-center",
          vertical ? "w-(--timeline-marker)" : "h-full px-3"
        )}
      >
        <TimelineSegments center="50%" />
        {onLine ? (
          vertical ? (
            <span className="absolute top-1/2 left-1/2 z-10 -translate-1/2">
              {pill}
            </span>
          ) : (
            pill
          )
        ) : null}
      </div>
      {vertical ? side(!onLine && config.side !== "before") : <div />}
    </li>
  )
}

type TimelineRow =
  | { kind: "heading"; key: React.Key; element: React.ReactElement }
  | {
      kind: "item"
      key: React.Key
      element: React.ReactElement
      time: number | null
      current: boolean
    }

function Timeline({
  items,
  children,
  orientation = "vertical",
  side = "after",
  datePlacement = "content",
  markers = "ring",
  size = "default",
  line = "solid",
  connector = "none",
  colors,
  extend = false,
  spacing = "even",
  showGaps = false,
  groupBy,
  reversed = false,
  loading = false,
  empty,
  locale = "en-US",
  dateFormat = DEFAULT_DATE_FORMAT,
  itemMinWidth = "11rem",
  start = 1,
  className,
  style,
  ...props
}: Omit<React.ComponentProps<"ol">, "children"> & {
  /** The entries, in order. Or pass `TimelineItem`s as children. */
  items?: TimelineEntry[]
  children?: React.ReactNode
  orientation?: TimelineOrientation
  side?: TimelineSide
  /** `opposite` puts the date across the line from the rest of the entry. */
  datePlacement?: "content" | "opposite"
  /** `number` counts from `start`. An entry's own `marker` shows in a ring. */
  markers?: TimelineMarkers
  size?: TimelineSize
  line?: TimelineLine
  connector?: TimelineConnector
  /** Accents cycled through the entries; an entry's own `color` wins. */
  colors?: string[]
  /** Run the line on past the first and last markers, with a cap at each end. */
  extend?: boolean
  /** `time` spaces entries by the time between their `at` dates. */
  spacing?: "even" | "time"
  /** Label each gap on the line, like "1m 3w", with the full length on hover. */
  showGaps?: boolean
  /** Add a heading whenever the day, month or year of `at` changes. */
  groupBy?: TimelineGroupBy
  /** Newest first: shows the entries in reverse, numbers kept. */
  reversed?: boolean
  /** Shows placeholder entries; a number sets how many (3 by default). */
  loading?: boolean | number
  /** Shown instead of the line when there are no entries. */
  empty?: React.ReactNode
  /** For dates formatted from `at`. */
  locale?: string
  dateFormat?: Intl.DateTimeFormatOptions
  /** Horizontal only: how narrow an entry gets before the line scrolls. */
  itemMinWidth?: string
}) {
  const vertical = orientation === "vertical"

  const config = React.useMemo<TimelineConfig>(
    () => ({
      orientation,
      side,
      datePlacement,
      markers,
      size,
      connector,
      colors,
      showGaps,
      locale,
      dateFormat,
    }),
    [
      orientation,
      side,
      datePlacement,
      markers,
      size,
      connector,
      colors,
      showGaps,
      locale,
      dateFormat,
    ]
  )

  const elements: React.ReactElement[] = loading
    ? Array.from(
        { length: typeof loading === "number" ? loading : 3 },
        (_, index) => (
          <TimelineItem
            key={`loading-${index}`}
            color="var(--muted-foreground)"
            marker={markers === "number" ? "" : undefined}
            title={
              <span className="block h-3.5 w-28 animate-pulse rounded bg-muted" />
            }
            description={
              <span className="block h-3 w-44 max-w-full animate-pulse rounded bg-muted" />
            }
          />
        )
      )
    : items
      ? items.map((entry) => <TimelineItem key={entry.id} {...entry} />)
      : React.Children.toArray(children).filter(React.isValidElement)

  // Sort the children into headings and entries, reading each entry's date.
  let rows: TimelineRow[] = elements.map((element, index) =>
    element.type === TimelineHeading
      ? { kind: "heading", key: element.key ?? index, element }
      : {
          kind: "item",
          key: element.key ?? index,
          element,
          time: readsTime((element.props as TimelineItemProps).at),
          current: Boolean((element.props as TimelineItemProps).current),
        }
  )
  const numbers = new Map(
    rows
      .filter((row) => row.kind === "item")
      .map((row, index) => [row.key, start + index])
  )
  if (reversed) rows = rows.reverse()

  if (groupBy && !loading) {
    const grouped: TimelineRow[] = []
    let lastGroup: string | null = null
    for (const row of rows) {
      if (row.kind === "item" && row.time != null) {
        const group = groupKeyFor(row.time, groupBy)
        if (group !== lastGroup) {
          grouped.push({
            kind: "heading",
            key: `group-${group}`,
            element: (
              <TimelineHeading>
                {new Intl.DateTimeFormat(locale, GROUP_FORMATS[groupBy]).format(
                  row.time
                )}
              </TimelineHeading>
            ),
          })
          lastGroup = group
        }
      }
      grouped.push(row)
    }
    rows = grouped
  }

  const itemRows = rows.flatMap((row, position) =>
    row.kind === "item" ? [{ row, position }] : []
  )
  const currentAt = itemRows.findLastIndex(({ row }) => row.current)
  // Entries after the current one are still to come; with `reversed` they
  // are the ones above it.
  const isUpcoming = (index: number) =>
    currentAt >= 0 && (reversed ? index < currentAt : index > currentAt)

  // Days between neighbouring entries, and what that does to the line.
  const gapsAfter = itemRows.map(({ row }, index) => {
    const next = itemRows[index + 1]?.row
    return row.time != null && next?.time != null
      ? daysBetween(row.time, next.time)
      : null
  })
  const extraFor = (days: number | null) =>
    spacing === "time" && days != null
      ? Math.min(
          TIME_SPACING_MAX_PX,
          Math.round(
            TIME_SPACING_PX_PER_ROOT_DAY * Math.max(0, Math.sqrt(days) - 1)
          )
        )
      : 0

  const layouts = rows.map((row, position): TimelineRowLayout => {
    // The entries on either side of this row, headings skipped.
    const before = itemRows.findLastIndex((entry) => entry.position < position)
    const after = itemRows.findIndex((entry) => entry.position > position)
    const own = row.kind === "item" ? before + 1 : -1
    const previous = row.kind === "item" ? own - 1 : before
    const next = row.kind === "item" ? own + 1 : after
    const gapIn = previous >= 0 ? gapsAfter[previous] : null
    const gapOut =
      row.kind === "item"
        ? gapsAfter[own]
        : before >= 0
          ? gapsAfter[before]
          : null
    const hasNext = next >= 0 && next < itemRows.length
    const upcoming = own >= 0 && isUpcoming(own)
    const bothSides = (a: number, b: number) =>
      (a >= 0 && isUpcoming(a)) ||
      (b >= 0 && b < itemRows.length && isUpcoming(b))

    return {
      index: Math.max(own, 0),
      number: row.kind === "item" ? (numbers.get(row.key) ?? start) : start,
      hasBefore: position > 0,
      hasAfter: position < rows.length - 1,
      lineBefore: strokeFor(line, row.kind === "item" ? gapIn : gapOut),
      lineAfter: strokeFor(line, gapOut),
      mutedBefore:
        row.kind === "item"
          ? bothSides(own, previous)
          : bothSides(before, after),
      mutedAfter:
        row.kind === "item"
          ? bothSides(own, hasNext ? next : -1)
          : bothSides(before, after),
      gapAfter: row.kind === "item" && hasNext ? gapOut : null,
      extraAfter: row.kind === "item" && hasNext ? extraFor(gapOut) : 0,
      upcoming,
    }
  })

  if (!loading && itemRows.length === 0 && empty != null) {
    return (
      <div
        data-slot="timeline-empty"
        className={cn(
          "flex w-full items-center justify-center py-8 text-sm text-muted-foreground",
          className
        )}
      >
        {empty}
      </div>
    )
  }

  // Three tracks: the side before the line, the line, the side after it.
  // Every entry is a subgrid across them, so dates and markers line up.
  const tracks =
    side === "alternate"
      ? "minmax(0,1fr) auto minmax(0,1fr)"
      : side === "before"
        ? "minmax(0,1fr) auto auto"
        : "auto auto minmax(0,1fr)"

  const spacingVars = {
    "--timeline-gap":
      size === "sm" ? "1.25rem" : size === "lg" ? "2.5rem" : "2rem",
    "--timeline-space": size === "sm" ? "0.5rem" : "0.75rem",
    "--timeline-connector": vertical ? "2.5rem" : "1.75rem",
    "--timeline-extend": "1.5rem",
  } as React.CSSProperties

  return (
    <ol
      data-slot="timeline"
      data-orientation={orientation}
      aria-busy={loading ? true : undefined}
      className={cn(
        "grid w-full list-none",
        vertical ? "" : "grid-flow-col overflow-x-auto",
        className
      )}
      style={{
        ...spacingVars,
        ...(vertical
          ? { gridTemplateColumns: tracks }
          : {
              gridTemplateRows: "auto auto auto",
              // Headings take only their label's width; with time spacing,
              // an entry widens by the gap that follows it.
              gridTemplateColumns: rows
                .map((row, position) =>
                  row.kind === "heading"
                    ? "max-content"
                    : `minmax(calc(${itemMinWidth} + ${layouts[position].extraAfter}px), 1fr)`
                )
                .join(" "),
            }),
        ...(extend
          ? vertical
            ? { paddingBlock: "var(--timeline-extend)" }
            : { paddingInline: "var(--timeline-extend)" }
          : null),
        ...style,
      }}
      {...props}
    >
      <TimelineContext.Provider value={config}>
        <TimelineExtendContext.Provider value={extend}>
          {rows.map((row, position) => (
            <TimelineRowContext.Provider
              key={row.key}
              value={layouts[position]}
            >
              {row.element}
            </TimelineRowContext.Provider>
          ))}
        </TimelineExtendContext.Provider>
      </TimelineContext.Provider>
    </ol>
  )
}

export { Timeline, TimelineItem, TimelineHeading }
export type {
  TimelineEntry,
  TimelineDate,
  TimelineOrientation,
  TimelineSide,
  TimelineMarkers,
  TimelineLine,
  TimelineConnector,
  TimelineSize,
  TimelineGroupBy,
}
