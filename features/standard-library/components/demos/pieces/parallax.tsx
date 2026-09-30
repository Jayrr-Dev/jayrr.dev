"use client"

import type { ReactNode } from "react"

import { Button } from "@/components/standard/button"
import { Card } from "@/components/standard/card"
import {
  Parallax,
  ParallaxLayer,
  type ParallaxLayerEntry,
} from "@/components/standard/parallax"

function Example({ title, children }: { title: string; children: ReactNode }) {
  return (
    <figure className="flex min-w-0 flex-col gap-2">
      <figcaption className="text-xs text-muted-foreground">{title}</figcaption>
      {children}
    </figure>
  )
}

/** A ridge along the bottom of its layer; fill layers stretch their child. */
function Ridge({ fill, d }: { fill: string; d: string }) {
  return (
    <div className="flex items-end">
      <svg
        viewBox="0 0 400 100"
        preserveAspectRatio="none"
        className="h-1/2 w-full"
        aria-hidden
      >
        <path d={d} fill={fill} />
      </svg>
    </div>
  )
}

function ScrollPad({ children }: { children: ReactNode }) {
  return <p className="px-4 py-16 text-center text-sm text-muted-foreground">{children}</p>
}

/** A landscape in a scrolling panel: far layers lag, near ones keep up. */
function Landscape() {
  return (
    <div className="h-80 overflow-y-auto rounded-xl border">
      <ScrollPad>Scroll down</ScrollPad>
      <Parallax className="h-64" range={140}>
        <ParallaxLayer fill speed={0.8}>
          <div className="bg-linear-to-b from-sky-300 to-amber-100 dark:from-indigo-950 dark:to-rose-900" />
        </ParallaxLayer>
        <ParallaxLayer fill speed={0.6}>
          <div className="relative">
            <span className="absolute top-1/3 right-12 size-12 rounded-full bg-amber-300 dark:bg-amber-200" />
          </div>
        </ParallaxLayer>
        <ParallaxLayer fill speed={0.4}>
          <Ridge
            fill="oklch(0.62 0.07 250)"
            d="M0 50 L60 15 L120 40 L190 0 L260 35 L330 10 L400 30 V100 H0Z"
          />
        </ParallaxLayer>
        <ParallaxLayer fill speed={0.2}>
          <Ridge
            fill="oklch(0.45 0.08 160)"
            d="M0 70 Q80 40 150 60 T300 55 T400 60 V100 H0Z"
          />
        </ParallaxLayer>
        <ParallaxLayer speed={-0.3} fade className="grid h-full place-items-center">
          <h3 className="text-3xl font-semibold tracking-tight text-white drop-shadow">
            Far and near
          </h3>
        </ParallaxLayer>
      </Parallax>
      <ScrollPad>Keep going</ScrollPad>
      <ScrollPad>…and back up</ScrollPad>
    </div>
  )
}

/** Pointer depth: tap or drag on touch. Layers hold any components. */
function DepthCard() {
  return (
    <Parallax
      trigger="pointer"
      range={24}
      className="grid h-80 place-items-center rounded-xl border bg-muted/40"
    >
      <ParallaxLayer fill speed={1}>
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden>
          {Array.from({ length: 28 }, (_, i) => (
            <circle
              key={i}
              cx={(i * 97) % 400}
              cy={(i * 61) % 300}
              r={2 + (i % 3)}
              className="fill-foreground/15"
            />
          ))}
        </svg>
      </ParallaxLayer>
      <ParallaxLayer speed={0.5} className="absolute size-44 rounded-full bg-violet-500/25 blur-2xl" />
      <ParallaxLayer speed={-0.6}>
        <Card appearance="elevated" className="w-60" title="Any component" meta="Cards, buttons, media">
          <p className="text-sm text-muted-foreground">
            Move the pointer over the panel.
          </p>
          <ParallaxLayer speed={-0.4} className="self-start">
            <Button size="sm">Even nested layers</Button>
          </ParallaxLayer>
        </Card>
      </ParallaxLayer>
    </Parallax>
  )
}

const tiles = [
  { hue: 20, label: "Dawn" },
  { hue: 80, label: "Noon" },
  { hue: 200, label: "Dusk" },
  { hue: 280, label: "Night" },
  { hue: 330, label: "Late" },
]

/** `axis="x"` follows a sideways scroller, swiped on touch. */
function SidewaysGallery() {
  return (
    <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain rounded-xl border p-3">
      {tiles.map((tile) => (
        <Parallax
          key={tile.label}
          axis="x"
          range={60}
          className="h-72 w-52 shrink-0 snap-center rounded-lg"
        >
          <ParallaxLayer fill speed={1}>
            <div
              style={{
                background: `linear-gradient(90deg, oklch(0.55 0.15 ${tile.hue}), oklch(0.75 0.12 ${tile.hue + 40}), oklch(0.55 0.15 ${tile.hue + 80}))`,
              }}
            />
          </ParallaxLayer>
          <ParallaxLayer speed={-0.4} className="flex h-full items-end p-4">
            <span className="text-xl font-semibold text-white drop-shadow">{tile.label}</span>
          </ParallaxLayer>
        </Parallax>
      ))}
    </div>
  )
}

const bannerLayers: ParallaxLayerEntry[] = [
  {
    id: "wash",
    fill: true,
    speed: 0.7,
    content: <div className="bg-linear-to-br from-emerald-400 via-teal-500 to-sky-600" />,
  },
  {
    id: "rings",
    fill: true,
    speed: 0.35,
    scale: 0.3,
    content: (
      <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" className="text-white" aria-hidden>
        {[30, 60, 90, 120].map((r) => (
          <circle key={r} cx="320" cy="60" r={r} fill="none" stroke="currentColor" strokeOpacity=".25" />
        ))}
      </svg>
    ),
  },
  {
    id: "copy",
    speed: -0.2,
    fade: true,
    className: "flex h-full flex-col justify-center gap-1 p-6 text-white",
    content: (
      <>
        <strong className="text-2xl">From an array</strong>
        <span className="text-sm text-white/80">Pass `layers` instead of children.</span>
      </>
    ),
  },
]

function Banner() {
  return (
    <div className="h-80 overflow-y-auto rounded-xl border">
      <ScrollPad>Scroll down</ScrollPad>
      <Parallax layers={bannerLayers} range={100} className="mx-3 h-48 rounded-lg" />
      <ScrollPad>Scale and fade follow the same progress</ScrollPad>
      <ScrollPad>…and back up</ScrollPad>
    </div>
  )
}

export function RendersParallaxDemo() {
  return (
    <div className="grid w-full max-w-5xl gap-8 md:grid-cols-2">
      <Example title="Scroll: layered landscape">
        <Landscape />
      </Example>
      <Example title="Pointer depth, tap or drag on touch">
        <DepthCard />
      </Example>
      <Example title="Sideways scroller with axis=x">
        <SidewaysGallery />
      </Example>
      <Example title="Layers from an array, with scale and fade">
        <Banner />
      </Example>
    </div>
  )
}
