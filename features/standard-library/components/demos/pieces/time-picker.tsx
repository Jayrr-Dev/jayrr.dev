"use client"

import { useState } from "react"

import { TimePicker, TimePickerPanel } from "@/components/standard/time-picker"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

function RendersLiveTimePicker() {
  const [time, setTime] = useState<string | null>("09:30")
  const [panelTime, setPanelTime] = useState("14:05")

  return (
    <>
      <RendersDemoCard label={`popover · value ${time ?? "none"}`}>
        <TimePicker
          aria-label="Start time"
          value={time}
          onValueChange={setTime}
          className="w-40"
        />
      </RendersDemoCard>
      <RendersDemoCard label="24-hour · 5 min steps · empty">
        <TimePicker
          aria-label="End time"
          hourCycle={24}
          minuteStep={5}
          className="w-40"
        />
      </RendersDemoCard>
      <RendersDemoCard label="invalid">
        <TimePicker aria-label="Pickup time" invalid className="w-40" />
      </RendersDemoCard>
      <RendersDemoCard label={`inline panel · ${panelTime}`}>
        <TimePickerPanel
          value={panelTime}
          onValueChange={setPanelTime}
          className="rounded-2xl border border-border"
        />
      </RendersDemoCard>
    </>
  )
}

export function RendersTimePickerDemo() {
  return <RendersLiveTimePicker />
}
