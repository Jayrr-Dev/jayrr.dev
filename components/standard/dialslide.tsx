"use client"

import * as React from "react"
import { cn } from "cn"
import {
  addDays,
  differenceInCalendarDays,
  endOfMonth,
  format,
  getDay,
  parseISO,
  startOfDay,
  startOfMonth,
} from "date-fns"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/standard/popover"
import { ScrollHorizontalButton } from "@/components/standard/scroll-horizontal-button"

//#region Track

/** Sub-pixel tolerance when reading scroll edges. */
const EDGE_TOLERANCE_PX = 2

/** Pointer travel before a press turns into a drag (and swallows the click). */
const DRAG_THRESHOLD_PX = 5

const DEFAULT_STEP_PX = 320

/** Targets that keep their own pointer behavior instead of starting a drag. */
const NO_DRAG_SELECTOR =
  'input, textarea, select, [contenteditable="true"], [data-no-drag-scroll]'

type DialslideOverflow = { canScrollLeft: boolean; canScrollRight: boolean }

const NO_OVERFLOW: DialslideOverflow = {
  canScrollLeft: false,
  canScrollRight: false,
}

/**
 * Tracks whether a horizontal scroller can move left or right. Re-checks on
 * scroll, resize and child changes, batched to one read per frame.
 */
function useDialslideOverflow(
  viewportRef: React.RefObject<HTMLElement | null>
): DialslideOverflow {
  const [overflow, setOverflow] = React.useState(NO_OVERFLOW)

  React.useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) {
      return
    }

    let frame: number | null = null

    function evaluate() {
      if (frame !== null) {
        return
      }
      frame = requestAnimationFrame(() => {
        frame = null
        const el = viewportRef.current
        if (!el) {
          return
        }
        const maxLeft = el.scrollWidth - el.clientWidth
        const canScrollLeft = el.scrollLeft > EDGE_TOLERANCE_PX
        const canScrollRight = el.scrollLeft < maxLeft - EDGE_TOLERANCE_PX
        setOverflow((previous) =>
          previous.canScrollLeft === canScrollLeft &&
          previous.canScrollRight === canScrollRight
            ? previous
            : { canScrollLeft, canScrollRight }
        )
      })
    }

    evaluate()
    viewport.addEventListener("scroll", evaluate, { passive: true })
    const resizeObserver = new ResizeObserver(evaluate)
    resizeObserver.observe(viewport)
    const mutationObserver = new MutationObserver(evaluate)
    mutationObserver.observe(viewport, { childList: true })

    return () => {
      viewport.removeEventListener("scroll", evaluate)
      resizeObserver.disconnect()
      mutationObserver.disconnect()
      if (frame !== null) {
        cancelAnimationFrame(frame)
      }
    }
  }, [viewportRef])

  return overflow
}

/**
 * Click-and-drag scrolling for mouse and pen. Touch keeps native panning.
 * A drag past the threshold swallows the click that ends it, so dragging
 * across a row of buttons never selects one.
 */
