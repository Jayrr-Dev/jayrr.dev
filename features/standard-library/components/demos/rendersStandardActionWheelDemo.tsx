"use client"

import {
  AppWindowIcon,
  CameraIcon,
  ContrastIcon,
  DropletIcon,
  FileTextIcon,
  FolderOpenIcon,
  ImageIcon,
  LanguagesIcon,
  MessageCircleQuestionIcon,
  MonitorIcon,
  PencilIcon,
  Share2Icon,
  SquareDashedIcon,
  WandSparklesIcon,
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
  type ActionWheelSize,
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

// Explore AI and Screenshot open submenus on an outer arc.
const NESTED_ITEMS = WHEEL_ITEMS.map((item) =>
  item.label === "Explore AI"
    ? {
        ...item,
        items: [
          { label: "Summarize", icon: <FileTextIcon /> },
          { label: "Translate", icon: <LanguagesIcon /> },
          { label: "Rewrite", icon: <WandSparklesIcon /> },
          { label: "Ask", icon: <MessageCircleQuestionIcon /> },
        ],
      }
    : item.label === "Screenshot"
      ? {
          ...item,
          items: [
            { label: "Region", icon: <SquareDashedIcon /> },
            { label: "Window", icon: <AppWindowIcon /> },
            { label: "Full screen", icon: <MonitorIcon /> },
          ],
        }
      : item
)

const ARC_ITEMS = [
  { label: "Photo", icon: <CameraIcon /> },
  { label: "Note", icon: <PencilIcon /> },
  { label: "Share", icon: <Share2Icon /> },
]

const NESTED_ARC_ITEMS = [
  { label: "Photo", icon: <CameraIcon /> },
  {
    label: "Media",
    icon: <ImageIcon />,
    items: [
      { label: "Image", icon: <ImageIcon /> },
      { label: "Screenshot", icon: <ScanIcon /> },
      { label: "Document", icon: <FileTextIcon /> },
    ],
  },
  { label: "Note", icon: <PencilIcon /> },
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

function RendersArcStage({
  children,
  className = "items-end justify-center",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`flex h-96 w-full overflow-hidden rounded-xl bg-muted/40 p-10 ${className}`}
    >
      {children}
    </div>
  )
}

/** Right-click anywhere in the zone to open the ring at the cursor. */
export function RendersActionWheelContextDemo() {
  return (
    <div className="w-full rounded-lg border border-dashed border-border text-xs text-muted-foreground">
      <ActionWheelContextMenu
        label="Actions"
        items={NESTED_ITEMS}
        submenuTrigger="hover"
        className="flex h-72 w-full items-center justify-center select-none"
      >
        Right-click anywhere here
      </ActionWheelContextMenu>
    </div>
  )
}

const WHEEL_SIZES: { size: ActionWheelSize; stage: string }[] = [
  { size: "compact", stage: "px-28 py-12" },
  { size: "default", stage: "px-36 py-16" },
  { size: "medium", stage: "px-40 py-16" },
  { size: "large", stage: "px-44 py-20" },
]

function RendersWheelSizes() {
  return (
    <>
      {WHEEL_SIZES.map(({ size, stage }) => (
        <RendersDemoCard key={size} label={`size · ${size}`} className="w-full">
          <div
            className={`flex w-full justify-center overflow-hidden rounded-xl bg-muted/40 ${stage}`}
          >
            <ActionWheel
              label="Actions"
              size={size}
              items={WHEEL_ITEMS.slice(0, 6)}
              defaultOpen
            />
          </div>
        </RendersDemoCard>
      ))}
    </>
  )
}

export function RendersStandardActionWheelDemo() {
  return (
    <>
      <RendersDemoCard
        label="right-click · context menu, hover Explore AI"
        className="w-full"
      >
        <RendersActionWheelContextDemo />
      </RendersDemoCard>
      <RendersDemoCard label="actions ring · logi options+" className="w-full">
        <RendersWheelStage>
          <ActionWheel label="Actions" items={WHEEL_ITEMS} labels="always" defaultOpen />
        </RendersWheelStage>
      </RendersDemoCard>
      <RendersWheelSizes />
      <RendersDemoCard
        label="nested · click Explore AI or Screenshot"
        className="w-full"
      >
        <div className="flex w-full justify-center overflow-hidden rounded-xl bg-muted/40 px-40 py-40">
          <ActionWheel label="Actions" items={NESTED_ITEMS} defaultOpen />
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="arc variant · launcher" className="w-full">
        <RendersArcStage>
          <ActionWheel
            label="Create"
            variant="arc"
            direction="up"
            sweep={120}
            items={ARC_ITEMS}
          />
        </RendersArcStage>
      </RendersDemoCard>
      <RendersDemoCard
        label="arc variant · corner, nested Media"
        className="w-full"
      >
        <RendersArcStage className="items-end justify-end">
          <ActionWheel
            label="Create"
            variant="arc"
            direction="up-left"
            tone="violet"
            labels="hover"
            items={NESTED_ARC_ITEMS}
          />
        </RendersArcStage>
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
