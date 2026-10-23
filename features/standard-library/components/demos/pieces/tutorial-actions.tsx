"use client"

import { useRef, useState } from "react"

import { Button } from "@/components/standard/button"
import { Switch } from "@/components/standard/switch"
import {
  TutorialActions,
  tutorialDevices,
  tutorialDirections,
  tutorialGestures,
  type TutorialDevice,
  type TutorialDirection,
  type TutorialGesture,
} from "@/components/standard/tutorial-actions"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

type GestureTile = {
  label: string
  gesture: TutorialGesture
  direction?: TutorialDirection
  keys?: string[]
  at?: [number, number]
}

const MOBILE_TILES: GestureTile[] = [
  { label: "Tap", gesture: "tap" },
  { label: "Double-tap", gesture: "double-tap" },
  { label: "Long-press", gesture: "long-press" },
  { label: "Swipe left", gesture: "swipe", direction: "left" },
  { label: "Swipe right", gesture: "swipe", direction: "right" },
  { label: "Swipe up", gesture: "swipe", direction: "up" },
  { label: "Swipe down", gesture: "swipe", direction: "down" },
  { label: "Scroll", gesture: "scroll", direction: "down" },
  { label: "Pinch to zoom out", gesture: "pinch" },
  { label: "Spread to zoom in", gesture: "spread" },
  { label: "Rotate", gesture: "rotate" },
  { label: "Pull to refresh", gesture: "pull" },
  { label: "Press and hold menu", gesture: "context", at: [0.3, 0.35] },
]

const DESKTOP_TILES: GestureTile[] = [
  { label: "Click", gesture: "tap" },
  { label: "Double-click", gesture: "double-tap" },
  { label: "Click and hold", gesture: "long-press" },
  { label: "Right-click", gesture: "context", at: [0.3, 0.35] },
  { label: "Hover", gesture: "hover" },
  { label: "Scroll wheel", gesture: "scroll", direction: "down" },
  { label: "Scroll sideways", gesture: "scroll", direction: "right" },
  { label: "Drag to select", gesture: "marquee" },
  { label: "Shortcut", gesture: "keys", keys: ["Ctrl", "K"] },
  { label: "Shift-click", gesture: "tap", keys: ["Shift"], at: [0.5, 0.62] },
]

/** One action in a tile: the guide plays on the box in the middle. */
function RendersTile({
  tile,
  device,
}: {
  tile: GestureTile
  device: TutorialDevice
}) {
  const boxRef = useRef<HTMLDivElement>(null)
  const small = tile.gesture === "marquee" || tile.gesture === "hover"

  return (
    <figure className="flex flex-col items-center gap-2">
      <div className="flex h-32 w-full items-center justify-center rounded-lg border border-border bg-background">
        <div
          ref={boxRef}
          className={
            small
              ? "flex h-9 w-16 items-center justify-center gap-1 rounded-md border border-border bg-card"
              : "size-20 rounded-md"
          }
        >
          {small ? (
            <>
              <span className="size-2 rounded-full bg-muted-foreground/50" />
              <span className="size-2 rounded-full bg-muted-foreground/50" />
              <span className="size-2 rounded-full bg-muted-foreground/50" />
            </>
          ) : null}
        </div>
      </div>
      <figcaption className="text-center text-xs text-muted-foreground">
        {tile.label}
      </figcaption>
      <TutorialActions
        gesture={tile.gesture}
        target={boxRef}
        device={device}
        direction={tile.direction}
        keys={tile.keys}
        at={tile.at}
        distance={56}
      />
    </figure>
  )
}

/** Drag and drop needs two places, so it gets its own tile. */
function RendersDragTile({
  label,
  device,
  keys,
}: {
  label: string
  device: TutorialDevice
  keys?: string[]
}) {
  const fromRef = useRef<HTMLDivElement>(null)
  const toRef = useRef<HTMLDivElement>(null)

  return (
    <figure className="col-span-2 flex flex-col items-center gap-2">
      <div className="flex h-32 w-full items-center justify-between rounded-lg border border-border bg-background px-3">
        <div
          ref={fromRef}
          className="rounded-md border border-border bg-card px-2 py-1 text-xs"
        >
          File
        </div>
        <div
          ref={toRef}
          className="size-12 rounded-md border border-dashed border-border"
        />
      </div>
      <figcaption className="text-center text-xs text-muted-foreground">
        {label}
      </figcaption>
      <TutorialActions
        gesture="drag"
        from={fromRef}
        to={toRef}
        device={device}
        keys={keys}
        path
      />
    </figure>
  )
}

