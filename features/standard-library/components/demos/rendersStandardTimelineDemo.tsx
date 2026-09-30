"use client"

import { useState } from "react"
import {
  CircleAlertIcon,
  ClockIcon,
  GitMergeIcon,
  RocketIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "lucide-react"

import { Badge } from "@/components/standard/badge"
import {
  Timeline,
  TimelineItem,
  type TimelineConnector,
  type TimelineEntry,
  type TimelineGroupBy,
  type TimelineMarkers,
  type TimelineSide,
} from "@/components/standard/timeline"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"
import { cn } from "@/lib/utils"

const rainbow = [
  "oklch(0.75 0.16 55)",
  "oklch(0.8 0.15 80)",
  "oklch(0.7 0.16 20)",
  "oklch(0.7 0.2 350)",
  "oklch(0.65 0.18 295)",
  "oklch(0.6 0.18 265)",
  "oklch(0.75 0.12 200)",
  "oklch(0.72 0.18 145)",
]

const history: TimelineEntry[] = [
  {
    id: "2020",
    badge: "Foundation",
    date: "2020",
    description: "Founded by a small group of engineers in a spare room.",
  },
  {
    id: "2021",
    badge: "First product",
    date: "2021",
    description: "Launched a project management tool for small teams.",
  },
  {
    id: "2022",
    badge: "Expansion",
    date: "2022",
    description: "Opened eight new offices across three continents.",
  },
  {
    id: "2023",
    badge: "Market leader",
    date: "2023",
    description: "Acquired a competitor and doubled the customer base.",
  },
  {
    id: "2025",
    badge: "New product",
    date: "2025",
    description: "Shipped a second product for finance teams.",
  },
  {
    id: "2026",
    badge: "Alliance",
    date: "2026",
    description: "Partnered with an AI lab on forecasting.",
  },
]

const decades: TimelineEntry[] = [1960, 1970, 1980, 1990, 2000, 2010, 2020].map(
  (year) => ({
    id: String(year),
    date: year,
    title: "Lorem ipsum",
    description: "Amet nam in rutrum integer ullamcorper in dictumst bibendum.",
  })
)

const sides: TimelineSide[] = ["after", "before", "alternate"]
const markerKinds: TimelineMarkers[] = ["number", "ring", "dot", "none"]
const connectors: TimelineConnector[] = ["none", "solid", "dashed", "pin"]

function RendersChoice<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: T[]
  value: T
  onChange: (next: T) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="w-20 text-xs text-muted-foreground">{label}</span>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={option === value}
          onClick={() => onChange(option)}
          className={cn(
            "rounded-md border border-border px-2 py-1 font-mono text-xs transition-colors",
            option === value
              ? "bg-foreground text-background"
              : "bg-background text-muted-foreground hover:text-foreground"
          )}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

function RendersPlayground() {
  const [side, setSide] = useState<TimelineSide>("alternate")
  const [markers, setMarkers] = useState<TimelineMarkers>("number")
  const [connector, setConnector] = useState<TimelineConnector>("dashed")
  const [line, setLine] = useState<"solid" | "dashed" | "dotted">("dashed")

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <RendersChoice
          label="side"
          options={sides}
          value={side}
          onChange={setSide}
        />
        <RendersChoice
          label="markers"
          options={markerKinds}
          value={markers}
          onChange={setMarkers}
        />
        <RendersChoice
          label="connector"
          options={connectors}
          value={connector}
          onChange={setConnector}
        />
        <RendersChoice
          label="line"
          options={["solid", "dashed", "dotted"]}
          value={line}
          onChange={setLine}
        />
      </div>
      <Timeline
        items={history}
        side={side}
        markers={markers}
        connector={connector}
        line={line}
        colors={rainbow}
        size="lg"
      />
    </div>
  )
}

const project: TimelineEntry[] = [
  {
    id: "p1",
    at: "2026-02-02",
    title: "Design request received",
    description: "Scope and drawings from the client.",
  },
  {
    id: "p2",
    at: "2026-02-05",
    title: "Site visit",
    description: "Measured the vault and photographed the existing gear.",
  },
  {
    id: "p3",
    at: "2026-02-19",
    title: "First draft sent",
    trailing: (
      <ClockIcon
        aria-label="6 hours overtime"
        className="size-3.5 text-amber-500"
      />
    ),
    description: "Two weeks after the visit; 6 hours of overtime.",
  },
  {
    id: "p4",
    at: "2026-04-10",
    title: "Waiting on client comments",
    trailing: (
      <CircleAlertIcon
        aria-label="Held up by the client"
        className="size-3.5 text-red-500"
      />
    ),
    description: "Held for seven weeks.",
    color: "oklch(0.7 0.16 20)",
  },
  {
    id: "p5",
    at: "2026-04-14",
    title: "Revisions",
    current: true,
    description: "In progress.",
  },
  {
    id: "p6",
    at: "2026-05-01",
    title: "Issued for construction",
  },
]

