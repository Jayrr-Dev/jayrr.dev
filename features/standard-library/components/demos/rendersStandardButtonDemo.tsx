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

import { Button } from "@/components/standard/button"
import { ButtonArray } from "@/components/standard/button-array"
import { ButtonIcon } from "@/components/standard/button-icon"
import { ButtonBack, ButtonLink } from "@/components/standard/button-link"
import {
  CaptionButton,
  CaptionsArray,
} from "@/components/standard/caption-button"
import { CircleBadge } from "@/components/standard/badge-pill"
import { RefreshButton } from "@/components/standard/refresh-button"
import { StandardText } from "@/components/standard/accordion"
import { Symbol } from "@/components/standard/symbol"
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
import { RendersStandardFabDemo } from "./rendersStandardFabDemo"

const SECTION_ITEMS = [
  { id: "events", label: "Events" },
  { id: "reports", label: "Reports" },
  { id: "crew", label: "Crew" },
]

const REFRESH_SPIN_MS = 1000

const VIEW_OPTIONS = [
  { value: "board", label: "Board", icon: <LayoutGridIcon /> },
  { value: "list", label: "List", icon: <ListIcon /> },
]

function RendersToolbarDemo() {
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

function RendersRefreshButtonSpinDemo({
  iconOnly = false,
  disabled = false,
  label,
}: {
  iconOnly?: boolean
  disabled?: boolean
  label?: string
}) {
  const [refreshing, setRefreshing] = useState(false)

  function handleClick() {
    if (refreshing || disabled) {
      return
    }
    setRefreshing(true)
    window.setTimeout(() => {
      setRefreshing(false)
    }, REFRESH_SPIN_MS)
  }

  return (
    <RendersDemoCard label={label}>
      <RefreshButton
        iconOnly={iconOnly}
        disabled={disabled}
        refreshing={refreshing}
        onClick={handleClick}
      />
    </RendersDemoCard>
  )
}

function RendersLiveButtonArray() {
  const [value, setValue] = useState("events")

  // One stateful component, so the gallery sees a single card: lay the
  // cards out here and fill the dialog width.
  return (
    <div data-fill className="grid w-full gap-3 sm:grid-cols-2">
      <RendersDemoCard>
        <ButtonArray
          items={SECTION_ITEMS}
          value={value}
          onValueChange={setValue}
        />
      </RendersDemoCard>
      <RendersDemoCard label="selected">
        <StandardText>{value}</StandardText>
      </RendersDemoCard>
      <RendersDemoCard label="variant slider">
        <ButtonArray
          variant="slider"
          items={SECTION_ITEMS}
          defaultValue="crew"
        />
      </RendersDemoCard>
      <RendersDemoCard label="variant underlined">
        <ButtonArray
          variant="underlined"
          items={SECTION_ITEMS}
          defaultValue="reports"
        />
      </RendersDemoCard>
    </div>
  )
}

export function RendersStandardButtonDemo({
  pieceName,
}: {
  pieceName: string
}) {
  if (pieceName === "Button Array") {
    return <RendersLiveButtonArray />
  }

  if (
    pieceName === "Button" ||
    pieceName === "Button Base" ||
    pieceName === "Standard Button"
  ) {
    return (
      <>
        <RendersDemoCard>
          <Button>Save</Button>
        </RendersDemoCard>
        <RendersDemoCard label="tone outline">
          <Button tone="outline">Cancel</Button>
        </RendersDemoCard>
        <RendersDemoCard label="tone danger">
          <Button tone="danger">Delete</Button>
        </RendersDemoCard>
        <RendersDemoCard label="size sm">
          <Button size="sm">Small</Button>
        </RendersDemoCard>
        <RendersDemoCard label="size lg">
          <Button size="lg">Large</Button>
        </RendersDemoCard>
        <RendersDemoCard label="disabled">
          <Button disabled>Locked</Button>
        </RendersDemoCard>
        <RendersDemoCard label="loading">
          <Button loading>Saving</Button>
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Button Icon") {
    return (
      <>
        <RendersDemoCard>
          <ButtonIcon label="Star">
            <StarIcon className="size-4" />
          </ButtonIcon>
        </RendersDemoCard>
        <RendersDemoCard label="tone outline">
          <ButtonIcon label="Search" tone="outline">
            <SearchIcon className="size-4" />
          </ButtonIcon>
        </RendersDemoCard>
        <RendersDemoCard label="tone ghost">
          <ButtonIcon label="Search" tone="ghost">
            <SearchIcon className="size-4" />
          </ButtonIcon>
        </RendersDemoCard>
        <RendersDemoCard label="tone danger">
          <ButtonIcon label="Delete" tone="danger">
            <Trash2Icon className="size-4" />
          </ButtonIcon>
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Toolbar") {
    return (
      <>
        <RendersToolbarDemo />
        <RendersDockedToolbarDemo tone="standard" />
        <RendersDockedToolbarDemo tone="vibrant" />
      </>
    )
  }

  if (pieceName === "Floating Action Button") {
    return <RendersStandardFabDemo />
  }

  if (pieceName === "Button Link") {
    return (
      <>
        <RendersDemoCard>
          <ButtonLink href="#gallery">Open gallery</ButtonLink>
        </RendersDemoCard>
        <RendersDemoCard label="docs">
          <ButtonLink href="#docs">Read docs</ButtonLink>
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Button Back") {
    return (
      <>
        <RendersDemoCard label="text">
          <ButtonBack />
        </RendersDemoCard>
        <RendersDemoCard label="icon">
          <ButtonBack variant="icon" />
        </RendersDemoCard>
        <RendersDemoCard label="icon + text">
          <ButtonBack variant="icon-text" />
        </RendersDemoCard>
        <RendersDemoCard label="inline">
          <div className="flex flex-wrap items-center gap-2">
            <ButtonBack />
            <ButtonBack variant="icon" />
            <ButtonBack variant="icon-text" />
          </div>
        </RendersDemoCard>
        <RendersDemoCard label="custom href">
          <ButtonBack href="#gallery" variant="icon-text">
            Gallery
          </ButtonBack>
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Refresh Button") {
    return (
      <>
        <RendersRefreshButtonSpinDemo />
        <RendersRefreshButtonSpinDemo iconOnly label="icon only" />
        <RendersRefreshButtonSpinDemo disabled label="disabled" />
      </>
    )
  }

  if (pieceName === "Button Enhanced" || pieceName === "Reports Button") {
    return (
      <>
        <RendersDemoCard>
          <Button>
            <StarIcon className="size-3.5" />
            Inbox
            <CircleBadge className="bg-primary-foreground text-primary">
              3
            </CircleBadge>
          </Button>
        </RendersDemoCard>
        <RendersDemoCard label="tone outline">
          <Button tone="outline">
            Reports
            <CircleBadge className="bg-destructive text-white">2</CircleBadge>
          </Button>
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Caption Button") {
    return (
      <>
        <RendersDemoCard>
          <CaptionButton label="Favorite">
            <StarIcon className="size-4" />
          </CaptionButton>
        </RendersDemoCard>
        <RendersDemoCard label="pressed">
          <CaptionButton label="Favorite" defaultPressed>
            <StarIcon className="size-4" />
          </CaptionButton>
        </RendersDemoCard>
        <RendersDemoCard label="shape square">
          <CaptionButton label="Search" shape="square">
            <SearchIcon className="size-4" />
          </CaptionButton>
        </RendersDemoCard>
        <RendersDemoCard label="size sm">
          <CaptionButton label="Refresh" size="sm">
            <RefreshCwIcon className="size-3" />
          </CaptionButton>
        </RendersDemoCard>
        <RendersDemoCard label="size lg">
          <CaptionButton label="Star" size="lg">
            <StarIcon className="size-5" />
          </CaptionButton>
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Captions Array") {
    return (
      <>
        <RendersDemoCard>
          <CaptionsArray>
            <CaptionButton label="Star">
              <StarIcon className="size-4" />
            </CaptionButton>
            <CaptionButton label="Search">
              <SearchIcon className="size-4" />
            </CaptionButton>
            <CaptionButton label="Refresh">
              <RefreshCwIcon className="size-4" />
            </CaptionButton>
          </CaptionsArray>
        </RendersDemoCard>
        <RendersDemoCard label="shape square">
          <CaptionsArray>
            <CaptionButton label="Star" shape="square">
              <StarIcon className="size-4" />
            </CaptionButton>
            <CaptionButton label="Search" shape="square">
              <SearchIcon className="size-4" />
            </CaptionButton>
          </CaptionsArray>
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Button Group") {
    return <RendersLiveButtonArray />
  }

  if (
    pieceName === "Icon" ||
    pieceName === "Icon Indicator" ||
    pieceName === "Icon Tooltip Label" ||
    pieceName === "Iconify Icon" ||
    pieceName === "Lazy Icon Picker" ||
    pieceName === "Save Check Icon" ||
    pieceName === "Shield Cog Corner Icon" ||
    pieceName === "Standard Icon"
  ) {
    return (
      <RendersDemoCard label="Symbol">
        <Symbol>
          <StarIcon />
        </Symbol>
      </RendersDemoCard>
    )
  }

  return (
    <RendersDemoCard label="Button">
      <Button>{pieceName}</Button>
    </RendersDemoCard>
  )
}