function RendersMobile() {
  return (
    <RendersDemoCard
      label="mobile · touch gestures"
      className="@container"
      fill
    >
      <div className="grid w-full grid-cols-2 gap-3 @md:grid-cols-3">
        {MOBILE_TILES.map((tile) => (
          <RendersTile key={tile.label} tile={tile} device="touch" />
        ))}
        <RendersDragTile label="Drag" device="touch" />
      </div>
    </RendersDemoCard>
  )
}

function RendersDesktop() {
  return (
    <RendersDemoCard
      label="desktop · mouse and keyboard"
      className="@container"
      fill
    >
      <div className="grid w-full grid-cols-2 gap-3 @md:grid-cols-3">
        {DESKTOP_TILES.map((tile) => (
          <RendersTile key={tile.label} tile={tile} device="mouse" />
        ))}
        <RendersDragTile label="Drag and drop" device="mouse" />
        <RendersDragTile
          label="Alt-drag (modifier held)"
          device="mouse"
          keys={["Alt"]}
        />
      </div>
    </RendersDemoCard>
  )
}

/** Every gesture and option on one target. */
function RendersPlayground() {
  const fromRef = useRef<HTMLDivElement>(null)
  const toRef = useRef<HTMLDivElement>(null)
  const [gesture, setGesture] = useState<TutorialGesture>("tap")
  const [device, setDevice] = useState<TutorialDevice>("auto")
  const [path, setPath] = useState(false)
  const [straight, setStraight] = useState(false)
  const [direction, setDirection] = useState<TutorialDirection>("down")
  const [shift, setShift] = useState(false)
  const [counter, setCounter] = useState(false)

  return (
    <RendersDemoCard label="playground · every gesture and option" fill>
      <div className="flex w-full flex-col items-center gap-3">
        <div className="relative h-56 w-full rounded-lg border border-border bg-background">
          <div
            ref={fromRef}
            className="absolute top-1/2 left-[14%] -translate-y-1/2 rounded-md border border-border bg-card px-3 py-2 text-sm shadow-sm"
          >
            Item
          </div>
          <div
            ref={toRef}
            className="absolute top-1/2 right-[14%] flex size-20 -translate-y-1/2 items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground"
          >
            Target
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-1">
          {tutorialGestures.map((option) => (
            <Button
              key={option}
              size="xs"
              tone={gesture === option ? "default" : "outline"}
              aria-pressed={gesture === option}
              onClick={() => setGesture(option)}
            >
              {option}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <div className="flex gap-1">
            {tutorialDevices.map((option) => (
              <Button
                key={option}
                size="sm"
                tone={device === option ? "default" : "outline"}
                aria-pressed={device === option}
                onClick={() => setDevice(option)}
              >
                {option}
              </Button>
            ))}
          </div>
          <div className="flex gap-1">
            {tutorialDirections.map((option) => (
              <Button
                key={option}
                size="sm"
                tone={direction === option ? "default" : "outline"}
                aria-pressed={direction === option}
                onClick={() => setDirection(option)}
              >
                {option}
              </Button>
            ))}
          </div>
          <Switch
            label="Hold Shift"
            checked={shift}
            onCheckedChange={setShift}
          />
          <Switch label="Path" checked={path} onCheckedChange={setPath} />
          <Switch
            label="Counter-clockwise"
            checked={counter}
            onCheckedChange={setCounter}
          />
          <Switch
            label="Straight"
            checked={straight}
            onCheckedChange={setStraight}
          />
        </div>
      </div>
      <TutorialActions
        gesture={gesture}
        target={toRef}
        from={fromRef}
        to={toRef}
        device={device}
        path={path}
        curl={straight ? 0 : -0.7}
        direction={direction}
        clockwise={!counter}
        keys={
          gesture === "keys"
            ? ["⌘", "Shift", "P"]
            : shift
              ? ["Shift"]
              : undefined
        }
      />
    </RendersDemoCard>
  )
}

export function RendersTutorialActionsDemo() {
  return (
    <>
      <RendersMobile />
      <RendersDesktop />
      <RendersPlayground />
    </>
  )
}