function useDialslideDrag(
  viewportRef: React.RefObject<HTMLElement | null>,
  enabled: boolean
) {
  const sessionRef = React.useRef<{
    pointerId: number
    originX: number
    startScrollLeft: number
  } | null>(null)
  const didDragRef = React.useRef(false)
  const [dragging, setDragging] = React.useState(false)

  React.useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport || !enabled) {
      return
    }

    function swallowClickAfterDrag(event: MouseEvent) {
      if (!didDragRef.current) {
        return
      }
      event.preventDefault()
      event.stopPropagation()
      didDragRef.current = false
    }

    viewport.addEventListener("click", swallowClickAfterDrag, true)
    return () => {
      viewport.removeEventListener("click", swallowClickAfterDrag, true)
    }
  }, [viewportRef, enabled])

  function endSession(event: React.PointerEvent<HTMLElement>) {
    const session = sessionRef.current
    if (!session || session.pointerId !== event.pointerId) {
      return
    }
    sessionRef.current = null
    setDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const handlers = {
    onPointerDown(event: React.PointerEvent<HTMLElement>) {
      const viewport = viewportRef.current
      if (
        !enabled ||
        !viewport ||
        event.button !== 0 ||
        event.pointerType === "touch" ||
        viewport.scrollWidth - viewport.clientWidth <= EDGE_TOLERANCE_PX
      ) {
        return
      }
      if ((event.target as HTMLElement).closest(NO_DRAG_SELECTOR)) {
        return
      }
      didDragRef.current = false
      sessionRef.current = {
        pointerId: event.pointerId,
        originX: event.clientX,
        startScrollLeft: viewport.scrollLeft,
      }
    },
    onPointerMove(event: React.PointerEvent<HTMLElement>) {
      const session = sessionRef.current
      const viewport = viewportRef.current
      if (!session || !viewport || session.pointerId !== event.pointerId) {
        return
      }
      const deltaX = event.clientX - session.originX
      if (!didDragRef.current && Math.abs(deltaX) > DRAG_THRESHOLD_PX) {
        // Capture only once it is a real drag, so plain clicks still land.
        didDragRef.current = true
        setDragging(true)
        event.currentTarget.setPointerCapture(event.pointerId)
      }
      if (didDragRef.current) {
        viewport.scrollLeft = session.startScrollLeft - deltaX
      }
    },
    onPointerUp: endSession,
    onPointerCancel: endSession,
  }

  return { dragging, handlers }
}

/** Centers `item` inside the horizontal `viewport`. */
function scrollsDialslideToItem(
  viewport: HTMLElement,
  item: HTMLElement,
  behavior: ScrollBehavior = "smooth"
) {
  const left = item.offsetLeft - viewport.clientWidth / 2 + item.offsetWidth / 2
  viewport.scrollTo({ left: Math.max(0, left), behavior })
}

type DialslideTrackProps = {
  variant?: "strip"
  children: React.ReactNode
  className?: string
  /** Classes for the scrolling row (gap, padding, snap). */
  viewportClassName?: string
  /** Ref to the scrolling row, for callers that scroll it themselves. */
  viewportRef?: React.Ref<HTMLDivElement>
  "aria-label"?: string
  /** Pixels per arrow click and per arrow key. */
  stepPx?: number
  /** Show the overflow-aware scroll buttons. */
  arrows?: boolean
  /** Enable click-and-drag scrolling. */
  drag?: boolean
  /** Fade the edges that have more content past them. */
  fade?: boolean
  /** Snap items to the start edge (give items `snap-start`). */
  snap?: boolean
  /** Centered layer above the row, e.g. the month label on a calendar. */
  overlay?: React.ReactNode
  /** Single click on an arrow jumps to the nearest landmark instead of stepping. */
  onJumpToNearest?: (direction: "left" | "right") => void
  /** Double click on an arrow jumps to the first or last landmark instead of the edge. */
  onJumpToFirstLast?: (direction: "left" | "right") => void
  onScroll?: React.UIEventHandler<HTMLDivElement>
}

/**
 * Horizontal slider for any row of items: scroll buttons that step on click,
 * glide while held and jump on double-click; click-and-drag; arrow keys,
 * Home and End; and edge fades that show where more content is.
 */
