"use client"

import { useRef, useState } from "react"
import { addDays, format } from "date-fns"

import { StandardText } from "@/components/standard/accordion"
import {
  CalendarSlider,
  type CalendarSliderEvent,
} from "@/components/standard/calendar-slider"
import { DatePicker, FilterSelect, MultiSelect } from "@/components/standard/filter-select"
import { ScrollArea } from "@/components/standard/scroll-area"
import { ScrollHorizontalButton } from "@/components/standard/scroll-horizontal-button"
import { ThinScrollbar } from "@/components/standard/scrollbar"
import { Slider } from "@/components/standard/slider"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

/** Events placed relative to today so the strip always has something nearby. */
const CALENDAR_EVENT_OFFSETS: [number, CalendarSliderEvent][] = [
  [-9, { count: 2, note: "Two jobs closed out" }],
  [-6, { count: 1, note: "Site walk" }],
  [-2, { count: 3, note: "Crew on site", tone: "accent" }],
  [0, { count: 4, note: "Crew on site", tone: "accent" }],
  [1, { count: 1, note: "One hold", tone: "warning" }],
  [3, { count: 6, note: "Full day", tone: "accent" }],
  [8, { count: 2, note: "Inspections" }],
  [12, { count: 1, note: "Permit renewal", tone: "warning" }],
  [19, { count: 5, note: "Pour day", tone: "accent" }],
  [27, { count: 2, note: "Walkthrough" }],
]

const CALENDAR_EVENTS: Record<string, CalendarSliderEvent> = Object.fromEntries(
  CALENDAR_EVENT_OFFSETS.map(([offset, event]) => [
    format(addDays(new Date(), offset), "yyyy-MM-dd"),
    event,
  ])
)

const SLIDER_CHIPS = Array.from({ length: 30 }, (_, index) => `Job ${1040 + index}`)

const SLIDER_CARDS = [
  { title: "North yard", meta: "4 crews" },
  { title: "Harbor line", meta: "2 crews" },
  { title: "East depot", meta: "Idle" },
  { title: "Ridge road", meta: "6 crews" },
  { title: "Mill street", meta: "1 crew" },
  { title: "Canal works", meta: "3 crews" },
  { title: "Airport spur", meta: "Idle" },
  { title: "South bank", meta: "5 crews" },
]

const WEEK_OPTIONS = [
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "year", label: "This year" },
]

const SCROLL_STRIP_ITEMS = Array.from(
  { length: 18 },
  (_, index) => `Chip ${index + 1}`
)

const SCROLL_STRIP_STEP_PX = 140

