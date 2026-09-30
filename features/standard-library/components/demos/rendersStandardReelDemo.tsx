"use client"

import { useState, type ReactNode } from "react"
import {
  AppleIcon,
  ArrowRightIcon,
  CherryIcon,
  CitrusIcon,
  CloudIcon,
  FeatherIcon,
  FlameIcon,
  GemIcon,
  LeafIcon,
  MoonIcon,
  RocketIcon,
  SnowflakeIcon,
  SunIcon,
  ZapIcon,
} from "lucide-react"

import { Badge } from "@/components/standard/badge"
import { Button } from "@/components/standard/button"
import {
  Reel,
  type ReelDirection,
  type ReelFlow,
} from "@/components/standard/reel"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const brands = [
  { name: "Northwind", icon: FeatherIcon },
  { name: "Lumen", icon: SunIcon },
  { name: "Voltaic", icon: ZapIcon },
  { name: "Cirrus", icon: CloudIcon },
  { name: "Ember", icon: FlameIcon },
  { name: "Facet", icon: GemIcon },
  { name: "Orbit", icon: RocketIcon },
]

const logos = brands.map(({ name, icon: Icon }) => (
  <span
    key={name}
    className="flex items-center gap-2 text-lg font-semibold tracking-tight text-muted-foreground"
  >
    <Icon className="size-5" />
    {name}
  </span>
))

const stickers = [
  AppleIcon,
  CherryIcon,
  CitrusIcon,
  LeafIcon,
  MoonIcon,
  SnowflakeIcon,
  SunIcon,
].map((Icon, index) => (
  <span
    key={index}
    className="flex size-10 items-center justify-center rounded-full border border-border bg-background shadow-sm"
  >
    <Icon className="size-5" />
  </span>
))

const words = ["Ship", "Iterate", "Measure", "Learn", "Repeat"].map((word) => (
  <Badge key={word} tone="outline" size="lg">
    {word}
  </Badge>
))

const cards = ["Build", "Test", "Deploy", "Monitor"].map((step, index) => (
  <div
    key={step}
    className="flex w-40 flex-col gap-1 rounded-lg border border-border bg-background p-3"
  >
    <span className="text-xs text-muted-foreground">Step {index + 1}</span>
    <span className="text-sm font-medium">{step}</span>
  </div>
))

const directions: ReelDirection[] = ["left", "right", "up", "down"]

/** A wave across a 400×160 box. */
const WAVE = "M0 80 C 60 0, 140 0, 200 80 S 340 160, 400 80"
/** A rounded racetrack loop, closed so it circles forever. */
const LOOP = "M110 30 H290 A70 70 0 0 1 290 170 H110 A70 70 0 0 1 110 30 Z"

const flows: { label: string; value: ReelFlow }[] = [
  { label: "stream", value: "stream" },
  { label: "1 at a time", value: 1 },
  { label: "3 at a time", value: 3 },
  { label: "random", value: "random" },
]

const bullet = (
  <span className="block h-1.5 w-8 rounded-full bg-linear-to-r from-transparent to-foreground" />
)

const arrow = (
  <span className="flex size-8 items-center justify-center rounded-full bg-foreground text-background">
    <ArrowRightIcon className="size-4" />
  </span>
)

function RendersToggle({
  pressed,
  onPressedChange,
  children,
}: {
  pressed: boolean
  onPressedChange: (pressed: boolean) => void
  children: ReactNode
}) {
  return (
    <Button
      size="sm"
      tone={pressed ? "default" : "outline"}
      aria-pressed={pressed}
      onClick={() => onPressedChange(!pressed)}
    >
      {children}
    </Button>
  )
}

function RendersFlowDemo() {
  const [flow, setFlow] = useState<ReelFlow>("stream")
  const [line, setLine] = useState(true)
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap gap-1.5">
        {flows.map((entry) => (
          <RendersToggle
            key={entry.label}
            pressed={entry.value === flow}
            onPressedChange={() => setFlow(entry.value)}
          >
            {entry.label}
          </RendersToggle>
        ))}
        <RendersToggle pressed={line} onPressedChange={setLine}>
          path line
        </RendersToggle>
      </div>
      <Reel
        path={WAVE}
        viewBox="0 0 400 160"
        orient="auto"
        showPath={line}
        flow={flow}
        rest={flow === 3 ? 600 : 0}
        speed={120}
        fade
        gap={flow === 3 ? 6 : 20}
        className="h-48"
      >
        {stickers}
      </Reel>
    </div>
  )
}