const projectOptions = [
  "time spacing",
  "auto line",
  "gap labels",
  "reversed",
  "loading",
  "empty",
] as const
type ProjectOption = (typeof projectOptions)[number]

function RendersProjectHistory() {
  const [enabled, setEnabled] = useState<Set<ProjectOption>>(
    () => new Set<ProjectOption>(["time spacing", "auto line", "gap labels"])
  )
  const [groupBy, setGroupBy] = useState<TimelineGroupBy | "none">("month")
  const on = (option: ProjectOption) => enabled.has(option)

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap gap-1.5">
          {projectOptions.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={on(option)}
              onClick={() =>
                setEnabled((current) => {
                  const next = new Set(current)
                  if (next.has(option)) next.delete(option)
                  else next.add(option)
                  return next
                })
              }
              className={cn(
                "rounded-md border border-border px-2 py-1 font-mono text-xs transition-colors",
                on(option)
                  ? "bg-foreground text-background"
                  : "bg-background text-muted-foreground hover:text-foreground"
              )}
            >
              {option}
            </button>
          ))}
        </div>
        <RendersChoice
          label="group by"
          options={["none", "day", "month", "year"]}
          value={groupBy}
          onChange={setGroupBy}
        />
      </div>
      <Timeline
        className="max-w-lg"
        items={on("empty") ? [] : project}
        empty="No events yet."
        loading={on("loading") ? 4 : false}
        markers="number"
        size="sm"
        spacing={on("time spacing") ? "time" : "even"}
        line={on("auto line") ? "auto" : "solid"}
        showGaps={on("gap labels")}
        reversed={on("reversed")}
        groupBy={groupBy === "none" ? undefined : groupBy}
      />
    </div>
  )
}

function RendersReleases() {
  return (
    <Timeline size="sm" markers="dot" className="max-w-md">
      <TimelineItem
        marker={<RocketIcon />}
        color="oklch(0.65 0.2 265)"
        date="Sep 28"
        title={
          <span className="flex items-center gap-2">
            v2.0 released <Badge tone="success">Latest</Badge>
          </span>
        }
        description="A new renderer, half the bundle size."
      >
        <a
          href="#timeline"
          className="text-xs font-medium underline underline-offset-2"
        >
          Read the release notes
        </a>
      </TimelineItem>
      <TimelineItem
        marker={<GitMergeIcon />}
        date="Sep 12"
        title="Merged the offline sync branch"
        description="42 commits from 5 people."
      />
      <TimelineItem
        marker={<ShieldCheckIcon />}
        color="oklch(0.72 0.18 145)"
        date="Aug 30"
        title="Security audit passed"
      />
      <TimelineItem
        marker={<SparklesIcon />}
        color="oklch(0.8 0.15 80)"
        date="Aug 2"
        title="Private beta"
        content={
          <div className="mt-1 rounded-md border border-border bg-background p-2 text-xs text-muted-foreground">
            120 teams joined in the first week.
          </div>
        }
      />
    </Timeline>
  )
}

export function RendersStandardTimelineDemo() {
  return (
    <div data-fill className="flex w-full flex-col gap-3">
      <RendersDemoCard fill label="vertical · pick the options">
        <RendersPlayground />
      </RendersDemoCard>
      <RendersDemoCard
        fill
        label="horizontal · alternate · date across the line"
      >
        <Timeline
          items={decades}
          orientation="horizontal"
          side="alternate"
          datePlacement="opposite"
          markers="dot"
          connector="pin"
          extend
          colors={rainbow}
          itemMinWidth="9rem"
        />
      </RendersDemoCard>
      <RendersDemoCard
        fill
        label="dated · time spacing, gaps, groups and current"
      >
        <RendersProjectHistory />
      </RendersDemoCard>
      <RendersDemoCard fill label="composed · icons and extra content">
        <RendersReleases />
      </RendersDemoCard>
    </div>
  )
}
