"use client"

import {
  AppWindowIcon,
  ContrastIcon,
  DropletIcon,
  FolderOpenIcon,
  MonitorCogIcon,
  NotebookPenIcon,
  PlayIcon,
  RefreshCwIcon,
  ScanIcon,
  SmileIcon,
  SparklesIcon,
  SunIcon,
  SunMediumIcon,
  SunsetIcon,
  SunDimIcon,
} from "lucide-react"

import {
  ActionWheel,
  ActionWheelContextMenu,
} from "@/components/standard/action-wheel"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export const WHEEL_ITEMS = [
  { label: "Play/Pause", icon: <PlayIcon /> },
  { label: "New note", icon: <NotebookPenIcon /> },
  { label: "Explore AI", icon: <SparklesIcon /> },
  { label: "Lock workstation", icon: <MonitorCogIcon /> },
  { label: "Logi Options+", icon: <AppWindowIcon /> },
  { label: "Screenshot", icon: <ScanIcon /> },
  { label: "Emoji", icon: <SmileIcon /> },
  { label: "Finder", icon: <FolderOpenIcon /> },
]

const PHOTO_ITEMS = [
  {
    label: "Easy Speed Change (Premiere Pro)",
    icon: <RefreshCwIcon />,
    className: "bg-neutral-700 text-white",
  },
  { label: "Tint", icon: <DropletIcon /> },
  { label: "Exposure", icon: <SunIcon /> },
  { label: "Contrast", icon: <ContrastIcon /> },
  { label: "Highlights", icon: <SunMediumIcon /> },
  { label: "Saturation", icon: <SunsetIcon /> },
  { label: "Whites", icon: <SunDimIcon /> },
  { label: "Blacks", icon: <ContrastIcon className="rotate-180" /> },
]

function RendersWheelStage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full justify-center overflow-hidden rounded-xl bg-muted/40 px-36 py-16">
      {children}
    </div>
  )
}

/** Right-click anywhere in the zone to open the ring at the cursor. */
export function RendersActionWheelContextDemo() {
  return (
    <ActionWheelContextMenu
      label="Actions"
      items={WHEEL_ITEMS}
      className="flex h-72 w-full items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground select-none"
    >
      Right-click anywhere here
    </ActionWheelContextMenu>
  )
}

export function RendersStandardActionWheelDemo() {
  return (
    <>
      <RendersDemoCard label="right-click · context menu" className="w-full">
        <RendersActionWheelContextDemo />
      </RendersDemoCard>
      <RendersDemoCard label="actions ring · logi options+" className="w-full">
        <RendersWheelStage>
          <ActionWheel label="Actions" items={WHEEL_ITEMS} defaultOpen />
        </RendersWheelStage>
      </RendersDemoCard>
      <RendersDemoCard label="violet tone · smart action" className="w-full">
        <RendersWheelStage>
          <ActionWheel
            label="Photo actions"
            tone="violet"
            items={PHOTO_ITEMS}
            defaultOpen
          />
        </RendersWheelStage>
      </RendersDemoCard>
      <RendersDemoCard label="labels on hover · compact" className="w-full">
        <RendersWheelStage>
          <ActionWheel
            label="Actions"
            size="compact"
            labels="hover"
            items={WHEEL_ITEMS.slice(0, 6)}
          />
        </RendersWheelStage>
      </RendersDemoCard>
      <RendersDemoCard label="no labels · arc sweep 180" className="w-full">
        <RendersWheelStage>
          <ActionWheel
            label="Actions"
            labels="none"
            tone="surface"
            items={WHEEL_ITEMS.slice(0, 5)}
            startAngle={-90}
            sweep={180}
          />
        </RendersWheelStage>
      </RendersDemoCard>
    </>
  )
}
