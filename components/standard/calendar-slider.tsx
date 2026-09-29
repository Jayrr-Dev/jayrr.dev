"use client"

import * as React from "react"
import { cn } from "cn"
import {
  addDays,
  format,
  getDay,
  parseISO,
  startOfDay,
} from "date-fns"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/standard/popover"
import { Slider, scrollsSliderToItem } from "@/components/standard/slider"

const ISO_FORMAT = "yyyy-MM-dd"
const DEFAULT_LENGTH = 56
const DEFAULT_DAYS_BEFORE_TODAY = 14
const NO_EVENTS: Record<string, CalendarSliderEvent> = {}

export type CalendarSliderEvent = {
  count?: number
  note?: string
  tone?: "default" | "accent" | "warning"
}

type CalendarSliderDay = {
  iso: string
  date: Date
  weekday: string
  dayOfMonth: number
  event?: CalendarSliderEvent
  isToday: boolean
  isPast: boolean
  endsWeek: boolean
}

const TONE_CLASS: Record<NonNullable<CalendarSliderEvent["tone"]>, string> = {
  default: "border-foreground/40",
  accent: "border-emerald-500/70 dark:border-emerald-400/70",
  warning: "border-amber-500/70 dark:border-amber-400/70",
}

function todayIso() {
  return format(new Date(), ISO_FORMAT)
}

function buildsCalendarSliderDays({
  from,
  length,
  today,
  events,
  weekStartsOn,
}: {
  from: string
  length: number
  today: string
  events: Record<string, CalendarSliderEvent>
  weekStartsOn: 0 | 1
}): CalendarSliderDay[] {
  const start = startOfDay(parseISO(from))
  const lastWeekday = (weekStartsOn + 6) % 7

  return Array.from({ length }, (_, index) => {
    const date = addDays(start, index)
    const iso = format(date, ISO_FORMAT)
    return {
      iso,
      date,
      weekday: format(date, "EEE"),
      dayOfMonth: date.getDate(),
      event: events[iso],
      isToday: iso === today,
      isPast: iso < today,
      endsWeek: getDay(date) === lastWeekday && index < length - 1,
    }
  })
}

function describesDay(day: CalendarSliderDay | undefined) {
  if (!day) {
    return ""
  }
  if (day.event?.note) {
    return day.event.note
  }
  const count = day.event?.count ?? 0
  return count === 1 ? "1 entry" : `${count} entries`
}

/**
 * Scrolling calendar strip of square day cubes. Starts centered on the
 * selected day, shows the month in view, and its arrows hop between days
 * that have events (double-click for the first or last one).
 */
