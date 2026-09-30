"use client"

import { ActivityOverview } from "@/components/standard/activity-overview"
import {
  DEMO_ACTIVITY_END,
  definesActivityDays,
} from "@/features/standard-library/components/demos/shared/definesActivityDays"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const COMMITS = definesActivityDays({ seed: 3 })
const REPOS = ["jayrr.dev", "JayrrBudget", "JayrrVideos", "starterkit"]

export function RendersStandardActivityOverviewDemo() {
  return (
    <div data-fill className="flex w-full flex-col gap-3">
      <RendersDemoCard fill label="contributions · pick a day">
        <ActivityOverview
          title="Contributions"
          unit="commit"
          data={COMMITS}
          end={DEMO_ACTIVITY_END}
          color="oklch(0.66 0.17 150)"
          defaultValue={DEMO_ACTIVITY_END}
          actions={
            <span className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
              Last 12 months
            </span>
          }
          renderDay={(day) =>
            day.value === 0 ? (
              <span className="text-muted-foreground">A day off.</span>
            ) : (
              <ul className="flex flex-col gap-1">
                {REPOS.slice(
                  0,
                  Math.min(REPOS.length, Math.ceil(day.value / 3))
                ).map((repo, index) => (
                  <li key={repo} className="flex justify-between gap-3">
                    <span className="font-mono text-xs">{repo}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {Math.max(1, Math.round(day.value / (index + 2)))} commits
                    </span>
                  </li>
                ))}
              </ul>
            )
          }
        />
      </RendersDemoCard>
    </div>
  )
}
