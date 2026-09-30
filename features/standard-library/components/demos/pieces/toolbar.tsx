"use client"

import { useState } from "react"
import {
  ArchiveIcon,
  LayoutGridIcon,
  ListIcon,
  MailIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  ShareIcon,
  StarIcon,
  Trash2Icon,
} from "lucide-react"

import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarSelect,
  ToolbarSeparator,
  ToolbarToggle,
  type ToolbarTone,
} from "@/components/standard/toolbar"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const VIEW_OPTIONS = [
  { value: "board", label: "Board", icon: <LayoutGridIcon /> },
  { value: "list", label: "List", icon: <ListIcon /> },
]

function RendersToolbarGroupsDemo() {
  const [view, setView] = useState("board")
  const [starred, setStarred] = useState(false)

  return (
    <RendersDemoCard label="Groups, toggles, select">
      <Toolbar
        aria-label="Board actions"
        className="w-full rounded-lg border border-border"
      >
        <ToolbarSelect
          label="View"
          options={VIEW_OPTIONS}
          value={view}
          onValueChange={setView}
        />
        <ToolbarSeparator />
        <ToolbarGroup>
          <ToolbarToggle
            label="Star"
            hint="Star board"
            pressed={starred}
            onPressedChange={setStarred}
          >
            <StarIcon />
          </ToolbarToggle>
          <ToolbarButton label="Search" hint="Search">
            <SearchIcon />
          </ToolbarButton>
          <ToolbarButton label="Refresh" hint="Refresh">
            <RefreshCwIcon />
          </ToolbarButton>
        </ToolbarGroup>
        <ToolbarSeparator />
        <ToolbarButton label="Delete" disabled>
          <Trash2Icon />
        </ToolbarButton>
      </Toolbar>
    </RendersDemoCard>
  )
}

function RendersDockedToolbarDemo({ tone }: { tone: ToolbarTone }) {
  const [starred, setStarred] = useState(tone === "vibrant")

  return (
    <RendersDemoCard label={`docked · ${tone}`}>
      <div className="flex h-40 w-full flex-col justify-end overflow-hidden rounded-xl border border-border bg-background">
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="h-3 w-2/3 rounded-full bg-muted" />
          <div className="h-3 w-1/2 rounded-full bg-muted" />
        </div>
        <Toolbar variant="docked" tone={tone} aria-label="Message actions">
          <ToolbarButton label="Archive" hint="Archive">
            <ArchiveIcon />
          </ToolbarButton>
          <ToolbarButton label="Mark unread" hint="Mark unread">
            <MailIcon />
          </ToolbarButton>
          <ToolbarToggle
            label="Star"
            hint="Star"
            pressed={starred}
            onPressedChange={setStarred}
          >
            <StarIcon />
          </ToolbarToggle>
          <ToolbarButton label="Share" hint="Share">
            <ShareIcon />
          </ToolbarButton>
          <ToolbarButton label="New message" hint="New message">
            <PlusIcon />
          </ToolbarButton>
        </Toolbar>
      </div>
    </RendersDemoCard>
  )
}

export function RendersToolbarDemo() {
  return (
    <>
      <RendersToolbarGroupsDemo />
      <RendersDockedToolbarDemo tone="standard" />
      <RendersDockedToolbarDemo tone="vibrant" />
    </>
  )
}
