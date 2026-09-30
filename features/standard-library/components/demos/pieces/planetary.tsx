"use client"

import { useState } from "react"
import {
  Atom,
  Circle,
  Code,
  Heart,
  Image,
  Layers,
  LayoutGrid,
  Star,
  Type,
} from "lucide-react"

import { Increment } from "@/components/standard/increment"
import { Planetary, PlanetaryItem } from "@/components/standard/planetary"
import { Button } from "@/components/ui/button"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const INNER = [Code, Layers, LayoutGrid, Type]
const OUTER = [Heart, Image, Star, Circle]

function bodies(icons: typeof INNER, size?: "sm") {
  return icons.map((Icon, index) => (
    <PlanetaryItem key={index} size={size}>
      <Icon />
    </PlanetaryItem>
  ))
}

/** The feature card: rings cropped by the frame and faded at its edges. */
function RendersFeatureCard() {
  return (
    <div className="w-full max-w-sm rounded-2xl border bg-card p-3">
      <div className="relative h-44 overflow-hidden rounded-xl border bg-muted/30 mask-radial-from-55% mask-radial-to-100%">
        <Planetary
          className="absolute top-1/2 left-1/2 w-full -translate-x-1/2 -translate-y-1/2"
          center={
            <PlanetaryItem>
              <Atom />
            </PlanetaryItem>
          }
          rings={[
            { items: bodies(INNER), radius: 90 },
            { items: bodies(OUTER), radius: 180, offset: 0.125, duration: 60 },
          ]}
        />
      </div>
      <div className="px-2 pt-4 pb-2">
        <h3 className="font-semibold">Well Organized</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Five clear categories so you&apos;re not scrolling through a wall of
          unrelated stuff.
        </p>
      </div>
    </div>
  )
}

/** Rings, speed and upright items, adjusted live. */
function RendersTunableDemo() {
  const [ringCount, setRingCount] = useState(3)
  const [duration, setDuration] = useState(30)
  const [upright, setUpright] = useState(true)
  const [paused, setPaused] = useState(false)
  const icons = [...INNER, ...OUTER]

  return (
    <div className="flex w-full flex-col gap-3">
      <Planetary
        className="mx-auto max-w-72"
        duration={duration}
        upright={upright}
        paused={paused}
        center={
          <PlanetaryItem size="sm">
            <Atom />
          </PlanetaryItem>
        }
        rings={Array.from({ length: ringCount }, (_, ring) => ({
          items: bodies(
            Array.from(
              { length: 3 + ring * 2 },
              (_, index) => icons[(ring + index) % icons.length]
            ),
            "sm"
          ),
          duration: duration * (1 + ring * 0.5),
        }))}
      />
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Increment
          value={ringCount}
          onChange={setRingCount}
          min={1}
          max={4}
          format={(value) => `${value} rings`}
          aria-label="Rings"
        />
        <Increment
          value={duration}
          onChange={setDuration}
          min={5}
          max={90}
          step={5}
          format={(value) => `${value}s / turn`}
          aria-label="Seconds per turn"
        />
        <Button
          size="sm"
          variant={upright ? "secondary" : "ghost"}
          onClick={() => setUpright(!upright)}
        >
          upright
        </Button>
        <Button
          size="sm"
          variant={paused ? "secondary" : "ghost"}
          onClick={() => setPaused(!paused)}
        >
          {paused ? "paused" : "pause"}
        </Button>
      </div>
    </div>
  )
}

export function RendersPlanetaryDemo() {
  return (
    <>
      <RendersDemoCard label="feature card">
        <RendersFeatureCard />
      </RendersDemoCard>
      <RendersDemoCard label="rings · speed">
        <RendersTunableDemo />
      </RendersDemoCard>
      <RendersDemoCard label="pause on hover · no orbits">
        <Planetary
          className="mx-auto max-w-56"
          pauseOnHover
          showOrbits={false}
          rings={[
            { items: bodies(INNER) },
            { items: bodies(OUTER), offset: 0.125 },
          ]}
        />
      </RendersDemoCard>
    </>
  )
}
