"use client"

import { Heatmap } from "@/components/standard/heatmap"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const HOURS = Array.from({ length: 24 }, (_, hour) => hour)

/** Visits by weekday and hour: a lunch bump and an evening peak. */
const VISITS = DAYS.map((_, day) =>
  HOURS.map((hour) => {
    const weekend = day >= 5
    const lunch = Math.exp(-((hour - 12.5) ** 2) / 3)
    const evening = Math.exp(-((hour - 20) ** 2) / 5)
    const night = hour < 6 ? 0.05 : 1
    const base = (weekend ? 0.6 : 1) * (lunch * 40 + evening * 70) * night
    return Math.round(base + ((day * 31 + hour * 17) % 9))
  })
)

const hourLabel = (hour: number) =>
  hour === 0
    ? "12a"
    : hour < 12
      ? `${hour}a`
      : hour === 12
        ? "12p"
        : `${hour - 12}p`

export function RendersStandardHeatmapDemo() {
  return (
    <div className="flex w-full flex-col gap-3">
      <RendersDemoCard label="visits by weekday and hour · hover or pick a cell">
        <Heatmap
          values={VISITS}
          rowLabels={DAYS}
          columnLabels={HOURS.map((hour) =>
            hour % 3 === 0 ? hourLabel(hour) : ""
          )}
          size="lg"
          color="oklch(0.62 0.19 260)"
          selectable
          formatCell={(cell) =>
            `${cell.value} visits · ${DAYS[cell.row]} ${hourLabel(cell.column)}`
          }
          caption="Last 30 days"
          aria-label="Visits by weekday and hour"
        />
      </RendersDemoCard>
      <RendersDemoCard label="round · 3 levels · no labels">
        <Heatmap
          values={VISITS.slice(0, 3).map((row) => row.slice(8, 20))}
          shape="round"
          size="xl"
          levels={3}
          color="oklch(0.7 0.16 45)"
        />
      </RendersDemoCard>
    </div>
  )
}
