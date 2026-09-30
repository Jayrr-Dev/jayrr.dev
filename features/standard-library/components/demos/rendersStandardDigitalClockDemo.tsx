"use client"

import { useState } from "react"

import { DigitalClock } from "@/components/standard/digital-clock"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"
import { cn } from "@/lib/utils"

const ledColors = [
  { label: "Red", value: "oklch(0.63 0.25 27)" },
  { label: "Amber", value: "oklch(0.8 0.17 70)" },
  { label: "Green", value: "oklch(0.85 0.2 145)" },
  { label: "Blue", value: "oklch(0.7 0.16 240)" },
  { label: "White", value: "oklch(0.97 0 0)" },
]

const options = [
  "24-hour",
  "seconds",
  "AM/PM",
  "ghost",
  "glow",
  "blink",
  "framed",
] as const
type Option = (typeof options)[number]

const zones = [
  { city: "New York", zone: "America/New_York" },
  { city: "London", zone: "Europe/London" },
  { city: "Tokyo", zone: "Asia/Tokyo" },
]

function RendersToggles({
  value,
  onChange,
}: {
  value: Set<Option>
  onChange: (next: Set<Option>) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((entry) => {
        const on = value.has(entry)
        return (
          <button
            key={entry}
            type="button"
            aria-pressed={on}
            onClick={() => {
              const next = new Set(value)
              if (on) next.delete(entry)
              else next.add(entry)
              onChange(next)
            }}
            className={cn(
              "rounded-md border border-border px-2 py-1 font-mono text-xs transition-colors",
              on
                ? "bg-foreground text-background"
                : "bg-background text-muted-foreground hover:text-foreground"
            )}
          >
            {entry}
          </button>
        )
      })}
    </div>
  )
}

function RendersLiveDemo() {
  const [color, setColor] = useState(ledColors[0].value)
  const [enabled, setEnabled] = useState<Set<Option>>(
    () => new Set<Option>(["ghost", "glow", "blink"])
  )

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="w-full rounded-lg bg-black p-6">
        <DigitalClock
          color={color}
          hour12={!enabled.has("24-hour")}
          showSeconds={enabled.has("seconds")}
          showPeriod={enabled.has("AM/PM")}
          ghost={enabled.has("ghost")}
          glow={enabled.has("glow")}
          blink={enabled.has("blink")}
          framed={enabled.has("framed")}
        />
      </div>
      <div className="flex w-full flex-wrap items-center gap-3">
        <RendersToggles value={enabled} onChange={setEnabled} />
        <div className="flex gap-1.5">
          {ledColors.map((entry) => (
            <button
              key={entry.label}
              type="button"
              aria-label={entry.label}
              aria-pressed={entry.value === color}
              onClick={() => setColor(entry.value)}
              className={cn(
                "size-6 rounded-full border-2 border-black/90 ring-offset-2 ring-offset-background",
                entry.value === color && "ring-2 ring-foreground"
              )}
              style={{ background: entry.value }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export function RendersStandardDigitalClockDemo() {
  return (
    <div data-fill className="flex w-full flex-col gap-3">
      <RendersDemoCard fill label="live · local time">
        <RendersLiveDemo />
      </RendersDemoCard>
      <RendersDemoCard fill label="framed · a fixed time">
        <DigitalClock
          framed
          time={new Date(2026, 0, 1, 10, 23)}
          blink={false}
        />
      </RendersDemoCard>
      <RendersDemoCard fill label="world clocks">
        <div className="grid w-full grid-cols-3 gap-3">
          {zones.map(({ city, zone }) => (
            <div
              key={zone}
              className="flex flex-col gap-2 rounded-lg bg-black p-3"
            >
              <DigitalClock
                timeZone={zone}
                hour12={false}
                color="oklch(0.85 0.2 145)"
                label={`${city} time`}
              />
              <span className="text-center font-mono text-xs text-white/60">
                {city}
              </span>
            </div>
          ))}
        </div>
      </RendersDemoCard>
    </div>
  )
}
