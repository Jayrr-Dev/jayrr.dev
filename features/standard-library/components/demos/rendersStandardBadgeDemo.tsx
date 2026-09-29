"use client"

import { useState } from "react"
import {
  BellIcon,
  CheckIcon,
  InboxIcon,
  ListFilterIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react"

import { StandardText } from "@/components/standard/accordion"
import { Kbd } from "@/components/standard/bar-stack"
import { Badge } from "@/components/standard/badge"
import { Button } from "@/components/standard/button"
import { ButtonIcon } from "@/components/standard/button-icon"
import {
  BadgeIcon,
  BadgePill,
  CircleBadge,
} from "@/components/standard/badge-pill"
import { InfoIcon, QuestionIcon } from "@/components/standard/info-icon"
import { Row } from "@/components/standard/row"
import { ToggleableBadges } from "@/components/standard/toggleable-badges"
import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/standard/toolbar"
import {
  ToolbarCount,
  ToolbarCountBadge,
  ToolbarSelectionCount,
} from "@/components/standard/toolbar-count"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const BADGE_ITEMS = [
  { id: "open", label: "Open" },
  { id: "hold", label: "Hold" },
  { id: "done", label: "Done" },
]

function RendersLiveToggleableBadges() {
  const [value, setValue] = useState("open")

  return (
    <>
      <RendersDemoCard>
        <ToggleableBadges
          items={BADGE_ITEMS}
          value={value}
          onValueChange={setValue}
        />
      </RendersDemoCard>
      <RendersDemoCard label="multi">
        <ToggleableBadges multiple items={BADGE_ITEMS} />
      </RendersDemoCard>
      <RendersDemoCard label="selected">
        <StandardText>{value}</StandardText>
      </RendersDemoCard>
    </>
  )
}

const TOTAL_JOBS = 120

function RendersLiveSelectionCount() {
  const [selected, setSelected] = useState(3)

  return (
    <RendersDemoCard label="Selection with clear">
      <Row>
        {selected > 0 ? (
          <ToolbarSelectionCount
            count={selected}
            onClear={() => setSelected(0)}
          />
        ) : (
          <Button tone="outline" size="sm" onClick={() => setSelected(3)}>
            Select 3 rows
          </Button>
        )}
      </Row>
    </RendersDemoCard>
  )
}

function RendersLiveToolbarCount() {
  const [selected, setSelected] = useState(2)
  const shown = selected > 0 ? selected : 24

  return (
    <RendersDemoCard label="In a toolbar">
      <Toolbar aria-label="Jobs" className="rounded-lg border border-border">
        <ToolbarGroup>
          <ToolbarButton label="Search" hint="Search">
            <SearchIcon />
          </ToolbarButton>
          <ToolbarCountBadge count={3}>
            <ToolbarButton label="Filters" hint="3 filters on">
              <ListFilterIcon />
            </ToolbarButton>
          </ToolbarCountBadge>
        </ToolbarGroup>
        <ToolbarSeparator />
        {selected > 0 ? (
          <>
            <ToolbarSelectionCount
              count={selected}
              onClear={() => setSelected(0)}
            />
            <ToolbarButton label="Delete selected" hint="Delete">
              <Trash2Icon />
            </ToolbarButton>
          </>
        ) : (
          <ToolbarCount count={shown} total={TOTAL_JOBS} noun="job" />
        )}
        <span className="ml-auto" />
        {selected === 0 ? (
          <Button tone="ghost" size="sm" onClick={() => setSelected(2)}>
            Select 2
          </Button>
        ) : null}
      </Toolbar>
    </RendersDemoCard>
  )
}

function RendersToolbarCountDemos() {
  return (
    <>
      <RendersLiveToolbarCount />
      <RendersDemoCard label="Text">
        <ToolbarCount count={24} noun="job" />
      </RendersDemoCard>
      <RendersDemoCard label="Filtered of total">
        <ToolbarCount count={3} total={TOTAL_JOBS} noun="job" />
      </RendersDemoCard>
      <RendersDemoCard label="Pill">
        <Row>
          <ToolbarCount variant="pill" count={1} noun="report" />
          <ToolbarCount
            variant="pill"
            count={1284}
            noun="entry"
            plural="entries"
          />
        </Row>
      </RendersDemoCard>
      <RendersDemoCard label="Empty">
        <ToolbarCount count={0} noun="result" />
      </RendersDemoCard>
      <RendersDemoCard label="Corner badge">
        <Row className="gap-4">
          <ToolbarCountBadge count={5}>
            <ButtonIcon label="Notifications" tone="outline">
              <BellIcon className="size-4" />
            </ButtonIcon>
          </ToolbarCountBadge>
          <ToolbarCountBadge count={128} tone="danger">
            <ButtonIcon label="Inbox" tone="outline">
              <InboxIcon className="size-4" />
            </ButtonIcon>
          </ToolbarCountBadge>
          <ToolbarCountBadge count={0}>
            <ButtonIcon label="Filters" tone="outline">
              <ListFilterIcon className="size-4" />
            </ButtonIcon>
          </ToolbarCountBadge>
        </Row>
      </RendersDemoCard>
      <RendersDemoCard label="Inline on a button">
        <Button tone="outline" size="sm">
          <ListFilterIcon className="size-3.5" />
          Filters
          <CircleBadge>3</CircleBadge>
        </Button>
      </RendersDemoCard>
      <RendersLiveSelectionCount />
    </>
  )
}

export function RendersStandardBadgeDemo({ pieceName }: { pieceName: string }) {
  if (pieceName === "Standard Toolbar Count") {
    return <RendersToolbarCountDemos />
  }

  if (pieceName === "Toggleable Badges") {
    return <RendersLiveToggleableBadges />
  }

  if (pieceName === "Badge" || pieceName === "Filter Category Badge") {
    return (
      <>
        <RendersDemoCard>
          <Badge>Default</Badge>
        </RendersDemoCard>
        <RendersDemoCard label="tone quiet">
          <Badge tone="quiet">Quiet</Badge>
        </RendersDemoCard>
        <RendersDemoCard label="tone outline">
          <Badge tone="outline">Outline</Badge>
        </RendersDemoCard>
        <RendersDemoCard label="tone danger">
          <Badge tone="danger">Danger</Badge>
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Badge Pill" || pieceName === "Standard Badge") {
    return (
      <>
        <RendersDemoCard>
          <BadgePill>Ready</BadgePill>
        </RendersDemoCard>
        <RendersDemoCard label="tone outline">
          <BadgePill tone="outline">Draft</BadgePill>
        </RendersDemoCard>
        <RendersDemoCard label="tone danger">
          <BadgePill tone="danger">Hold</BadgePill>
        </RendersDemoCard>
      </>
    )
  }

  if (
    pieceName === "Circle Badge" ||
    pieceName === "Displays Defines New Badge"
  ) {
    return (
      <>
        <RendersDemoCard>
          <CircleBadge>4</CircleBadge>
        </RendersDemoCard>
        <RendersDemoCard label="count 12">
          <CircleBadge>12</CircleBadge>
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Badge Icon") {
    return (
      <>
        <RendersDemoCard>
          <BadgeIcon>
            <CheckIcon className="size-3" />
            Saved
          </BadgeIcon>
        </RendersDemoCard>
        <RendersDemoCard label="tone outline">
          <BadgeIcon tone="outline">
            <CheckIcon className="size-3" />
            Draft
          </BadgeIcon>
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Info Icon" || pieceName === "Icon Popover") {
    return (
      <>
        <RendersDemoCard>
          <Row>
            <span className="text-sm font-medium">Hours</span>
            <InfoIcon label="Hours help" body="Billable hours for this week." />
          </Row>
        </RendersDemoCard>
        <RendersDemoCard label="tone alert">
          <InfoIcon
            tone="alert"
            label="Hold help"
            body="This job is on hold until Friday."
          />
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Question Icon") {
    return (
      <>
        <RendersDemoCard>
          <QuestionIcon
            label="What is this?"
            body="Short help for this field."
          />
        </RendersDemoCard>
        <RendersDemoCard label="next to title">
          <Row>
            <span className="text-sm font-medium">Cost</span>
            <QuestionIcon label="Cost help" body="Labor plus equipment." />
          </Row>
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Kbd") {
    return (
      <>
        <RendersDemoCard>
          <Kbd>⌘K</Kbd>
        </RendersDemoCard>
        <RendersDemoCard label="shortcut row">
          <Row>
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </Row>
        </RendersDemoCard>
      </>
    )
  }

  return (
    <RendersDemoCard label="Badge">
      <Badge>{pieceName}</Badge>
    </RendersDemoCard>
  )
}
