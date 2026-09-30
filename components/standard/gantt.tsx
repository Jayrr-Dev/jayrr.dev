"use client"

import * as React from "react"
import { cn } from "cn"
import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  format,
  getDay,
  getISOWeek,
  getQuarter,
  getYear,
  isValid,
  parse,
  startOfDay,
  startOfISOWeek,
  startOfMonth,
  startOfQuarter,
} from "date-fns"
import { ChevronRight, ZoomIn, ZoomOut } from "lucide-react"

import { Button } from "@/components/standard/button"
import { ButtonArray } from "@/components/standard/button-array"
import { useControllableState } from "@/hooks/use-controllable-state"

/**
 * A schedule of phases, tasks and milestones: a WBS task table frozen on the
 * left and a period timeline on the right, in the style of an engineering
 * project Excel Gantt.
 *
 * Each row shows a plan bar (filled cell by cell with progress), an actual
 * bar tinted by how far it slipped from plan, and a forecast overshoot past
 * the plan end. Phases roll up their children's dates and weighted progress
 * unless they carry their own dates, in which case a child that runs outside
 * them turns red. A task whose dependencies are unfinished greys out.
 *
 * Dates are "yyyy-MM-dd" strings; a plan takes `planEnd` or `planDays`.
 *
 * <Gantt
 *   tasks={[
 *     { id: "1.0", name: "Design" },
 *     { id: "1.1", parent: "1.0", name: "Survey", planStart: "2026-03-02", planDays: 5 },
 *     { id: "1.2", parent: "1.0", name: "Drawings", planStart: "2026-03-09", planDays: 10, dependsOn: ["1.1"] },
 *   ]}
 * />
 */

export type GanttMode = "daily" | "weekly" | "monthly" | "quarterly"

export type GanttColumn =
  | "progress"
  | "assignee"
  | "dependency"
  | "plan-start"
  | "plan-end"
  | "plan-days"
  | "actual-start"
  | "actual-end"
  | "actual-days"
  | "forecast-end"

export type GanttTask = {
  /** WBS code, e.g. "1.0" for a phase and "1.2" for its second task. */
  id: string
  name: string
  /** WBS of the phase this task sits under. */
  parent?: string
  assignee?: string
  /** 0 to 100. Phases with children take their children's weighted average. */
  progress?: number
  /** WBS codes that must reach 100% first. */
  dependsOn?: string[]
  planStart?: string
  /** Inclusive. Wins over `planDays`. */
  planEnd?: string
  /** Inclusive day count from `planStart`, used when `planEnd` is not set. */
  planDays?: number
  actualStart?: string
  actualEnd?: string
  /** Projected finish; draws past the plan end when it is later. */
  forecastEnd?: string
  /** A single date, drawn as a diamond on `planEnd` (or `planStart`). */
  milestone?: boolean
}

/** A task with its derived dates, as the table and readout see it. */
export type GanttComputedTask = Omit<GanttTask, "planDays" | "progress"> & {
  depth: number
  isPhase: boolean
  childCount: number
  progress: number
  planEnd?: string
  planDays: number | null
  actualDays: number | null
  /** Days behind plan: late start plus late finish, never negative. */
  slipDays: number | null
  /** Dependencies below 100%. */
  blockedBy: string[]
  /** Dependencies that name no task. */
  missingDependencies: string[]
}

type Period = {
  start: Date
  end: Date
  isToday: boolean
  /** Last period of the next tier up: draws a stronger rule after it. */
  closesGroup: boolean
}

const MODE_ITEMS = [
  { id: "daily", label: "Day" },
  { id: "weekly", label: "Week" },
  { id: "monthly", label: "Month" },
  { id: "quarterly", label: "Quarter" },
]

/** Base period width in px, before zoom. */
const PERIOD_WIDTH: Record<GanttMode, number> = {
  daily: 22,
  weekly: 28,
  monthly: 40,
  quarterly: 48,
}

const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2]

const ROW_HEIGHT = 28
const TIER_HEIGHT = 22
const PLAN_TOP = 5
const PLAN_HEIGHT = 11
const ACTUAL_TOP = 19
const ACTUAL_HEIGHT = 6
const DIAMOND = 11

const COLUMN_DEFS: Record<
  GanttColumn,
  { label: string; width: number; title: string }
> = {
  progress: { label: "Progress", width: 76, title: "Percent complete" },
  assignee: { label: "Assigned", width: 96, title: "Assigned to" },
  dependency: { label: "Dep.", width: 44, title: "Depends on" },
  "plan-start": { label: "Plan start", width: 64, title: "Planned start" },
  "plan-end": { label: "Plan end", width: 64, title: "Planned end" },
  "plan-days": { label: "Days", width: 42, title: "Planned days" },
  "actual-start": { label: "Act. start", width: 64, title: "Actual start" },
  "actual-end": { label: "Act. end", width: 64, title: "Actual end" },
  "actual-days": { label: "Act. days", width: 48, title: "Actual days" },
  "forecast-end": { label: "Forc. end", width: 64, title: "Forecast end" },
}

const WBS_WIDTH = 44
const NAME_WIDTH = 200

/**
 * Timeline palette from the original sheet: blue plan, deep-blue progress,
 * green actual shading to red as it slips, violet forecast, amber diamonds.
 * Each is a CSS variable so a theme can override it.
 */
