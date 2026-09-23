"use client"

import * as React from "react"
import { cn } from "cn"

import { Button } from "@/components/standard/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/standard/popover"

export type CalendarDay = {
  id: string
  label: string
  count?: number
  note?: string
}

function CalendarSlider({
  className,
  days,
  value,
  defaultValue,
  onValueChange,
  showDayPopover = false,
  showFooter = false,
  hideCounts = false,
  layout = "strip",
}: {
  className?: string
  days: CalendarDay[]
  value?: string
  defaultValue?: string
  onValueChange?: (id: string) => void
  showDayPopover?: boolean
  showFooter?: boolean
  hideCounts?: boolean
  layout?: "strip" | "grid"
}) {
  const [uncontrolled, setUncontrolled] = React.useState(
    defaultValue ?? days[0]?.id
  )
  const selected = value ?? uncontrolled
  const current = days.find((day) => day.id === selected)

  function select(id: string) {
    if (value === undefined) {
      setUncontrolled(id)
    }
    onValueChange?.(id)
  }

  const trackClass =
    layout === "grid" ? "grid grid-cols-5 gap-1" : "flex gap-1 overflow-x-auto"

  return (
    <div data-slot="calendar-slider" className={cn("flex w-full flex-col gap-2", className)}>
      <div className={trackClass}>
        {days.map((day) => {
          const isOn = day.id === selected
          const cube = (
            <Button
              tone={isOn ? "default" : "outline"}
              size="sm"
              className="h-14 min-w-12 flex-col gap-0 px-2"
              onClick={() => select(day.id)}
            >
              <span className="text-xs font-semibold">{day.label}</span>
              {hideCounts || day.count === undefined ? null : (
                <span className="text-[10px] opacity-80">{day.count}</span>
              )}
            </Button>
          )

          if (!showDayPopover) {
            return <div key={day.id}>{cube}</div>
          }

          return (
            <Popover key={day.id}>
              <PopoverTrigger asChild>{cube}</PopoverTrigger>
              <PopoverContent className="w-44">
                <p className="text-xs font-semibold">{day.label}</p>
                <p className="text-xs text-muted-foreground">
                  {day.note ?? `${day.count ?? 0} entries`}
                </p>
              </PopoverContent>
            </Popover>
          )
        })}
      </div>
      {showFooter ? (
        <p className="text-xs text-muted-foreground">
          {current?.label}: {current?.note ?? `${current?.count ?? 0} entries`}
        </p>
      ) : null}
    </div>
  )
}

export { CalendarSlider }
