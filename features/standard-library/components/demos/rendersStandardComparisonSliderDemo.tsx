"use client"

import { useState } from "react"

import { ComparisonSlider } from "@/components/standard/comparison-slider"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

// The same desk computer drawn in a light and a dark finish, inline so the
// demo needs no network or next/image config.
function computerScene(finish: "light" | "dark") {
  const light = finish === "light"
  const c = light
    ? { bg: "#efefef", body: "#e4e4e4", edge: "#cfcfcf", bezel: "#d6d6d6", screen: "#2b2b2b", ink: "#9a9a9a", slot: "#bdbdbd", glow: "#ffffff" }
    : { bg: "#151515", body: "#242424", edge: "#0c0c0c", bezel: "#1b1b1b", screen: "#f2f2f2", ink: "#2a2a2a", slot: "#050505", glow: "#3a3a3a" }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360">
  <defs>
    <radialGradient id="l" cx="0.5" cy="0.35" r="0.6"><stop offset="0" stop-color="${c.glow}" stop-opacity="0.5"/><stop offset="1" stop-color="${c.bg}" stop-opacity="0"/></radialGradient>
    <linearGradient id="b" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${c.edge}"/><stop offset="0.15" stop-color="${c.body}"/><stop offset="0.85" stop-color="${c.body}"/><stop offset="1" stop-color="${c.edge}"/></linearGradient>
  </defs>
  <rect width="640" height="360" fill="${c.bg}"/>
  <rect width="640" height="360" fill="url(#l)"/>
  <rect x="232" y="44" width="176" height="236" rx="16" fill="url(#b)"/>
  <rect x="236" y="276" width="168" height="36" rx="6" fill="${c.edge}"/>
  <rect x="252" y="62" width="136" height="112" rx="10" fill="${c.bezel}"/>
  <rect x="264" y="72" width="112" height="90" rx="6" fill="${c.screen}"/>
  <text x="320" y="128" text-anchor="middle" font-family="Brush Script MT, cursive" font-style="italic" font-size="34" fill="${c.ink}">hello.</text>
  <rect x="264" y="72" width="112" height="8" fill="${c.ink}" opacity="0.35"/>
  <rect x="326" y="206" width="56" height="8" rx="2" fill="${c.slot}"/>
  <circle cx="254" cy="254" r="4" fill="${c.ink}"/>
</svg>`

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const lightSrc = computerScene("light")
const darkSrc = computerScene("dark")

function RendersControlledSlider() {
  const [value, setValue] = useState(30)

  return (
    <div className="grid w-full gap-2">
      <ComparisonSlider
        before={lightSrc}
        after={darkSrc}
        value={value}
        onValueChange={setValue}
      />
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(event) => setValue(Number(event.target.value))}
          aria-label="Divider position"
          className="flex-1 accent-foreground"
        />
        <span className="w-10 text-right font-mono tabular-nums">
          {Math.round(value)}%
        </span>
      </div>
    </div>
  )
}

export function RendersStandardComparisonSliderDemo() {
  return (
    <>
      <RendersDemoCard className="w-full max-w-xl">
        <ComparisonSlider
          before={lightSrc}
          after={darkSrc}
          className="aspect-[4/3]"
        />
      </RendersDemoCard>
      <RendersDemoCard label="mode hover" className="w-full max-w-xl">
        <ComparisonSlider
          before={lightSrc}
          after={darkSrc}
          mode="hover"
          beforeLabel="Light"
          afterLabel="Dark"
        />
      </RendersDemoCard>
      <RendersDemoCard label="orientation vertical" className="w-full max-w-xl">
        <ComparisonSlider
          before={lightSrc}
          after={darkSrc}
          orientation="vertical"
          beforeLabel="Before"
          afterLabel="After"
          className="aspect-[4/3]"
        />
      </RendersDemoCard>
      <RendersDemoCard label="any content" className="w-full max-w-xl">
        <ComparisonSlider
          before={
            <div className="flex size-full items-center justify-center bg-muted font-mono text-sm text-muted-foreground">
              v1 · 1.8 MB
            </div>
          }
          after={
            <div className="flex size-full items-center justify-center bg-foreground font-mono text-sm text-background">
              v2 · 240 KB
            </div>
          }
          handle={false}
          className="aspect-[3/1]"
        />
      </RendersDemoCard>
      <RendersDemoCard label="controlled" className="w-full max-w-xl">
        <RendersControlledSlider />
      </RendersDemoCard>
    </>
  )
}
