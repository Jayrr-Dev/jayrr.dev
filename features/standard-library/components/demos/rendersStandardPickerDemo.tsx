"use client"

import { useRef, useState } from "react"

import { StandardText } from "@/components/standard/accordion"
import { CalendarSlider } from "@/components/standard/calendar-slider"
import { DatePicker, FilterSelect, MultiSelect } from "@/components/standard/filter-select"
import { ScrollArea } from "@/components/standard/scroll-area"
import { ScrollHorizontalButton } from "@/components/standard/scroll-horizontal-button"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const DAYS = [
  { id: "mon", label: "Mon", count: 2, note: "Two jobs" },
  { id: "tue", label: "Tue", count: 4, note: "Crew on site" },
  { id: "wed", label: "Wed", count: 1, note: "One hold" },
  { id: "thu", label: "Thu", count: 0, note: "Clear" },
  { id: "fri", label: "Fri", count: 6, note: "Full day" },
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
      <RendersDemoCard className="w-full max-w-xl" label="Calendar slider">
        <CalendarSlider days={DAYS} defaultValue="tue" />
      </RendersDemoCard>
    )
  }

  if (pieceName === "Calendar Slider Day Popover") {
    return (
      <RendersDemoCard className="w-full max-w-xl" label="Calendar slider · day popover">
        <CalendarSlider days={DAYS} defaultValue="tue" showDayPopover />
      </RendersDemoCard>
    )
  }

  if (pieceName === "Calendar Slider Footer List") {
    return (
      <RendersDemoCard className="w-full max-w-xl" label="Calendar slider · footer">
        <CalendarSlider days={DAYS} defaultValue="tue" showFooter />
      </RendersDemoCard>
    )
  }

  if (pieceName === "Privacy Calendar") {
    return (
      <RendersDemoCard className="w-full max-w-xl" label="Calendar slider · counts hidden">
        <CalendarSlider days={DAYS} defaultValue="tue" hideCounts />
      </RendersDemoCard>
    )
  }

  if (pieceName === "Render Calendar Grid") {
    return (
      <RendersDemoCard className="w-full max-w-xl" label="Calendar slider · grid">
        <CalendarSlider days={DAYS} defaultValue="tue" layout="grid" />
      </RendersDemoCard>
    )
  }

  if (pieceName === "Date Picker" || pieceName === "Calendar") {
    return (
      <RendersDemoCard label="Date picker">
        <DatePicker defaultValue="2026-09-22" />
      </RendersDemoCard>
    )
  }

  if (pieceName === "Multi Select") {
    return (
      <RendersDemoCard label="Multi select">
        <MultiSelect
          options={[
            { value: "alpha", label: "Alpha" },
            { value: "bravo", label: "Bravo" },
            { value: "charlie", label: "Charlie" },
          ]}
        />
      </RendersDemoCard>
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
      <RendersDemoCard className="w-full max-w-xl" label="Calendar slider · footer">
        <CalendarSlider days={DAYS} showFooter showDayPopover />
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
