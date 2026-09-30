"use client"

import { useState } from "react"
import {
  AccessibilityIcon,
  BookOpenIcon,
  BoxIcon,
  BrushIcon,
  CalculatorIcon,
  CalendarIcon,
  CameraIcon,
  ClockIcon,
  CloudSunIcon,
  CodeIcon,
  FileTextIcon,
  FilmIcon,
  FolderIcon,
  GamepadIcon,
  GitBranchIcon,
  GlobeIcon,
  HeadphonesIcon,
  ImageIcon,
  KeyboardIcon,
  MailIcon,
  MapPinIcon,
  MessageCircleIcon,
  MicIcon,
  MonitorIcon,
  MusicIcon,
  NewspaperIcon,
  PaletteIcon,
  PenToolIcon,
  PlayIcon,
  ScissorsIcon,
  SettingsIcon,
  SheetIcon,
  SparklesIcon,
  TerminalIcon,
  TvIcon,
  VideoIcon,
  ZoomInIcon,
  type LucideIcon,
} from "lucide-react"

import {
  AppGrid,
  type AppGridFolder,
  type AppGridItem,
} from "@/components/standard/app-grid"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

/** A stand-in app icon: a lucide glyph on a colored rounded square. */
function RendersAppIcon({
  icon: Icon,
  className,
}: {
  icon: LucideIcon
  className: string
}) {
  return (
    <div
      className={`flex aspect-square items-center justify-center rounded-[22%] text-white ${className}`}
    >
      <Icon className="size-3/5" />
    </div>
  )
}

function app(
  label: string,
  icon: LucideIcon,
  className: string
): AppGridItem {
  return {
    id: label.toLowerCase().replace(/\s+/g, "-"),
    label,
    icon: <RendersAppIcon icon={icon} className={className} />,
  }
}

const folders: AppGridFolder[] = [
  {
    id: "utilities",
    label: "Utilities & Tools",
    items: [
      app("Snipping Tool", ScissorsIcon, "bg-rose-500"),
      app("Settings", SettingsIcon, "bg-slate-500"),
      app("Clock", ClockIcon, "bg-zinc-600"),
      app("Calculator", CalculatorIcon, "bg-indigo-500"),
      app("3D Viewer", BoxIcon, "bg-violet-500"),
      app("Keyboard", KeyboardIcon, "bg-purple-600"),
      app("Monitor", MonitorIcon, "bg-fuchsia-600"),
    ],
  },
  {
    id: "productivity",
    label: "Productivity",
    items: [
      app("Chat", MessageCircleIcon, "bg-indigo-500"),
      app("Files", FolderIcon, "bg-amber-400"),
      app("Sheets", SheetIcon, "bg-emerald-600"),
      app("Notes", FileTextIcon, "bg-sky-600"),
      app("Browser", GlobeIcon, "bg-blue-500"),
      app("Mail", MailIcon, "bg-sky-500"),
      app("Calendar", CalendarIcon, "bg-teal-500"),
      app("Whiteboard", PenToolIcon, "bg-orange-500"),
    ],
  },
  {
    id: "entertainment",
    label: "Entertainment",
    items: [
      app("Player", PlayIcon, "bg-orange-500"),
      app("Games", GamepadIcon, "bg-lime-500"),
      app("Headset", HeadphonesIcon, "bg-sky-400"),
      app("Films", FilmIcon, "bg-red-500"),
      app("TV", TvIcon, "bg-blue-600"),
      app("Music", MusicIcon, "bg-green-500"),
    ],
  },
  {
    id: "developer",
    label: "Developer Tools",
    items: [
      app("Assistant", SparklesIcon, "bg-neutral-700"),
      app("Terminal", TerminalIcon, "bg-zinc-800"),
      app("Git", GitBranchIcon, "bg-orange-600"),
      app("Editor", CodeIcon, "bg-blue-600"),
    ],
  },
  {
    id: "creativity",
    label: "Creativity",
    items: [
      app("Photos", ImageIcon, "bg-sky-500"),
      app("Paint", PaletteIcon, "bg-amber-500"),
      app("Draw", BrushIcon, "bg-orange-600"),
      app("Camera", CameraIcon, "bg-slate-600"),
      app("Video Editor", VideoIcon, "bg-pink-600"),
    ],
  },
  {
    id: "accessibility",
    label: "Accessibility",
    items: [
      app("Live Captions", AccessibilityIcon, "bg-cyan-600"),
      app("Magnifier", ZoomInIcon, "bg-slate-500"),
      app("Narrator", MicIcon, "bg-sky-600"),
    ],
  },
  {
    id: "reading",
    label: "Information & Reading",
    items: [
      app("Maps", MapPinIcon, "bg-orange-600"),
      app("News", NewspaperIcon, "bg-red-600"),
      app("Weather", CloudSunIcon, "bg-amber-400"),
      app("Books", BookOpenIcon, "bg-emerald-600"),
    ],
  },
]

export function RendersStandardAppGridDemo() {
  const [launched, setLaunched] = useState<string | null>(null)

  return (
    <div data-fill className="flex w-full flex-col gap-3">
      <RendersDemoCard fill label="folders · click the small cluster to open">
        <div className="flex w-full flex-col gap-3">
          <AppGrid
            folders={folders}
            onItemSelect={(item) => setLaunched(item.label)}
          />
          <p className="text-xs text-muted-foreground">
            {launched ? `Launched ${launched}` : "Click an icon to launch it."}
          </p>
        </div>
      </RendersDemoCard>
    </div>
  )
}