const PALETTE = {
  "--gantt-header": "#0f2b3d",
  "--gantt-header-foreground": "#e8edf1",
  "--gantt-plan": "#b4d5fa",
  "--gantt-plan-phase": "#96c5ff",
  "--gantt-progress": "#186ffc",
  "--gantt-actual": "#22c55e",
  "--gantt-forecast": "#c4b5fd",
  "--gantt-forecast-phase": "#a78bfa",
  "--gantt-blocked": "#bcbdc0",
  "--gantt-blocked-actual": "#808080",
  "--gantt-error": "#f87171",
  "--gantt-error-actual": "#fca5a5",
  "--gantt-milestone": "#f59e0b",
  "--gantt-milestone-done": "#22c55e",
  "--gantt-today": "rgb(239 159 68 / 0.22)",
  "--gantt-today-line": "#ef9144",
} as React.CSSProperties

/* ─── Dates ─── */

function parsesDate(value: string | undefined | null): Date | null {
  if (!value) {
    return null
  }
  const date = parse(value.slice(0, 10), "yyyy-MM-dd", new Date())
  return isValid(date) ? date : null
}

function formatsIso(date: Date) {
  return format(date, "yyyy-MM-dd")
}

function formatsShort(value: string | undefined) {
  const date = parsesDate(value)
  return date ? format(date, "MMM d") : ""
}

/* ─── Derived fields (planEnd, days, rollups, slip, dependencies) ─── */

/**
 * planEnd = planStart + planDays − 1, actualDays = actualEnd − actualStart + 1.
 * A phase with children takes min child start, max child end and the
 * progress average weighted by planned days, unless it has its own dates.
 */
function computesGanttTasks(tasks: GanttTask[]): GanttComputedTask[] {
  const byId = new Map(tasks.map((task) => [task.id, task]))
  const children = new Map<string, GanttTask[]>()
  for (const task of tasks) {
    if (task.parent && byId.has(task.parent)) {
      children.set(task.parent, [...(children.get(task.parent) ?? []), task])
    }
  }

  const depthOf = (task: GanttTask, seen = new Set<string>()): number => {
    const parent = task.parent ? byId.get(task.parent) : undefined
    if (!parent || seen.has(parent.id)) {
      return 0
    }
    seen.add(parent.id)
    return depthOf(parent, seen) + 1
  }

  const computed = new Map<string, GanttComputedTask>()
  const computes = (task: GanttTask): GanttComputedTask => {
    const cached = computed.get(task.id)
    if (cached) {
      return cached
    }
    const kids = (children.get(task.id) ?? []).map(computes)
    let planStart = task.planStart
    let planEnd =
      task.planEnd ??
      (task.planStart && task.planDays && task.planDays > 0
        ? formatsIso(
            addDays(parsesDate(task.planStart) ?? new Date(), task.planDays - 1)
          )
        : undefined)
    let progress = Math.max(0, Math.min(100, task.progress ?? 0))
    let actualDays: number | null = null

    if (kids.length > 0) {
      const starts = kids
        .map((kid) => kid.planStart)
        .filter(Boolean) as string[]
      const ends = kids.map((kid) => kid.planEnd).filter(Boolean) as string[]
      if (!task.planStart && starts.length > 0) {
        planStart = starts.reduce((a, b) => (a < b ? a : b))
      }
      if (!task.planEnd && !task.planDays && ends.length > 0) {
        planEnd = ends.reduce((a, b) => (a > b ? a : b))
      }
      let weighted = 0
      let totalDays = 0
      let sumActual = 0
      for (const kid of kids) {
        const days = kid.planDays ?? 0
        if (days > 0) {
          weighted += kid.progress * days
          totalDays += days
        }
        sumActual += kid.actualDays ?? 0
      }
      if (totalDays > 0 && task.progress === undefined) {
        progress = Math.round(weighted / totalDays)
      }
      actualDays = sumActual > 0 ? sumActual : null
    }

    const start = parsesDate(planStart)
    const end = parsesDate(planEnd)
    const planDays = task.milestone
      ? 0
      : start && end
        ? differenceInCalendarDays(end, start) + 1
        : null

    const actualStart = parsesDate(task.actualStart)
    const actualEnd = parsesDate(task.actualEnd)
    if (kids.length === 0 && !task.milestone && actualStart && actualEnd) {
      actualDays = differenceInCalendarDays(actualEnd, actualStart) + 1
    }

    // Slip: (actualStart − planStart) + (actualEnd − planEnd), floored at 0.
    // In progress, only the late start counts.
    let slipDays: number | null = null
    if (start && actualStart) {
      const lateStart = differenceInCalendarDays(actualStart, start)
      const lateEnd =
        actualEnd && end ? differenceInCalendarDays(actualEnd, end) : 0
      slipDays = Math.max(0, lateStart + lateEnd)
    }

    const dependsOn = task.dependsOn ?? []
    const result: GanttComputedTask = {
      ...task,
      planStart,
      planEnd,
      progress,
      planDays,
      actualDays,
      slipDays,
      depth: depthOf(task),
      isPhase: kids.length > 0,
      childCount: kids.length,
      missingDependencies: dependsOn.filter((id) => !byId.has(id)),
      blockedBy: [],
    }
    computed.set(task.id, result)
    return result
  }

  const list = tasks.map(computes)
  for (const task of list) {
    task.blockedBy = (task.dependsOn ?? []).filter((id) => {
      const dependency = computed.get(id)
      return dependency !== undefined && dependency.progress < 100
    })
  }
  return list
}

/**
 * Actual-bar color from slip as a share of planned days, eased through a
 * sigmoid so small slips stay green and the shift speeds up mid-range.
 */
