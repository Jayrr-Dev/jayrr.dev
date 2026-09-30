"use client"

import * as React from "react"
import { cn } from "cn"

import {
  CalendarHeatmap,
  addsCalendarDays,
  keysCalendarDate,
  readsCalendarDate,
  readsCalendarTotals,
  type CalendarHeatmapData,
} from "@/components/standard/calendar-heatmap"
import type { CellGridSize } from "@/components/standard/cell-grid"
import { useControllableState } from "@/hooks/use-controllable-state"

/**
 * A year of activity at a glance: a headline total, streak stats, a
 * contribution graph, and a panel for the picked day. Built on Calendar
 * Heatmap.
 *
 * <ActivityOverview
 *   title="Commits"
 *   unit="commit"
 *   data={commitsByDay}
 *   renderDay={(day) => <CommitList date={day.date} />}
 * />
 */

type ActivityDay = { date: string; value: number }

/** Totals, streaks and the busiest day over [start, end]. */
function measuresActivity(totals: Map<string, number>, start: Date, end: Date) {
  let total = 0
  let activeDays = 0
  let longest = 0
  let run = 0
  let busiest: ActivityDay | null = null
  for (let date = start; date <= end; date = addsCalendarDays(date, 1)) {
    const key = keysCalendarDate(date)
    const value = totals.get(key) ?? 0
    total += value
    if (value > 0) {
      activeDays += 1
      run += 1
      longest = Math.max(longest, run)
      if (!busiest || value > busiest.value) {
        busiest = { date: key, value }
      }
    } else {
      run = 0
    }
  }
  // The current streak may end yesterday: today still has time.
  let current = 0
  let date = end
  if (!totals.get(keysCalendarDate(date))) {
    date = addsCalendarDays(date, -1)
  }
  while (date >= start && (totals.get(keysCalendarDate(date)) ?? 0) > 0) {
    current += 1
    date = addsCalendarDays(date, -1)
  }
  return { total, activeDays, longest, current, busiest }
}

function ActivityOverview({
  data,
  title = "Activity",
  unit = "contribution",
  end: endProp,
  weeks = 53,
  weekStartsOn = 0,
  locale,
  color,
  size = "default",
  shape = "square",
  actions,
  renderDay,
  value: valueProp,
  defaultValue = null,
  onValueChange,
  className,
  ...props
}: Omit<
  React.ComponentProps<"section">,
  "children" | "defaultValue" | "title"
> & {
  data: CalendarHeatmapData
  title?: React.ReactNode
  /** Singular noun: "commit", "workout", "session". */
  unit?: string
  /** Last day shown. Defaults to today. */
  end?: string | Date
  weeks?: number
  weekStartsOn?: 0 | 1
  locale?: string
  color?: string
  size?: CellGridSize
  shape?: "square" | "round"
  /** Trailing header slot, e.g. a range picker or a link. */
  actions?: React.ReactNode
  /** Body of the picked day's panel. */
  renderDay?: (day: ActivityDay) => React.ReactNode
  /** Picked day key, `YYYY-MM-DD`. */
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
}) {
  const [value, setValue] = useControllableState<string | null>({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  })

  const endKey = keysCalendarDate(readsCalendarDate(endProp ?? new Date()))
  const totals = React.useMemo(() => readsCalendarTotals(data), [data])
  const stats = React.useMemo(() => {
    const end = readsCalendarDate(endKey)
    const start = addsCalendarDays(end, -(weeks * 7 - 1))
    return measuresActivity(totals, start, end)
  }, [totals, endKey, weeks])

  const plural = (count: number) => (count === 1 ? unit : `${unit}s`)
  const number = (count: number) => count.toLocaleString(locale)
  const dayFormat = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
  const shortFormat = new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
  })

  const picked: ActivityDay | null = value
    ? { date: value, value: totals.get(value) ?? 0 }
    : null

  const facts = [
    { label: "Active days", value: number(stats.activeDays) },
    {
      label: "Current streak",
      value: `${number(stats.current)} ${stats.current === 1 ? "day" : "days"}`,
    },
    {
      label: "Longest streak",
      value: `${number(stats.longest)} ${stats.longest === 1 ? "day" : "days"}`,
    },
    {
      label: "Busiest day",
      value: stats.busiest
        ? `${shortFormat.format(readsCalendarDate(stats.busiest.date))} · ${number(stats.busiest.value)}`
        : "—",
    },
  ]

  return (
    <section
      data-slot="activity-overview"
      className={cn(
        "flex w-full min-w-0 flex-col gap-4 rounded-xl border border-border bg-card p-4 text-card-foreground",
        className
      )}
      {...props}
    >
      <header
        data-slot="activity-overview-header"
        className="flex flex-wrap items-start justify-between gap-3"
      >
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 className="text-sm font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground tabular-nums">
              {number(stats.total)}
            </span>{" "}
            {plural(stats.total)} in the last{" "}
            {weeks >= 52 ? "year" : `${weeks} weeks`}
          </p>
        </div>
        {actions ? (
          <div className="flex items-center gap-2">{actions}</div>
        ) : null}
      </header>

      <dl
        data-slot="activity-overview-stats"
        className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4"
      >
        {facts.map((fact) => (
          <div
            key={fact.label}
            className="flex flex-col gap-0.5 bg-card px-3 py-2"
          >
            <dt className="text-xs text-muted-foreground">{fact.label}</dt>
            <dd className="text-sm font-medium tabular-nums">{fact.value}</dd>
          </div>
        ))}
      </dl>

      <CalendarHeatmap
        data={data}
        end={endKey}
        weeks={weeks}
        weekStartsOn={weekStartsOn}
        locale={locale}
        unit={unit}
        color={color}
        size={size}
        shape={shape}
        value={value}
        onValueChange={setValue}
        aria-label={`${typeof title === "string" ? title : "Activity"} by day`}
        caption="Pick a day to see its details"
      />

      {picked ? (
        <div
          data-slot="activity-overview-day"
          className="flex animate-in flex-col gap-2 rounded-lg border border-border bg-muted/40 p-3 fade-in-0 slide-in-from-top-1"
        >
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm font-medium">
              {dayFormat.format(readsCalendarDate(picked.date))}
            </span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {picked.value === 0 ? "No" : number(picked.value)}{" "}
              {plural(picked.value)}
            </span>
          </div>
          {renderDay ? (
            <div className="text-sm">{renderDay(picked)}</div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}

export { ActivityOverview, type ActivityDay }
