"use client"

import {
  DrawDisplay,
  type DrawStroke,
} from "@/components/standard/draw-display"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

// A small house with a sun, drawn once and replayed read-only.
const sketch: DrawStroke[] = [
  {
    color: "currentColor",
    size: 3,
    points: [
      [60, 150],
      [60, 90],
      [110, 50],
      [160, 90],
      [160, 150],
      [60, 150],
    ],
  },
  {
    color: "currentColor",
    size: 3,
    points: [
      [95, 150],
      [95, 115],
      [125, 115],
      [125, 150],
    ],
  },
  {
    color: "#f59e0b",
    size: 5,
    points: [
      [250, 60],
      [262, 48],
      [278, 48],
      [290, 60],
      [290, 76],
      [278, 88],
      [262, 88],
      [250, 76],
      [250, 60],
    ],
  },
  {
    color: "#22c55e",
    size: 4,
    points: [
      [20, 160],
      [80, 156],
      [140, 162],
      [200, 155],
      [260, 160],
      [330, 156],
    ],
  },
  {
    color: "#3b82f6",
    size: 6,
    highlight: true,
    points: [
      [190, 120],
      [230, 118],
      [270, 122],
      [310, 119],
    ],
  },
]

export function RendersDrawDisplayDemo() {
  return (
    <>
      <RendersDemoCard className="w-full max-w-xl">
        <DrawDisplay title="Sketch" />
      </RendersDemoCard>
      <RendersDemoCard
        label="grid · custom colors and sizes"
        className="w-full max-w-xl"
      >
        <DrawDisplay
          title="Whiteboard"
          background="grid"
          colors={["currentColor", "#e11d48", "#0ea5e9"]}
          sizes={[3, 8]}
          height={260}
        />
      </RendersDemoCard>
      <RendersDemoCard
        label="strokes · readOnly · dots"
        className="w-full max-w-xl"
      >
        <DrawDisplay
          title="house.svg"
          strokes={sketch}
          readOnly
          background="dots"
          height={200}
        />
      </RendersDemoCard>
    </>
  )
}
