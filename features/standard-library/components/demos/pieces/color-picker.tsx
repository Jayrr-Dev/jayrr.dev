"use client"

import { useState } from "react"

import { ColorPicker } from "@/components/standard/color-picker"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const presets = [
  "#ef4444",
  "#f59e0b",
  "#22c55e",
  "#06b6d4",
  "#6366f1",
  "#d946ef",
  "#0a0a0a",
  "#ffffff",
]

export function RendersColorPickerDemo() {
  const [color, setColor] = useState("#6366f1")

  return (
    <>
      <RendersDemoCard
        label="controlled · swatches"
        className="w-full max-w-xl"
      >
        <ColorPicker
          value={color}
          onValueChange={setColor}
          swatches={presets}
        />
        <div
          className="mt-3 flex h-16 w-full items-center justify-center rounded-lg font-mono text-sm text-white transition-colors"
          style={{ backgroundColor: color }}
        >
          <span className="rounded bg-black/40 px-2 py-0.5">{color}</span>
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="size" className="w-full max-w-xl">
        <div className="flex flex-wrap items-center gap-3">
          <ColorPicker size="sm" defaultValue="#f59e0b" />
          <ColorPicker defaultValue="#22c55e" />
          <ColorPicker size="lg" defaultValue="#d946ef" />
        </div>
      </RendersDemoCard>
      <RendersDemoCard
        label="showInput false · eyedropper false"
        className="w-full max-w-xl"
      >
        <ColorPicker
          defaultValue="#06b6d4"
          showInput={false}
          eyedropper={false}
        />
      </RendersDemoCard>
      <RendersDemoCard label="disabled" className="w-full max-w-xl">
        <ColorPicker defaultValue="#ef4444" disabled />
      </RendersDemoCard>
    </>
  )
}