const SLIP_STOPS: [number, [number, number, number]][] = [
  [0, [0x22, 0xc5, 0x5e]],
  [0.25, [0xb1, 0xd1, 0x5c]],
  [0.5, [0xff, 0xdc, 0x83]],
  [0.75, [0xf8, 0x93, 0x5a]],
  [1, [0xde, 0x42, 0x5b]],
]

function colorsSlip(task: GanttComputedTask) {
  if (!task.planDays || !task.slipDays) {
    return "var(--gantt-actual)"
  }
  const share = Math.min(1, task.slipDays / task.planDays)
  const t = 1 / (1 + Math.exp(-6 * (share - 0.5)))
  for (let i = 0; i < SLIP_STOPS.length - 1; i++) {
    const [at, from] = SLIP_STOPS[i]
    const [next, to] = SLIP_STOPS[i + 1]
    if (t <= next) {
      const local = (t - at) / (next - at)
      const channel = (c: number) =>
        Math.round(from[c] + (to[c] - from[c]) * local)
      return `rgb(${channel(0)} ${channel(1)} ${channel(2)})`
    }
  }
  return "rgb(222 66 91)"
}

/* ─── Periods ─── */

function startsPeriod(date: Date, mode: GanttMode) {
  switch (mode) {
    case "daily":
      return startOfDay(date)
    case "weekly":
      return startOfISOWeek(date)
    case "monthly":
      return startOfMonth(date)
    case "quarterly":
      return startOfQuarter(date)
  }
}

function stepsPeriod(date: Date, mode: GanttMode, count = 1) {
  switch (mode) {
    case "daily":
      return addDays(date, count)
    case "weekly":
      return addDays(date, 7 * count)
    case "monthly":
      return addMonths(date, count)
    case "quarterly":
      return addMonths(date, 3 * count)
  }
}

/** The group a period belongs to in the tier above it. */
function groupsPeriod(date: Date, mode: GanttMode) {
  switch (mode) {
    case "daily":
      return `${getYear(date)}-${date.getMonth()}`
    case "weekly":
      return `${getYear(date)}-${date.getMonth()}`
    case "monthly":
      return `${getYear(date)}-Q${getQuarter(date)}`
    case "quarterly":
      return String(getYear(date))
  }
}

function labelsGroup(date: Date, mode: GanttMode) {
  switch (mode) {
    case "daily":
    case "weekly":
      return format(date, "MMM yyyy")
    case "monthly":
      return `Q${getQuarter(date)} ${getYear(date)}`
    case "quarterly":
      return String(getYear(date))
  }
}

function labelsPeriod(date: Date, mode: GanttMode) {
  switch (mode) {
    case "daily":
      return format(date, "d")
    case "weekly":
      return `W${getISOWeek(date)}`
    case "monthly":
      return format(date, "MMM")
    case "quarterly":
      return `Q${getQuarter(date)}`
  }
}

const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"]

/** Periods covering every task date and today, plus `padding` each side. */
function buildsPeriods(
  tasks: GanttComputedTask[],
  mode: GanttMode,
  today: Date,
  padding: number
): Period[] {
  let earliest: Date | null = null
  let latest: Date | null = null
  for (const task of tasks) {
    for (const value of [
      task.planStart,
      task.planEnd,
      task.actualStart,
      task.actualEnd,
      task.forecastEnd,
    ]) {
      const date = parsesDate(value)
      if (!date) continue
      if (!earliest || date < earliest) earliest = date
      if (!latest || date > latest) latest = date
    }
  }
  earliest ??= today
  latest ??= addDays(today, 30)

  const first = stepsPeriod(startsPeriod(earliest, mode), mode, -padding)
  const last = stepsPeriod(startsPeriod(latest, mode), mode, padding)
  const todayStart = startsPeriod(today, mode).getTime()

  const periods: Period[] = []
  for (let start = first; start <= last && periods.length < 1500;) {
    const end = stepsPeriod(start, mode)
    periods.push({
      start,
      end,
      isToday: start.getTime() === todayStart,
      closesGroup: groupsPeriod(start, mode) !== groupsPeriod(end, mode),
    })
    start = end
  }
  return periods
}

/** First and last period index a [from, to] day range touches, or null. */
function spansPeriods(
  periods: Period[],
  from: Date | null,
  to: Date | null
): [number, number] | null {
  if (!from || !to || to < from) {
    return null
  }
  let first = -1
  let last = -1
  for (let i = 0; i < periods.length; i++) {
    const { start, end } = periods[i]
    if (to >= start && from < end) {
      if (first < 0) first = i
      last = i
    }
  }
  return first < 0 ? null : [first, last]
}

function findsPeriod(periods: Period[], date: Date | null) {
  if (!date) {
    return -1
  }
  return periods.findIndex(({ start, end }) => date >= start && date < end)
}

/* ─── Component ─── */

type Segment = { from: number; to: number; color: string; label?: string }

/** Splits [first, last] into runs of the same color, e.g. progress then plan. */
function segmentsRun(
  first: number,
  last: number,
  colorAt: (index: number) => string
): Segment[] {
  const segments: Segment[] = []
  for (let i = first; i <= last; i++) {
    const color = colorAt(i)
    const current = segments[segments.length - 1]
    if (current && current.color === color && current.to === i - 1) {
      current.to = i
    } else {
      segments.push({ from: i, to: i, color })
    }
  }
  return segments
}