function RendersCyclesDemo() {
  const [run, setRun] = useState(0)
  return (
    <div className="flex w-full flex-col gap-3">
      <Reel
        key={run}
        path={WAVE}
        viewBox="0 0 400 160"
        orient="auto"
        showPath
        playOnView
        cycles={2}
        loop={false}
        speed={140}
        gap={12}
        fade
        className="h-48"
      >
        {stickers}
      </Reel>
      <div className="flex items-center gap-3">
        <Button size="sm" tone="outline" onClick={() => setRun(run + 1)}>
          Replay
        </Button>
        <span className="text-xs text-muted-foreground">
          Waits until it scrolls into view, runs twice, then stops.
        </span>
      </div>
    </div>
  )
}

function RendersDirectionDemo() {
  const [direction, setDirection] = useState<ReelDirection>("left")
  const vertical = direction === "up" || direction === "down"
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap gap-1.5">
        {directions.map((entry) => (
          <Button
            key={entry}
            size="sm"
            tone={entry === direction ? "default" : "outline"}
            aria-pressed={entry === direction}
            onClick={() => setDirection(entry)}
          >
            {entry}
          </Button>
        ))}
      </div>
      <Reel
        direction={direction}
        gap={12}
        fade
        hoverSpeed={0}
        className={vertical ? "h-56" : undefined}
      >
        {cards}
      </Reel>
    </div>
  )
}

function RendersDrawDemo() {
  const [path, setPath] = useState("")
  const [line, setLine] = useState(true)
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="overflow-hidden rounded-lg border border-dashed border-border bg-background">
        <Reel
          drawable
          showPath={line}
          orient="auto"
          path={path}
          onPathChange={setPath}
          speed={80}
          gap={16}
          fade={32}
          className="h-72"
        >
          {stickers}
        </Reel>
      </div>
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          tone="outline"
          disabled={!path}
          onClick={() => setPath("")}
        >
          Clear path
        </Button>
        <RendersToggle pressed={line} onPressedChange={setLine}>
          path line
        </RendersToggle>
        <span className="text-xs text-muted-foreground">
          {path
            ? "Draw again to replace it. End near the start for a loop."
            : "Press and drag to draw a path."}
        </span>
      </div>
    </div>
  )
}

export function RendersStandardReelDemo() {
  return (
    <div data-fill className="flex w-full flex-col gap-3">
      <RendersDemoCard
        fill
        label="logo loop · fades at the edges, stops on hover"
      >
        <Reel items={logos} gap={48} fade hoverSpeed={0} />
      </RendersDemoCard>
      <RendersDemoCard fill label="any direction">
        <RendersDirectionDemo />
      </RendersDemoCard>
      <RendersDemoCard fill label="two rows, opposite ways">
        <div className="flex w-full flex-col gap-2">
          <Reel items={words} gap={12} speed={40} fade />
          <Reel items={words} gap={12} speed={40} fade direction="right" />
        </div>
      </RendersDemoCard>
      <RendersDemoCard fill label="along a path · turning with it">
        <Reel
          path={WAVE}
          viewBox="0 0 400 160"
          orient="auto"
          showPath
          fade
          gap={20}
          className="h-48"
        >
          {stickers}
        </Reel>
      </RendersDemoCard>
      <RendersDemoCard fill label="a closed loop · upright, reversed">
        <Reel
          path={LOOP}
          viewBox="0 0 400 200"
          showPath
          reverse
          hoverSpeed={15}
          gap={12}
          className="h-56"
        >
          {words}
        </Reel>
      </RendersDemoCard>
      <RendersDemoCard fill label="one item · round and round">
        <Reel
          items={[arrow]}
          flow={1}
          path={LOOP}
          viewBox="0 0 400 200"
          orient="auto"
          speed={160}
          className="h-56"
        />
      </RendersDemoCard>
      <RendersDemoCard
        fill
        label="flow · stream, one or three at a time, random"
      >
        <RendersFlowDemo />
      </RendersDemoCard>
      <RendersDemoCard fill label="bullets · fired three at a time, then again">
        <div className="flex w-full items-center">
          <span className="h-4 w-6 shrink-0 rounded-sm bg-foreground" />
          <Reel
            items={[bullet]}
            direction="right"
            flow={3}
            gap={28}
            rest={900}
            speed={700}
            className="h-8"
          />
        </div>
      </RendersDemoCard>
      <RendersDemoCard fill label="two cycles · plays when in view">
        <RendersCyclesDemo />
      </RendersDemoCard>
      <RendersDemoCard fill label="draw your own path">
        <RendersDrawDemo />
      </RendersDemoCard>
    </div>
  )
}