function RendersScrollHorizontalButtonDemo() {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  function jumpToStart() {
    scrollContainerRef.current?.scrollTo({ left: 0, behavior: "smooth" })
  }

  function jumpToEnd() {
    const element = scrollContainerRef.current
    if (!element) {
      return
    }
    element.scrollTo({ left: element.scrollWidth, behavior: "smooth" })
  }

  return (
    <RendersDemoCard className="w-full max-w-xl" label="click · hold · double-click">
      <div className="relative w-full overflow-hidden rounded-md border border-border px-10 py-3">
        <div className="absolute top-1/2 left-1 z-20 -translate-y-1/2">
          <ScrollHorizontalButton
            direction="left"
            scrollContainerRef={scrollContainerRef}
            onJumpToEdge={jumpToStart}
            singleStepPx={SCROLL_STRIP_STEP_PX}
          />
        </div>
        <div className="absolute top-1/2 right-1 z-20 -translate-y-1/2">
          <ScrollHorizontalButton
            direction="right"
            scrollContainerRef={scrollContainerRef}
            onJumpToEdge={jumpToEnd}
            singleStepPx={SCROLL_STRIP_STEP_PX}
          />
        </div>
        <div
          ref={scrollContainerRef}
          className="scrollbar-thin flex gap-2 overflow-x-auto overflow-y-hidden py-1"
        >
          {SCROLL_STRIP_ITEMS.map((label) => (
            <div
              key={label}
              className="shrink-0 rounded-sm border border-border/60 bg-muted/30 px-3 py-2 text-xs text-foreground"
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    </RendersDemoCard>
  )
}

function RendersFilterAlias({
  label,
  placeholder,
  options,
}: {
  label: string
  placeholder: string
  options: { value: string; label: string; group?: string }[]
}) {
  const [value, setValue] = useState("")

  return (
    <RendersDemoCard label={label}>
      <FilterSelect
        placeholder={placeholder}
        options={options}
        value={value}
        onValueChange={setValue}
      />
    </RendersDemoCard>
  )
}

export function RendersStandardPickerDemo({
  pieceName,
}: {
  pieceName: string
}) {
  if (pieceName === "Calendar Slider") {
    return (
      <RendersDemoCard fill label="Calendar slider · arrows hop between events">
        <CalendarSlider events={CALENDAR_EVENTS} />
      </RendersDemoCard>
    )
  }

  if (pieceName === "Calendar Slider Day Popover") {
    return (
      <RendersDemoCard fill label="Calendar slider · day popover">
        <CalendarSlider events={CALENDAR_EVENTS} showDayPopover />
      </RendersDemoCard>
    )
  }

  if (pieceName === "Calendar Slider Footer List") {
    return (
      <RendersDemoCard fill label="Calendar slider · footer">
        <CalendarSlider events={CALENDAR_EVENTS} showFooter />
      </RendersDemoCard>
    )
  }

  if (pieceName === "Privacy Calendar") {
    return (
      <RendersDemoCard fill label="Calendar slider · counts hidden">
        <CalendarSlider events={CALENDAR_EVENTS} hideCounts showDayPopover />
      </RendersDemoCard>
    )
  }

  if (pieceName === "Render Calendar Grid") {
    return (
      <RendersDemoCard className="w-full max-w-xl" label="Calendar slider · grid">
        <CalendarSlider events={CALENDAR_EVENTS} layout="grid" length={28} />
      </RendersDemoCard>
    )
  }

  if (pieceName === "Date Picker" || pieceName === "Calendar") {
    return (
      <>
        <RendersDemoCard label="Date picker">
          <DatePicker aria-label="Date" defaultValue="2026-09-22" className="w-full" />
        </RendersDemoCard>
        <RendersDemoCard label="invalid">
          <DatePicker aria-label="Date" className="w-full" invalid />
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Multi Select") {
    return (
      <>
        <RendersDemoCard label="Multi select">
          <MultiSelect
            options={[
              { value: "alpha", label: "Alpha" },
              { value: "bravo", label: "Bravo" },
              { value: "charlie", label: "Charlie" },
            ]}
            defaultValues={["bravo"]}
          />
        </RendersDemoCard>
        <RendersDemoCard label="indicator checkbox">
          <MultiSelect
            indicator="checkbox"
            options={[
              { value: "alpha", label: "Alpha" },
              { value: "bravo", label: "Bravo" },
              { value: "charlie", label: "Charlie" },
            ]}
            defaultValues={["alpha", "charlie"]}
          />
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Slider") {
    // Sliders need the width, so these stack instead of going to Masonry.
    return (
      <div data-fill className="flex w-full flex-col gap-3">
        <RendersDemoCard label="click steps · hold glides · double-click jumps · drag">
          <Slider aria-label="Jobs">
            {SLIDER_CHIPS.map((label) => (
              <span
                key={label}
                className="shrink-0 rounded-full border border-border bg-muted/30 px-3 py-1.5 text-xs font-medium"
              >
                {label}
              </span>
            ))}
          </Slider>
        </RendersDemoCard>
        <RendersDemoCard label="snap · square cards">
          <Slider aria-label="Sites" snap viewportClassName="gap-3">
            {SLIDER_CARDS.map((card) => (
              <div
                key={card.title}
                className="flex size-36 shrink-0 snap-start flex-col justify-end rounded-xl border border-border bg-muted/30 p-3"
              >
                <span className="text-sm font-semibold">{card.title}</span>
                <span className="text-xs text-muted-foreground">{card.meta}</span>
              </div>
            ))}
          </Slider>
        </RendersDemoCard>
        <RendersDemoCard label="drag only · no arrows">
          <Slider aria-label="Jobs, drag to scroll" arrows={false}>
            {SLIDER_CHIPS.map((label) => (
              <span
                key={label}
                className="shrink-0 rounded-md border border-border/60 px-3 py-2 text-xs"
              >
                {label}
              </span>
            ))}
          </Slider>
        </RendersDemoCard>
        <RendersDemoCard label="calendar slider">
          <CalendarSlider events={CALENDAR_EVENTS} />
        </RendersDemoCard>
      </div>
    )
  }

  if (pieceName === "Scroll Horizontal Button") {
    return <RendersScrollHorizontalButtonDemo />
  }

  if (pieceName === "Scroll Area") {
    return (
      <RendersDemoCard className="w-full max-w-xl" label="Scroll area">
        <ScrollArea>
          <p>Week 1 hours</p>
          <p>Week 2 hours</p>
          <p>Week 3 hours</p>
          <p>Week 4 hours</p>
        </ScrollArea>
      </RendersDemoCard>
    )
  }

  if (pieceName === "Thin Scrollbar") {
    return (
      <>
        <RendersDemoCard className="w-full max-w-xl" label="thin">
          <ThinScrollbar className="h-28 w-full">
            <p>Week 1 hours</p>
            <p>Week 2 hours</p>
            <p>Week 3 hours</p>
            <p>Week 4 hours</p>
            <p>Week 5 hours</p>
            <p>Week 6 hours</p>
            <p>Week 7 hours</p>
            <p>Week 8 hours</p>
          </ThinScrollbar>
        </RendersDemoCard>
        <RendersDemoCard label="class only">
          <div className="scrollbar-thin h-28 w-full overflow-auto rounded-lg border border-border p-2 text-sm">
            <p>Chip row</p>
            <p>Chip row</p>
            <p>Chip row</p>
            <p>Chip row</p>
            <p>Chip row</p>
            <p>Chip row</p>
          </div>
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Renders Scroll Vertical Arrows") {
    return (
      <RendersDemoCard className="w-full max-w-xl" label="Scroll area · arrows">
        <ScrollArea showArrows>
          <p>Week 1 hours</p>
          <p>Week 2 hours</p>
          <p>Week 3 hours</p>
          <p>Week 4 hours</p>
        </ScrollArea>
      </RendersDemoCard>
    )
  }

  if (pieceName === "Scroll Dismiss Banner") {
    return (
      <RendersDemoCard label="Not built">
        <StandardText>Dismiss banner is not a picker.</StandardText>
      </RendersDemoCard>
    )
  }

  if (
    pieceName === "Renders Defines Calendar Legend Footer" ||
    pieceName === "Renders Defines Calendar Legend Popover Content"
  ) {
    return (
      <RendersDemoCard fill label="Calendar slider · footer">
        <CalendarSlider events={CALENDAR_EVENTS} showFooter showDayPopover />
      </RendersDemoCard>
    )
  }

  const optionSets: Record<string, { placeholder: string; options: { value: string; label: string; group?: string }[] }> = {
    "Filter Select": { placeholder: "Period", options: WEEK_OPTIONS },
    "Month Select": {
      placeholder: "Month",
      options: [
        { value: "sep", label: "September" },
        { value: "oct", label: "October" },
      ],
    },
    "Department Select": {
      placeholder: "Department",
      options: [
        { value: "eng", label: "Engineering", group: "Field" },
        { value: "ops", label: "Operations", group: "Field" },
      ],
    },
    "Period Filter": { placeholder: "Period", options: WEEK_OPTIONS },
    "View Mode Filter": {
      placeholder: "View",
      options: [
        { value: "table", label: "Table" },
        { value: "grid", label: "Grid" },
      ],
    },
  }

  const preset = optionSets[pieceName] ?? {
    placeholder: pieceName,
    options: WEEK_OPTIONS,
  }

  return (
    <RendersFilterAlias
      label={`Filter select · ${preset.placeholder}`}
      placeholder={preset.placeholder}
      options={preset.options}
    />
  )
}
