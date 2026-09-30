"use client"

import { useState } from "react"

import { CalendarHeatmap } from "@/components/standard/calendar-heatmap"
import {
  DEMO_ACTIVITY_END,
  definesActivityDays,
} from "@/features/standard-library/components/demos/shared/definesActivityDays"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const COMMITS = definesActivityDays()
const RUNS = definesActivityDays({ seed: 21, days: 26 * 7, busy: 0.5 })

export function RendersStandardCalendarHeatmapDemo() {
  const [day, setDay] = useState<string | null>(null)

  return (
    <div data-fill className="flex w-full flex-col gap-3">
      <RendersDemoCard fill label="a year of commits · today is marked">
        <CalendarHeatmap
          data={COMMITS}
          end={DEMO_ACTIVITY_END}
          today={DEMO_ACTIVITY_END}
          unit="commit"
          color="oklch(0.66 0.17 150)"
          value={day}
          onValueChange={setDay}
          caption={day ? `Picked ${day}` : "Hover a day, or click to pick"}
          aria-label="Commits by day"
        />
      </RendersDemoCard>
      <RendersDemoCard fill label="26 weeks · monday start · round">
        <CalendarHeatmap
          data={RUNS}
          end={DEMO_ACTIVITY_END}
          today={DEMO_ACTIVITY_END}
          weeks={26}
          weekStartsOn={1}
          shape="round"
          size="lg"
          unit="run"
          color="oklch(0.65 0.2 25)"
          legend={false}
          aria-label="Runs by day"
        />
      </RendersDemoCard>
    </div>
  )
}