function DialslideTrack({
  children,
  className,
  viewportClassName,
  viewportRef: forwardedViewportRef,
  "aria-label": ariaLabel,
  stepPx = DEFAULT_STEP_PX,
  arrows = true,
  drag = true,
  fade = true,
  snap = false,
  overlay,
  onJumpToNearest,
  onJumpToFirstLast,
  onScroll,
}: DialslideTrackProps) {
  const viewportRef = React.useRef<HTMLDivElement | null>(null)
  const { canScrollLeft, canScrollRight } = useDialslideOverflow(viewportRef)
  const { dragging, handlers } = useDialslideDrag(viewportRef, drag)
  const canScroll = canScrollLeft || canScrollRight

  const setViewportRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      viewportRef.current = node
      if (typeof forwardedViewportRef === "function") {
        forwardedViewportRef(node)
      } else if (forwardedViewportRef) {
        forwardedViewportRef.current = node
      }
    },
    [forwardedViewportRef]
  )

  function jumpToEdge(direction: "left" | "right") {
    const viewport = viewportRef.current
    if (!viewport) {
      return
    }
    viewport.scrollTo({
      left: direction === "left" ? 0 : viewport.scrollWidth,
      behavior: "smooth",
    })
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const viewport = viewportRef.current
    if (!viewport || event.target !== viewport) {
      return
    }
    const moves: Record<string, () => void> = {
      ArrowLeft: () =>
        onJumpToNearest
          ? onJumpToNearest("left")
          : viewport.scrollBy({ left: -stepPx, behavior: "smooth" }),
      ArrowRight: () =>
        onJumpToNearest
          ? onJumpToNearest("right")
          : viewport.scrollBy({ left: stepPx, behavior: "smooth" }),
      Home: () =>
        onJumpToFirstLast ? onJumpToFirstLast("left") : jumpToEdge("left"),
      End: () =>
        onJumpToFirstLast ? onJumpToFirstLast("right") : jumpToEdge("right"),
    }
    const move = moves[event.key]
    if (move) {
      event.preventDefault()
      move()
    }
  }

  const fadeMask = fade
    ? `linear-gradient(to right, ${canScrollLeft ? "transparent" : "#000"}, #000 2.5rem, #000 calc(100% - 2.5rem), ${canScrollRight ? "transparent" : "#000"})`
    : undefined

  function rendersArrow(direction: "left" | "right") {
    const visible = direction === "left" ? canScrollLeft : canScrollRight
    return (
      <div
        className={cn(
          "absolute top-1/2 z-10 -translate-y-1/2 transition-opacity duration-200",
          direction === "left" ? "left-1" : "right-1",
          visible ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-hidden={!visible}
      >
        <ScrollHorizontalButton
          direction={direction}
          scrollContainerRef={viewportRef}
          singleStepPx={stepPx}
          singleClickJumpMode={onJumpToNearest ? "nearestConcern" : undefined}
          doubleClickJumpMode={onJumpToFirstLast ? "firstLastConcern" : "edge"}
          onJumpToEdge={() => jumpToEdge(direction)}
          onJumpToNearestConcern={onJumpToNearest}
          onJumpToFirstLastConcern={onJumpToFirstLast}
        />
      </div>
    )
  }

  return (
    <div
      data-slot="dialslide"
      className={cn("relative flex w-full min-w-0 flex-col", className)}
    >
      {overlay ? (
        <div
          data-slot="dialslide-overlay"
          className="pointer-events-none flex h-6 items-center justify-center text-sm font-semibold tracking-tight"
          aria-live="polite"
        >
          {overlay}
        </div>
      ) : null}
      <div className="relative min-w-0">
        {arrows ? rendersArrow("left") : null}
        <div
          ref={setViewportRef}
          role="region"
          aria-label={ariaLabel}
          aria-keyshortcuts="ArrowLeft ArrowRight Home End"
          tabIndex={canScroll ? 0 : -1}
          data-slot="dialslide-viewport"
          data-dragging={dragging || undefined}
          className={cn(
            // relative: items measure offsetLeft in scroll-content coordinates.
            "relative flex touch-pan-x gap-2 overflow-x-auto overflow-y-hidden overscroll-x-contain py-2 [scrollbar-width:none] focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none [&::-webkit-scrollbar]:hidden",
            arrows && "px-10",
            snap && !dragging && "snap-x snap-mandatory",
            drag && canScroll && (dragging ? "cursor-grabbing select-none" : "cursor-grab"),
            viewportClassName
          )}
          style={{
            maskImage: fadeMask,
            WebkitMaskImage: fadeMask,
            scrollPaddingInline: arrows ? "2.5rem" : undefined,
          }}
          onKeyDown={handleKeyDown}
          onScroll={onScroll}
          {...handlers}
        >
          {children}
        </div>
        {arrows ? rendersArrow("right") : null}
      </div>
    </div>
  )
}

//#endregion

//#region Calendar

const ISO_FORMAT = "yyyy-MM-dd"
const DEFAULT_LENGTH = 56
const DEFAULT_DAYS_BEFORE_TODAY = 14
const NO_EVENTS: Record<string, DialslideEvent> = {}

export type DialslideEvent = {
  count?: number
  note?: string
  tone?: "default" | "accent" | "warning"
}

type DialslideDay = {
  iso: string
  date: Date
  weekday: string
  dayOfMonth: number
  event?: DialslideEvent
  isToday: boolean
  isPast: boolean
  endsWeek: boolean
}

const TONE_CLASS: Record<NonNullable<DialslideEvent["tone"]>, string> = {
  default: "border-foreground/40",
  accent: "border-emerald-500/70 dark:border-emerald-400/70",
  warning: "border-amber-500/70 dark:border-amber-400/70",
}

function todayIso() {
  return format(new Date(), ISO_FORMAT)
}

function buildsDialslideDays({
  from,
  length,
  today,
  events,
  weekStartsOn,
}: {
  from: string
  length: number
  today: string
  events: Record<string, DialslideEvent>
  weekStartsOn: 0 | 1
}): DialslideDay[] {
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

function describesDay(day: DialslideDay | undefined) {
  if (!day) {
    return ""
  }
  if (day.event?.note) {
    return day.event.note
  }
  const count = day.event?.count ?? 0
  return count === 1 ? "1 entry" : `${count} entries`
}

type DialslideCalendarProps = {
  variant: "calendar"
  className?: string
  /** First day, `yyyy-MM-dd`. Defaults to two weeks before today. */
  from?: string
  /** Number of days to show. */
  length?: number
  /** Events keyed by `yyyy-MM-dd`. */
  events?: Record<string, DialslideEvent>
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
}

/**
 * Scrolling calendar strip of square day cubes. Starts centered on the
 * selected day, shows the month in view, and its arrows hop between days
 * that have events (double-click for the first or last one).
 */
function DialslideCalendar({
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
}: DialslideCalendarProps) {
  const today = todayProp ?? todayIso()
  const start =
    from ?? format(addDays(parseISO(today), -DEFAULT_DAYS_BEFORE_TODAY), ISO_FORMAT)

  // The grid pages through whole months, so widen the range to full months.
  const days = React.useMemo(() => {
    if (layout !== "grid") {
      return buildsDialslideDays({ from: start, length, today, events, weekStartsOn })
    }
    const first = startOfMonth(parseISO(start))
    const last = endOfMonth(addDays(parseISO(start), Math.max(length, 1) - 1))
    return buildsDialslideDays({
      from: format(first, ISO_FORMAT),
      length: differenceInCalendarDays(last, first) + 1,
      today,
      events,
      weekStartsOn,
    })
  }, [layout, start, length, today, events, weekStartsOn])

  const months = React.useMemo(() => {
    const byMonth = new Map<string, DialslideDay[]>()
    for (const day of days) {
      const key = day.iso.slice(0, 7)
      byMonth.set(key, [...(byMonth.get(key) ?? []), day])
    }
    return [...byMonth].map(([key, monthDays]) => ({ key, days: monthDays }))
  }, [days])

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
  const pageRefs = React.useRef(new Map<string, HTMLElement>())
  const frameRef = React.useRef<number | null>(null)

  const eventIsos = React.useMemo(
    () => days.filter((day) => (day.event?.count ?? 0) > 0).map((day) => day.iso),
    [days]
  )
  const current = days.find((day) => day.iso === selected)

  function scrollsToDay(iso: string, behavior: ScrollBehavior = "smooth") {
    const viewport = viewportRef.current
    const item =
      layout === "grid"
        ? pageRefs.current.get(iso.slice(0, 7))
        : itemRefs.current.get(iso)
    if (viewport && item) {
      scrollsDialslideToItem(viewport, item, behavior)
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
    if (!selected || !viewport) {
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
    let best: DialslideDay | undefined
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

  /** Grid arrows flip one month; double-click goes to the first or last. */
  function flipsMonth(direction: "left" | "right", toEnd = false) {
    const viewport = viewportRef.current
    if (!viewport || months.length === 0) {
      return
    }
    const center = viewport.scrollLeft + viewport.clientWidth / 2
    let index = 0
    let bestDistance = Infinity
    months.forEach((month, monthIndex) => {
      const page = pageRefs.current.get(month.key)
      if (!page) {
        return
      }
      const distance = Math.abs(page.offsetLeft + page.offsetWidth / 2 - center)
      if (distance < bestDistance) {
        index = monthIndex
        bestDistance = distance
      }
    })
    const step = direction === "right" ? 1 : -1
    const target = toEnd
      ? months[direction === "right" ? months.length - 1 : 0]
      : months[Math.min(months.length - 1, Math.max(0, index + step))]
    const page = target && pageRefs.current.get(target.key)
    if (page) {
      scrollsDialslideToItem(viewport, page)
    }
  }

  function jumpsToFirstLastEvent(direction: "left" | "right") {
    const target = direction === "left" ? eventIsos[0] : eventIsos.at(-1)
    if (target) {
      selects(target)
    }
  }

  function rendersCube(day: DialslideDay, fillsCell: boolean) {
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
          // Grid tiles stay square when narrow and widen to 3:2 on roomy layouts.
          fillsCell ? "w-full @2xl:aspect-[3/2]" : "size-20",
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
    const weekdayHeaders = Array.from({ length: 7 }, (_, index) =>
      format(addDays(parseISO("2023-01-01"), index + weekStartsOn), "EEE")
    )

    return (
      <div
        data-slot="dialslide-calendar"
        className={cn("@container flex w-full min-w-0 flex-col gap-2", className)}
      >
        <DialslideTrack
          aria-label="Calendar months"
          viewportRef={viewportRef}
          viewportClassName="gap-6 py-2"
          snap
          overlay={<span key={monthLabel} className="animate-in fade-in duration-200">{monthLabel}</span>}
          onScroll={handleScroll}
          onJumpToNearest={(direction) => flipsMonth(direction)}
          onJumpToFirstLast={(direction) => flipsMonth(direction, true)}
        >
          {months.map((month) => {
            const lead = (getDay(month.days[0].date) - weekStartsOn + 7) % 7
            return (
              <div
                key={month.key}
                ref={(node) => {
                  if (node) {
                    pageRefs.current.set(month.key, node)
                  } else {
                    pageRefs.current.delete(month.key)
                  }
                }}
                role="group"
                aria-label={format(month.days[0].date, "MMMM yyyy")}
                className="grid w-full shrink-0 snap-center grid-cols-7 content-start gap-2 p-1"
              >
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
                {month.days.map((day) => (
                  <div
                    key={day.iso}
                    ref={(node) => {
                      if (node) {
                        itemRefs.current.set(day.iso, node)
                      } else {
                        itemRefs.current.delete(day.iso)
                      }
                    }}
                  >
                    {rendersCube(day, true)}
                  </div>
                ))}
              </div>
            )
          })}
        </DialslideTrack>
        {footer}
      </div>
    )
  }

  return (
    <div
      data-slot="dialslide-calendar"
      className={cn("flex w-full min-w-0 flex-col gap-2", className)}
    >
      <DialslideTrack
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
      </DialslideTrack>
      {footer}
    </div>
  )
}

//#endregion

type DialslideProps = DialslideTrackProps | DialslideCalendarProps

/**
 * One horizontal slider for everything that scrolls sideways.
 *
 * - Default: any row of children, with scroll buttons (click steps, hold
 *   glides, double-click jumps), drag, arrow/Home/End keys and edge fades.
 * - `variant="calendar"`: square day cubes over a date range, centered on
 *   the selected day, with the month in view and arrows that hop between
 *   days that have events. `layout="grid"` slides between whole-month pages.
 */
function Dialslide(props: DialslideProps) {
  if (props.variant === "calendar") {
    return <DialslideCalendar {...props} />
  }
  return <DialslideTrack {...props} />
}

export { Dialslide, scrollsDialslideToItem }
export type { DialslideCalendarProps, DialslideProps, DialslideTrackProps }
