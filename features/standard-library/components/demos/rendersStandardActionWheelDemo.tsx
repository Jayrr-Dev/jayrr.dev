"use client"

import {
  AppWindowIcon,
  FolderOpenIcon,
  MonitorCogIcon,
  NotebookPenIcon,
  PlayIcon,
  ScanFaceIcon,
  SmileIcon,
  SparklesIcon,
} from "lucide-react"

import { ActionWheel } from "@/components/standard/action-wheel"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const WHEEL_ITEMS = [
  { label: "Play", icon: <PlayIcon /> },
  { label: "Notes", icon: <NotebookPenIcon /> },
  { label: "Enhance", icon: <SparklesIcon /> },
  { label: "Remote desktop", icon: <MonitorCogIcon /> },
  { label: "Apps", icon: <AppWindowIcon /> },
  { label: "Capture", icon: <ScanFaceIcon /> },
  { label: "Reactions", icon: <SmileIcon /> },
  { label: "Files", icon: <FolderOpenIcon /> },
]

export function RendersStandardActionWheelDemo() {
  return (
    <>
      <RendersDemoCard label="full ring · logictek" className="w-full max-w-md">
        <div className="flex w-full justify-center rounded-xl bg-neutral-950 py-6">
          <ActionWheel label="Actions" items={WHEEL_ITEMS} defaultOpen />
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="tones · surface, secondary">
        <div className="flex flex-wrap justify-center gap-4">
          <ActionWheel
            label="Actions"
            tone="surface"
            items={WHEEL_ITEMS.slice(0, 6)}
          />
          <ActionWheel
            label="Actions"
            tone="secondary"
            items={WHEEL_ITEMS.slice(0, 6)}
          />
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="sizes · compact, large">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <ActionWheel
            label="Actions"
            size="compact"
            items={WHEEL_ITEMS.slice(0, 5)}
          />
          <ActionWheel label="Actions" size="large" items={WHEEL_ITEMS} />
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="arc · sweep 180" className="w-full max-w-md">
        <div className="flex w-full justify-center">
          <ActionWheel
            label="Actions"
            items={WHEEL_ITEMS.slice(0, 5)}
            startAngle={-90}
            sweep={180}
          />
        </div>
      </RendersDemoCard>
    </>
  )
}