function CalendarSlider({
  className,
  from,
  length = DEFAULT_LENGTH,
  events = NO_EVENTS,
  today: todayProp,
  value,
  defaultValue,
  onValueChange,
  weekStartsOn = 0,
  showDayPopover = false,
  showFooter = false,
  hideCounts = false,
  layout = "strip",
}: {
  className?: string
  /** First day, `yyyy-MM-dd`. Defaults to two weeks before today. */
  from?: string
  /** Number of days to show. */
  length?: number
  /** Events keyed by `yyyy-MM-dd`. */
  events?: Record<string, CalendarSliderEvent>
  /** Override today, `yyyy-MM-dd`. */
  today?: string
  value?: string
  defaultValue?: string
  onValueChange?: (iso: string) => void
  weekStartsOn?: 0 | 1
  showDayPopover?: boolean
  showFooter?: boolean
  hideCounts?: boolean
  layout?: "strip" | "grid"
}) {
  const today = todayProp ?? todayIso()
  const start =
    from ?? format(addDays(parseISO(today), -DEFAULT_DAYS_BEFORE_TODAY), ISO_FORMAT)

  const days = React.useMemo(
    () =>
      buildsCalendarSliderDays({ from: start, length, today, events, weekStartsOn }),
    [start, length, today, events, weekStartsOn]
  )

  const [uncontrolled, setUncontrolled] = React.useState(
    defaultValue ?? (days.some((day) => day.isToday) ? today : days[0]?.iso)
  )
  const selected = value ?? uncontrolled
  const [openIso, setOpenIso] = React.useState<string | null>(null)
  const [monthLabel, setMonthLabel] = React.useState(() => {
    const first = days.find((day) => day.iso === selected) ?? days[0]
    return first ? format(first.date, "MMMM yyyy") : ""
  })

  const viewportRef = React.useRef<HTMLDivElement | null>(null)
  const itemRefs = React.useRef(new Map<string, HTMLElement>())
  const frameRef = React.useRef<number | null>(null)

  const eventIsos = React.useMemo(
    () => days.filter((day) => (day.event?.count ?? 0) > 0).map((day) => day.iso),
    [days]
  )
  const current = days.find((day) => day.iso === selected)

  function scrollsToDay(iso: string, behavior: ScrollBehavior = "smooth") {
    const viewport = viewportRef.current
    const item = itemRefs.current.get(iso)
    if (viewport && item) {
      scrollsSliderToItem(viewport, item, behavior)
    }
  }

  function selects(iso: string) {
    if (value === undefined) {
      setUncontrolled(iso)
    }
    onValueChange?.(iso)
    scrollsToDay(iso)
  }

  // Land on the selected day before paint, and keep it centered through
  // resizes (dialog open animations, hidden tabs) until the user scrolls.
  React.useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (layout !== "strip" || !selected || !viewport) {
      return
    }
    scrollsToDay(selected, "instant")

    const recenter = () => scrollsToDay(selected, "instant")
    const resizeObserver = new ResizeObserver(recenter)
    resizeObserver.observe(viewport)
    const settle = () => resizeObserver.disconnect()
    const userEvents = ["pointerdown", "wheel", "keydown", "touchstart"]
    userEvents.forEach((type) =>
      viewport.addEventListener(type, settle, { once: true, passive: true })
    )

    return () => {
      resizeObserver.disconnect()
      userEvents.forEach((type) => viewport.removeEventListener(type, settle))
    }
    // Only on mount and when the strip is rebuilt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout, days])

  /** Day nearest the viewport center, read from item offsets. */
  function centeredDay() {
    const viewport = viewportRef.current
    if (!viewport) {
      return undefined
    }
    const center = viewport.scrollLeft + viewport.clientWidth / 2
    let best: CalendarSliderDay | undefined
    let bestDistance = Infinity
    for (const day of days) {
      const item = itemRefs.current.get(day.iso)
      if (!item) {
        continue
      }
      const distance = Math.abs(item.offsetLeft + item.offsetWidth / 2 - center)
      if (distance < bestDistance) {
        best = day
        bestDistance = distance
      }
    }
    return best
  }

  function handleScroll() {
    if (frameRef.current !== null) {
      return
    }
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null
      const day = centeredDay()
      if (day) {
        const next = format(day.date, "MMMM yyyy")
        setMonthLabel((previous) => (previous === next ? previous : next))
      }
      // Close a popover whose day has scrolled out of view.
      const viewport = viewportRef.current
      const openItem = openIso ? itemRefs.current.get(openIso) : undefined
      if (viewport && openItem) {
        const left = openItem.offsetLeft - viewport.scrollLeft
        if (left + openItem.offsetWidth < 0 || left > viewport.clientWidth) {
          setOpenIso(null)
        }
      }
    })
  }

  React.useEffect(
    () => () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current)
      }
    },
    []
  )

  function jumpsToNearestEvent(direction: "left" | "right") {
    // Hop from the selected day while it is in view (a smooth scroll may still
    // be settling), otherwise from whatever day the user scrolled to.
    const viewport = viewportRef.current
    const selectedItem = itemRefs.current.get(selected)
    const selectedInView =
      viewport &&
      selectedItem &&
      selectedItem.offsetLeft + selectedItem.offsetWidth > viewport.scrollLeft &&
      selectedItem.offsetLeft < viewport.scrollLeft + viewport.clientWidth
    const anchor = selectedInView ? selected : (centeredDay()?.iso ?? selected)
    const target =
      direction === "right"
        ? eventIsos.find((iso) => iso > anchor)
        : [...eventIsos].reverse().find((iso) => iso < anchor)
    if (target) {
      selects(target)
    }
  }

  function jumpsToFirstLastEvent(direction: "left" | "right") {
    const target = direction === "left" ? eventIsos[0] : eventIsos.at(-1)
    if (target) {
      selects(target)
    }
  }

  function rendersCube(day: CalendarSliderDay, fillsCell: boolean) {
    const isSelected = day.iso === selected
    const count = day.event?.count ?? 0

    const cube = (
      <button
        type="button"
        aria-pressed={isSelected}
        aria-current={day.isToday ? "date" : undefined}
        aria-label={`${format(day.date, "EEEE, MMMM d")}${hideCounts ? "" : `, ${describesDay(day)}`}`}
        onClick={() => {
          selects(day.iso)
          if (showDayPopover) {
            setOpenIso((open) => (open === day.iso ? null : day.iso))
          }
        }}
        className={cn(
          "relative flex aspect-square shrink-0 flex-col items-center justify-center gap-1 rounded-xl border-2 border-border bg-muted/20 text-foreground transition-[transform,box-shadow,border-color,background-color] duration-200 ease-out hover:border-foreground/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
          fillsCell ? "w-full" : "size-20",
          count > 0 && TONE_CLASS[day.event?.tone ?? "default"],
          day.isPast && !isSelected && "opacity-45",
          day.isToday && "border-foreground bg-foreground text-background hover:border-foreground",
          isSelected && "z-[1] scale-[1.06] border-foreground shadow-md ring-2 ring-foreground/25"
        )}
      >
        <span className="text-2xl leading-none font-bold tabular-nums">
          {day.dayOfMonth}
        </span>
        {!hideCounts && count > 0 ? (
          <span
            className={cn(
              "min-w-5 rounded-full px-1.5 py-0.5 text-[10px] leading-none font-semibold tabular-nums",
              day.isToday
                ? "bg-background/20 text-background"
                : "bg-foreground/10 text-foreground"
            )}
          >
            {count}
          </span>
        ) : null}
      </button>
    )

    if (!showDayPopover) {
      return cube
    }

    return (
      <Popover
        open={openIso === day.iso}
        onOpenChange={(open) => setOpenIso(open ? day.iso : null)}
      >
        <PopoverTrigger asChild>{cube}</PopoverTrigger>
        <PopoverContent
          side="bottom"
          className="w-56"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <p className="text-sm font-semibold">
            {day.isToday ? "Today" : format(day.date, "EEEE, MMMM d")}
          </p>
          <p className="text-xs text-muted-foreground">
            {hideCounts && !day.event?.note ? "Details hidden" : describesDay(day)}
          </p>
        </PopoverContent>
      </Popover>
    )
  }

  const footer = showFooter ? (
    <p className="text-xs text-muted-foreground">
      <span className="font-medium text-foreground">
        {current ? format(current.date, "EEEE, MMMM d") : ""}
      </span>
      {hideCounts && !current?.event?.note ? null : ` · ${describesDay(current)}`}
    </p>
  ) : null

  if (layout === "grid") {
    const lead = days[0]
      ? (getDay(days[0].date) - weekStartsOn + 7) % 7
      : 0
    const weekdayHeaders = Array.from({ length: 7 }, (_, index) =>
      format(addDays(parseISO("2023-01-01"), index + weekStartsOn), "EEE")
    )

    return (
      <div
        data-slot="calendar-slider"
        className={cn("flex w-full flex-col gap-3", className)}
      >
        <p className="text-center text-sm font-semibold tracking-tight">
          {monthLabel}
        </p>
        <div className="grid grid-cols-7 gap-2">
          {weekdayHeaders.map((label) => (
            <span
              key={label}
              className="text-center text-[11px] font-semibold tracking-wide text-muted-foreground uppercase"
            >
              {label}
            </span>
          ))}
          {Array.from({ length: lead }, (_, index) => (
            <span key={`lead-${index}`} aria-hidden />
          ))}
          {days.map((day) => (
            <div key={day.iso}>{rendersCube(day, true)}</div>
          ))}
        </div>
        {footer}
      </div>
    )
  }

  return (
    <div
      data-slot="calendar-slider"
      className={cn("flex w-full min-w-0 flex-col gap-2", className)}
    >
      <Slider
        aria-label="Calendar days"
        viewportRef={viewportRef}
        viewportClassName="gap-2 py-3"
        stepPx={7 * 88}
        overlay={<span key={monthLabel} className="animate-in fade-in duration-200">{monthLabel}</span>}
        onScroll={handleScroll}
        onJumpToNearest={eventIsos.length > 0 ? jumpsToNearestEvent : undefined}
        onJumpToFirstLast={eventIsos.length > 0 ? jumpsToFirstLastEvent : undefined}
      >
        {days.map((day) => (
          <React.Fragment key={day.iso}>
            <div
              ref={(node) => {
                if (node) {
                  itemRefs.current.set(day.iso, node)
                } else {
                  itemRefs.current.delete(day.iso)
                }
              }}
              className="flex shrink-0 flex-col items-center gap-1.5"
            >
              <span
                className={cn(
                  "text-[11px] font-semibold tracking-wide text-muted-foreground uppercase",
                  day.isToday && "text-foreground",
                  day.isPast && "opacity-60"
                )}
              >
                {day.weekday}
              </span>
              {rendersCube(day, false)}
            </div>
            {day.endsWeek ? (
              <div
                aria-hidden
                className="mt-6 w-px shrink-0 self-stretch bg-border"
              />
            ) : null}
          </React.Fragment>
        ))}
      </Slider>
      {footer}
    </div>
  )
}

export { CalendarSlider }