function Gantt({
  tasks,
  mode,
  defaultMode = "weekly",
  onModeChange,
  columns = ["progress", "assignee", "plan-start", "plan-end", "plan-days"],
  expanded,
  defaultExpanded,
  onExpandedChange,
  value,
  defaultValue = null,
  onValueChange,
  zoom,
  defaultZoom = 1,
  onZoomChange,
  today: todayProp,
  padding = 2,
  toolbar = true,
  legend = true,
  maxHeight = 480,
  className,
  style,
  "aria-label": ariaLabel = "Project schedule",
  ...props
}: Omit<
  React.ComponentProps<"div">,
  "children" | "defaultValue" | "onChange"
> & {
  tasks: GanttTask[]
  mode?: GanttMode
  defaultMode?: GanttMode
  onModeChange?: (mode: GanttMode) => void
  /** Table columns after WBS and Task, in order. */
  columns?: GanttColumn[]
  /** Ids of open phases. Every phase starts open by default. */
  expanded?: string[]
  defaultExpanded?: string[]
  onExpandedChange?: (expanded: string[]) => void
  /** Id of the selected task. */
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (id: string | null) => void
  /** Timeline width multiplier, 0.5 to 2. */
  zoom?: number
  defaultZoom?: number
  onZoomChange?: (zoom: number) => void
  /** Date the today column marks. Pass a fixed one for stable screenshots. */
  today?: Date | string
  /** Empty periods before the first date and after the last. */
  padding?: number
  /** Mode switch and zoom controls above the chart. */
  toolbar?: boolean
  /** Key and hovered-task readout below the chart. */
  legend?: boolean
  /** Scroll height of the chart body; rows scroll under a sticky header. */
  maxHeight?: number | string
}) {
  const [currentMode, setMode] = useControllableState<GanttMode>({
    value: mode,
    defaultValue: defaultMode,
    onChange: onModeChange,
  })
  const [currentZoom, setZoom] = useControllableState<number>({
    value: zoom,
    defaultValue: defaultZoom,
    onChange: onZoomChange,
  })
  const [selected, setSelected] = useControllableState<string | null>({
    value,
    defaultValue,
    onChange: onValueChange,
  })

  const computed = React.useMemo(() => computesGanttTasks(tasks), [tasks])
  const byId = React.useMemo(
    () => new Map(computed.map((task) => [task.id, task])),
    [computed]
  )
  const phaseIds = React.useMemo(
    () => computed.filter((task) => task.isPhase).map((task) => task.id),
    [computed]
  )
  const [open, setOpen] = useControllableState<string[]>({
    value: expanded,
    defaultValue: defaultExpanded ?? phaseIds,
    onChange: onExpandedChange,
  })

  // Tree order: each phase followed by its open children.
  const rows = React.useMemo(() => {
    const openSet = new Set(open)
    const byParent = new Map<string | undefined, GanttComputedTask[]>()
    for (const task of computed) {
      const parent =
        task.parent && byId.has(task.parent) ? task.parent : undefined
      byParent.set(parent, [...(byParent.get(parent) ?? []), task])
    }
    const out: GanttComputedTask[] = []
    const walks = (parent: string | undefined, seen: Set<string>) => {
      for (const task of byParent.get(parent) ?? []) {
        if (seen.has(task.id)) continue
        seen.add(task.id)
        out.push(task)
        if (task.isPhase && openSet.has(task.id)) {
          walks(task.id, seen)
        }
      }
    }
    walks(undefined, new Set())
    return out
  }, [computed, byId, open])

  const today = React.useMemo(() => {
    if (todayProp instanceof Date) return startOfDay(todayProp)
    return parsesDate(todayProp) ?? startOfDay(new Date())
  }, [todayProp])

  const periods = React.useMemo(
    () => buildsPeriods(computed, currentMode, today, padding),
    [computed, currentMode, today, padding]
  )
  const periodWidth = Math.round(PERIOD_WIDTH[currentMode] * currentZoom)
  const timelineWidth = periods.length * periodWidth
  const todayIndex = periods.findIndex((period) => period.isToday)

  const tableColumns = columns.map((key) => ({ key, ...COLUMN_DEFS[key] }))
  const tableWidth =
    WBS_WIDTH +
    NAME_WIDTH +
    tableColumns.reduce((sum, column) => sum + column.width, 0)

  // Tiers: group row (month / quarter / year) over the period row; daily
  // mode adds weekday letters between them.
  const groups = React.useMemo(() => {
    const spans: { key: string; label: string; count: number }[] = []
    for (const period of periods) {
      const last = spans[spans.length - 1]
      const key = groupsPeriod(period.start, currentMode)
      if (last?.key === key) {
        last.count++
      } else {
        spans.push({
          key,
          label: labelsGroup(period.start, currentMode),
          count: 1,
        })
      }
    }
    return spans
  }, [periods, currentMode])
  const tierCount = currentMode === "daily" ? 3 : 2
  const headerHeight = tierCount * TIER_HEIGHT

  const [hovered, setHovered] = React.useState<string | null>(null)
  const shown = byId.get(hovered ?? selected ?? "")

  const scrollerRef = React.useRef<HTMLDivElement>(null)
  // Bring today (or the first date) into view when the scale changes.
  React.useLayoutEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const target = todayIndex >= 0 ? todayIndex : padding
    scroller.scrollLeft = Math.max(
      0,
      target * periodWidth - (scroller.clientWidth - tableWidth) / 3
    )
  }, [currentMode, periodWidth, todayIndex, padding, tableWidth])

  const togglesPhase = (id: string) =>
    setOpen((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    )

  const zoomIndex = ZOOM_STEPS.findIndex((step) => step >= currentZoom)

  const grid = `repeating-linear-gradient(to right, transparent 0 ${periodWidth - 1}px, var(--gantt-grid) ${periodWidth - 1}px ${periodWidth}px)`

  return (
    <div
      data-slot="gantt"
      className={cn("flex w-full min-w-0 flex-col gap-2", className)}
      style={
        {
          ...PALETTE,
          "--gantt-grid": "color-mix(in oklab, var(--border) 55%, transparent)",
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      {toolbar ? (
        <div
          data-slot="gantt-toolbar"
          className="flex flex-wrap items-center justify-between gap-2"
        >
          <ButtonArray
            appearance="segmented"
            size="sm"
            items={MODE_ITEMS}
            value={currentMode}
            onValueChange={(id) => setMode(id as GanttMode)}
            aria-label="Timeline scale"
          />
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              tone="ghost"
              iconOnly
              aria-label="Zoom out"
              disabled={currentZoom <= ZOOM_STEPS[0]}
              onClick={() =>
                setZoom(
                  ZOOM_STEPS[
                    Math.max(
                      0,
                      (zoomIndex < 0 ? ZOOM_STEPS.length : zoomIndex) - 1
                    )
                  ]
                )
              }
            >
              <ZoomOut />
            </Button>
            <span className="w-10 text-center text-xs text-muted-foreground tabular-nums">
              {Math.round(currentZoom * 100)}%
            </span>
            <Button
              size="sm"
              tone="ghost"
              iconOnly
              aria-label="Zoom in"
              disabled={currentZoom >= ZOOM_STEPS[ZOOM_STEPS.length - 1]}
              onClick={() =>
                setZoom(
                  ZOOM_STEPS[
                    Math.min(
                      ZOOM_STEPS.length - 1,
                      ZOOM_STEPS[zoomIndex] === currentZoom
                        ? zoomIndex + 1
                        : zoomIndex
                    )
                  ]
                )
              }
            >
              <ZoomIn />
            </Button>
          </div>
        </div>
      ) : null}

      <div
        ref={scrollerRef}
        role="grid"
        aria-label={ariaLabel}
        aria-rowcount={rows.length + 1}
        data-slot="gantt-scroller"
        className="relative scrollbar-thin max-w-full overflow-auto rounded-lg border border-border bg-background text-[11px] text-foreground"
        style={{ maxHeight }}
        onPointerLeave={() => setHovered(null)}
      >
        <div className="relative" style={{ width: tableWidth + timelineWidth }}>
          {/* Header */}
          <div
            role="row"
            className="sticky top-0 z-30 flex bg-(--gantt-header) text-(--gantt-header-foreground)"
            style={{ height: headerHeight }}
          >
            <div
              className="sticky left-0 z-10 flex shrink-0 border-r border-white/15 bg-(--gantt-header)"
              style={{ width: tableWidth }}
            >
              <HeaderCell
                width={WBS_WIDTH}
                title="Work breakdown structure"
                center
              >
                WBS
              </HeaderCell>
              <HeaderCell width={NAME_WIDTH}>Task</HeaderCell>
              {tableColumns.map((column) => (
                <HeaderCell
                  key={column.key}
                  width={column.width}
                  title={column.title}
                  center
                >
                  {column.label}
                </HeaderCell>
              ))}
            </div>
            <div
              className="flex shrink-0 flex-col"
              style={{ width: timelineWidth }}
            >
              <div className="flex" style={{ height: TIER_HEIGHT }}>
                {groups.map((group, index) => (
                  <div
                    key={index}
                    className="flex shrink-0 items-center truncate border-r border-b border-white/15 px-1.5 text-[10px] font-semibold tracking-wide"
                    style={{ width: group.count * periodWidth }}
                  >
                    <span
                      className="sticky truncate"
                      style={{ left: tableWidth + 6 }}
                    >
                      {group.count * periodWidth >= 36 ? group.label : ""}
                    </span>
                  </div>
                ))}
              </div>
              {currentMode === "daily" ? (
                <PeriodTier periods={periods} width={periodWidth} dim>
                  {(period) => DAY_LETTERS[getDay(period.start)]}
                </PeriodTier>
              ) : null}
              <PeriodTier periods={periods} width={periodWidth}>
                {(period) => labelsPeriod(period.start, currentMode)}
              </PeriodTier>
            </div>
          </div>

          {/* Body */}
          <div className="relative">
            {/* Today column and group rules run the full body height. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 z-[5]"
              style={{ left: tableWidth, width: timelineWidth }}
            >
              {todayIndex >= 0 ? (
                <div
                  className="absolute inset-y-0 bg-(--gantt-today)"
                  style={{ left: todayIndex * periodWidth, width: periodWidth }}
                  title={`Today, ${format(today, "MMM d")}`}
                />
              ) : null}
              {periods.map((period, index) =>
                period.closesGroup ? (
                  <div
                    key={index}
                    className="absolute inset-y-0 w-px bg-border"
                    style={{ left: (index + 1) * periodWidth - 1 }}
                  />
                ) : null
              )}
            </div>

            {rows.map((task, rowIndex) => {
              const isOpen = open.includes(task.id)
              const isSelected = selected === task.id
              const parent = task.parent ? byId.get(task.parent) : undefined
              return (
                <div
                  key={task.id}
                  role="row"
                  aria-rowindex={rowIndex + 2}
                  aria-selected={isSelected}
                  aria-expanded={task.isPhase ? isOpen : undefined}
                  data-phase={task.isPhase || undefined}
                  // The border sits on the children, not the row, so the
                  // frozen table covers the full height and nothing on the
                  // timeline shows through beneath it.
                  className={cn(
                    "relative flex [&>*]:border-b [&>*]:border-border/70 [&>*]:bg-(--gantt-row)",
                    task.isPhase && "font-semibold",
                    isSelected
                      ? "[--gantt-row:var(--accent)]"
                      : task.isPhase
                        ? "[--gantt-row:var(--muted)] hover:[--gantt-row:color-mix(in_oklab,var(--accent)_70%,var(--muted))]"
                        : "[--gantt-row:var(--background)] hover:[--gantt-row:color-mix(in_oklab,var(--accent)_60%,var(--background))]"
                  )}
                  style={{ height: ROW_HEIGHT }}
                  onPointerEnter={() => setHovered(task.id)}
                  onClick={() => setSelected(isSelected ? null : task.id)}
                >
                  <div
                    className="sticky left-0 z-20 flex shrink-0 border-r border-border"
                    style={{ width: tableWidth }}
                  >
                    <BodyCell
                      width={WBS_WIDTH}
                      center
                      className="text-muted-foreground tabular-nums"
                    >
                      {task.id}
                    </BodyCell>
                    <BodyCell
                      width={NAME_WIDTH}
                      style={{ paddingLeft: 4 + task.depth * 14 }}
                    >
                      {task.isPhase ? (
                        <button
                          type="button"
                          aria-label={
                            isOpen
                              ? `Collapse ${task.name}`
                              : `Expand ${task.name}`
                          }
                          className="mr-0.5 -ml-0.5 flex size-4 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-foreground/10"
                          onClick={(event) => {
                            event.stopPropagation()
                            togglesPhase(task.id)
                          }}
                        >
                          <ChevronRight
                            className={cn(
                              "size-3.5 transition-transform",
                              isOpen && "rotate-90"
                            )}
                          />
                        </button>
                      ) : task.milestone ? (
                        <span
                          aria-hidden
                          className="mr-1 size-2 shrink-0 rotate-45 rounded-[1px] bg-(--gantt-milestone)"
                        />
                      ) : null}
                      <span className="truncate" title={task.name}>
                        {task.name}
                      </span>
                    </BodyCell>
                    {tableColumns.map((column) => (
                      <BodyCell
                        key={column.key}
                        width={column.width}
                        center
                        className={cn(
                          "tabular-nums",
                          !task.isPhase && "text-muted-foreground",
                          column.key === "forecast-end" &&
                            task.forecastEnd &&
                            task.planEnd &&
                            task.forecastEnd > task.planEnd &&
                            "font-semibold text-violet-600 dark:text-violet-400",
                          column.key === "dependency" &&
                            task.missingDependencies.length > 0 &&
                            "text-destructive"
                        )}
                      >
                        {column.key === "progress" ? (
                          <ProgressCell value={task.progress} />
                        ) : (
                          readsColumn(task, column.key)
                        )}
                      </BodyCell>
                    ))}
                  </div>

                  <TimelineRow
                    task={task}
                    parent={parent}
                    periods={periods}
                    periodWidth={periodWidth}
                    grid={grid}
                  />
                </div>
              )
            })}
            {rows.length === 0 ? (
              <div
                className="sticky left-0 flex h-20 items-center justify-center text-xs text-muted-foreground"
                style={{ width: "100%" }}
              >
                No tasks yet
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {legend ? (
        <div
          data-slot="gantt-footer"
          className="flex min-h-4 flex-wrap items-center justify-between gap-x-4 gap-y-1.5 px-1 text-xs text-muted-foreground"
        >
          <span
            data-slot="gantt-readout"
            aria-live="polite"
            className="tabular-nums"
          >
            {shown ? (
              <span className="text-foreground">{describesTask(shown)}</span>
            ) : (
              "Hover a row for its dates"
            )}
          </span>
          <GanttLegend />
        </div>
      ) : null}
    </div>
  )
}

function HeaderCell({
  width,
  center,
  title,
  children,
}: {
  width: number
  center?: boolean
  title?: string
  children: React.ReactNode
}) {
  return (
    <div
      role="columnheader"
      title={title}
      className={cn(
        "flex shrink-0 items-end border-r border-white/15 px-1.5 pb-1.5 text-[10px] leading-tight font-semibold tracking-wide uppercase",
        center && "justify-center text-center"
      )}
      style={{ width }}
    >
      {children}
    </div>
  )
}

function BodyCell({
  width,
  center,
  className,
  style,
  children,
}: {
  width: number
  center?: boolean
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}) {
  return (
    <div
      role="gridcell"
      className={cn(
        "flex shrink-0 items-center overflow-hidden border-r border-border/60 px-1.5 whitespace-nowrap",
        center && "justify-center",
        className
      )}
      style={{ width, ...style }}
    >
      {children}
    </div>
  )
}

function PeriodTier({
  periods,
  width,
  dim,
  children,
}: {
  periods: Period[]
  width: number
  dim?: boolean
  children: (period: Period) => React.ReactNode
}) {
  return (
    <div className="flex" style={{ height: TIER_HEIGHT }}>
      {periods.map((period, index) => (
        <div
          key={index}
          title={format(period.start, "EEE, MMM d yyyy")}
          className={cn(
            "flex shrink-0 items-center justify-center overflow-hidden border-b text-[10px] tabular-nums",
            period.closesGroup
              ? "border-r border-r-white/45 border-b-white/15"
              : "border-r border-white/15",
            dim && "opacity-60",
            period.isToday &&
              "bg-(--gantt-today-line) font-bold text-white opacity-100"
          )}
          style={{ width }}
        >
          {width >= 14 ? children(period) : ""}
        </div>
      ))}
    </div>
  )
}

function ProgressCell({ value }: { value: number }) {
  return (
    <span className="flex w-full items-center gap-1.5">
      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-foreground/10">
        <span
          className="block h-full rounded-full"
          style={{
            width: `${value}%`,
            backgroundColor:
              value >= 100 ? "var(--gantt-actual)" : "var(--gantt-progress)",
          }}
        />
      </span>
      <span className="w-7 text-right">{value}%</span>
    </span>
  )
}

function TimelineRow({
  task,
  parent,
  periods,
  periodWidth,
  grid,
}: {
  task: GanttComputedTask
  parent?: GanttComputedTask
  periods: Period[]
  periodWidth: number
  grid: string
}) {
  const planStart = parsesDate(task.planStart)
  const planEnd = parsesDate(task.planEnd)
  const actualStart = parsesDate(task.actualStart)
  const actualEnd = parsesDate(task.actualEnd)
  const forecastEnd = parsesDate(task.forecastEnd)

  const invalid = task.missingDependencies.length > 0
  const blocked = task.blockedBy.length > 0

  // A child running outside its phase's own dates (forecast included).
  const phaseStart = parent?.isPhase ? parsesDate(parent.planStart) : null
  const phaseEnd = parent?.isPhase
    ? parsesDate(parent.forecastEnd ?? parent.planEnd)
    : null
  const outOfPhase = (index: number) =>
    !!phaseStart &&
    !!phaseEnd &&
    (periods[index].start > phaseEnd || periods[index].end <= phaseStart)

  const bars: React.ReactNode[] = []
  const pushSegments = (
    segments: Segment[],
    top: number,
    height: number,
    kind: string,
    title: string
  ) => {
    for (const segment of segments) {
      bars.push(
        <span
          key={`${kind}-${segment.from}`}
          data-slot={`gantt-${kind}`}
          title={segment.label ?? title}
          className="absolute"
          style={{
            left: segment.from * periodWidth,
            width: (segment.to - segment.from + 1) * periodWidth - 1,
            top,
            height,
            backgroundColor: segment.color,
          }}
        />
      )
    }
  }

  if (task.milestone) {
    const planDate = planEnd ?? planStart
    const doneDate = actualEnd ?? actualStart
    const planIndex = findsPeriod(periods, planDate)
    const doneIndex = findsPeriod(periods, doneDate)
    const markIndex = doneIndex >= 0 ? doneIndex : planIndex
    const done = task.progress >= 100
    // Ghost diamond on the plan date when it was hit on a different one.
    if (planIndex >= 0 && doneIndex >= 0 && planIndex !== doneIndex) {
      bars.push(
        <span
          key="ghost"
          aria-hidden
          className="absolute rotate-45 rounded-[1px] border-[1.5px] border-foreground/25"
          style={{
            left: planIndex * periodWidth + periodWidth / 2 - DIAMOND / 2,
            top: (ROW_HEIGHT - DIAMOND) / 2,
            width: DIAMOND,
            height: DIAMOND,
          }}
        />,
        <span
          key="ghost-link"
          aria-hidden
          className="absolute border-t border-dashed border-foreground/25"
          style={{
            left: (Math.min(planIndex, doneIndex) + 0.5) * periodWidth,
            width: Math.abs(doneIndex - planIndex) * periodWidth,
            top: ROW_HEIGHT / 2,
          }}
        />
      )
    }
    if (markIndex >= 0) {
      const error = invalid || outOfPhase(markIndex)
      bars.push(
        <span
          key="milestone"
          data-slot="gantt-milestone"
          title={`${task.name} · ${formatsShort(task.actualEnd ?? task.planEnd ?? task.planStart)}${done ? " · done" : ""}`}
          className="absolute rotate-45 rounded-[1px] border-[1.5px]"
          style={{
            left: markIndex * periodWidth + periodWidth / 2 - DIAMOND / 2,
            top: (ROW_HEIGHT - DIAMOND) / 2,
            width: DIAMOND,
            height: DIAMOND,
            backgroundColor: error
              ? "var(--gantt-error)"
              : blocked
                ? "var(--gantt-blocked-actual)"
                : done
                  ? "var(--gantt-milestone-done)"
                  : "var(--gantt-milestone)",
            borderColor: done ? "#15803d" : "rgb(0 0 0 / 0.55)",
          }}
        />
      )
    }
  } else {
    const plan = spansPeriods(periods, planStart, planEnd)
    if (plan) {
      const [first, last] = plan
      const cells = last - first + 1
      const filled =
        task.progress >= 100 ? cells : Math.round((task.progress / 100) * cells)
      pushSegments(
        segmentsRun(first, last, (index) =>
          outOfPhase(index) || invalid
            ? "var(--gantt-error)"
            : blocked
              ? "var(--gantt-blocked)"
              : index - first < filled
                ? "var(--gantt-progress)"
                : task.isPhase
                  ? "var(--gantt-plan-phase)"
                  : "var(--gantt-plan)"
        ),
        PLAN_TOP,
        PLAN_HEIGHT,
        "plan",
        `Plan ${formatsShort(task.planStart)} – ${formatsShort(task.planEnd)} · ${task.progress}%`
      )
    }

    if (forecastEnd && planEnd && forecastEnd > planEnd) {
      const forecast = spansPeriods(periods, addDays(planEnd, 1), forecastEnd)
      if (forecast) {
        // Cells already holding the plan keep it; the overshoot starts after.
        const from = plan ? Math.max(forecast[0], plan[1] + 1) : forecast[0]
        if (from <= forecast[1]) {
          pushSegments(
            [
              {
                from,
                to: forecast[1],
                color: task.isPhase
                  ? "var(--gantt-forecast-phase)"
                  : "var(--gantt-forecast)",
              },
            ],
            PLAN_TOP,
            PLAN_HEIGHT,
            "forecast",
            `Forecast end ${formatsShort(task.forecastEnd)}, past plan`
          )
        }
      }
    }

    // No actual end yet: a one-period stub at the actual start.
    const actual = spansPeriods(periods, actualStart, actualEnd ?? actualStart)
    if (actual) {
      const slip = colorsSlip(task)
      pushSegments(
        segmentsRun(actual[0], actual[1], (index) =>
          (!task.isPhase && outOfPhase(index)) || invalid
            ? "var(--gantt-error-actual)"
            : blocked
              ? "var(--gantt-blocked-actual)"
              : slip
        ),
        ACTUAL_TOP,
        ACTUAL_HEIGHT,
        "actual",
        `Actual ${formatsShort(task.actualStart)} – ${task.actualEnd ? formatsShort(task.actualEnd) : "ongoing"}${task.slipDays ? ` · ${task.slipDays}d late` : ""}`
      )
    }
  }

  return (
    <div
      className="relative shrink-0"
      style={{ width: periods.length * periodWidth, backgroundImage: grid }}
    >
      <div className="absolute inset-0 z-10">{bars}</div>
    </div>
  )
}

function readsColumn(
  task: GanttComputedTask,
  key: GanttColumn
): React.ReactNode {
  switch (key) {
    case "assignee":
      return task.assignee ?? "—"
    case "dependency":
      return task.dependsOn?.join(", ") || "—"
    case "plan-start":
      return formatsShort(task.planStart) || "—"
    case "plan-end":
      return formatsShort(task.planEnd) || "—"
    case "plan-days":
      return task.planDays ?? "—"
    case "actual-start":
      return formatsShort(task.actualStart) || "—"
    case "actual-end":
      return formatsShort(task.actualEnd) || "—"
    case "actual-days":
      return task.actualDays ?? "—"
    case "forecast-end":
      return formatsShort(task.forecastEnd) || "—"
    case "progress":
      return `${task.progress}%`
  }
}

/** One line for the readout: dates, progress, slip and what it waits on. */
function describesTask(task: GanttComputedTask) {
  const parts = [`${task.id} ${task.name}`]
  if (task.milestone) {
    parts.push(
      `due ${formatsShort(task.planEnd ?? task.planStart)}`,
      task.progress >= 100
        ? `hit ${formatsShort(task.actualEnd ?? task.actualStart)}`
        : "open"
    )
  } else {
    if (task.planStart) {
      parts.push(
        `plan ${formatsShort(task.planStart)} – ${formatsShort(task.planEnd)}${task.planDays ? ` (${task.planDays}d)` : ""}`
      )
    }
    parts.push(`${task.progress}%`)
    if (task.actualStart) {
      parts.push(
        `actual ${formatsShort(task.actualStart)} – ${task.actualEnd ? formatsShort(task.actualEnd) : "now"}`
      )
    }
    if (task.slipDays) parts.push(`${task.slipDays}d late`)
    if (task.forecastEnd && task.planEnd && task.forecastEnd > task.planEnd) {
      parts.push(`forecast ${formatsShort(task.forecastEnd)}`)
    }
  }
  if (task.missingDependencies.length > 0) {
    parts.push(`no task ${task.missingDependencies.join(", ")}`)
  } else if (task.blockedBy.length > 0) {
    parts.push(`waiting on ${task.blockedBy.join(", ")}`)
  }
  return parts.join(" · ")
}

const LEGEND = [
  { label: "Plan", color: "var(--gantt-plan)" },
  { label: "Progress", color: "var(--gantt-progress)" },
  { label: "Actual", color: "var(--gantt-actual)", thin: true },
  { label: "Forecast", color: "var(--gantt-forecast)" },
  { label: "Blocked", color: "var(--gantt-blocked)" },
  { label: "Out of phase", color: "var(--gantt-error)" },
]

/** Swatches for each bar color, a milestone and the today column. */
function GanttLegend({
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "children">) {
  return (
    <div
      data-slot="gantt-legend"
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1 text-xs",
        className
      )}
      style={PALETTE}
      {...props}
    >
      {LEGEND.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <span
            aria-hidden
            className={cn("w-3.5 rounded-[1px]", item.thin ? "h-1.5" : "h-2.5")}
            style={{ backgroundColor: item.color }}
          />
          {item.label}
        </span>
      ))}
      <span className="flex items-center gap-1.5">
        <span
          aria-hidden
          className="size-2 rotate-45 rounded-[1px] border border-black/50 bg-(--gantt-milestone)"
        />
        Milestone
      </span>
      <span className="flex items-center gap-1.5">
        <span
          aria-hidden
          className="h-3 w-2 bg-(--gantt-today) ring-1 ring-(--gantt-today-line)"
        />
        Today
      </span>
    </div>
  )
}

export { Gantt, GanttLegend, computesGanttTasks }
