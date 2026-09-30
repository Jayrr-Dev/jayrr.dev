"use client"

import { useState } from "react"
import {
  BellIcon,
  CalendarIcon,
  CheckIcon,
  InboxIcon,
  ListFilterIcon,
  MailIcon,
  MapPinIcon,
  MessageSquareIcon,
  PlusIcon,
  SearchIcon,
  ShoppingCartIcon,
  SquarePlayIcon,
  Trash2Icon,
  TriangleIcon,
  UsersIcon,
} from "lucide-react"

import { StandardText } from "@/components/standard/accordion"
import { Avatar } from "@/components/standard/avatar"
import { Kbd } from "@/components/standard/bar-stack"
import { Badge } from "@/components/standard/badge"
import { Chip, ChipGroup, FilterChip } from "@/components/standard/chip"
import { Indicator } from "@/components/standard/indicator"
import { NotificationBadge } from "@/components/standard/notification-badge"
import { Button } from "@/components/standard/button"
import { ButtonIcon } from "@/components/standard/button-icon"
import {
  BadgeIcon,
  BadgePill,
  CircleBadge,
} from "@/components/standard/badge-pill"
import { InfoIcon, QuestionIcon } from "@/components/standard/info-icon"
import { Pill } from "@/components/standard/pill"
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

import { RendersBadgeSelectDemo } from "./rendersStandardSelectDemo"

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

const JOB_FILTERS = ["Remote", "Full-time", "Contract", "Senior"]

function RendersLiveFilterChips() {
  const [on, setOn] = useState<string[]>(["Remote"])

  return (
    <>
      <RendersDemoCard label="Filter chips (multi select)">
        <ChipGroup aria-label="Job filters">
          {JOB_FILTERS.map((filter) => (
            <Chip
              key={filter}
              selected={on.includes(filter)}
              onSelectedChange={(next) =>
                setOn((current) =>
                  next
                    ? [...current, filter]
                    : current.filter((item) => item !== filter)
                )
              }
            >
              {filter}
            </Chip>
          ))}
        </ChipGroup>
      </RendersDemoCard>
      <RendersDemoCard label="Active filters (removable)">
        {on.length > 0 ? (
          <ChipGroup aria-label="Active filters">
            {on.map((filter) => (
              <FilterChip
                key={filter}
                onRemove={() =>
                  setOn((current) => current.filter((item) => item !== filter))
                }
              >
                {filter}
              </FilterChip>
            ))}
            <Button tone="ghost" size="sm" onClick={() => setOn([])}>
              Clear all
            </Button>
          </ChipGroup>
        ) : (
          <StandardText>No filters. Pick some above.</StandardText>
        )}
      </RendersDemoCard>
    </>
  )
}

function RendersChipDemos() {
  return (
    <>
      <RendersLiveFilterChips />
      <RendersDemoCard label="Uncontrolled">
        <ChipGroup aria-label="Uncontrolled chips">
          <Chip defaultSelected>Selected</Chip>
          <Chip defaultSelected={false}>Not selected</Chip>
        </ChipGroup>
      </RendersDemoCard>
      <RendersDemoCard label="Action chips">
        <ChipGroup aria-label="Quick actions">
          <Chip icon={<CalendarIcon />}>Add date</Chip>
          <Chip icon={<MapPinIcon />}>Add location</Chip>
          <Chip icon={<PlusIcon />}>New tag</Chip>
        </ChipGroup>
      </RendersDemoCard>
      <RendersDemoCard label="size sm">
        <ChipGroup aria-label="Small chips">
          <Chip size="sm" defaultSelected>
            Today
          </Chip>
          <Chip size="sm" defaultSelected={false}>
            This week
          </Chip>
          <FilterChip size="sm" onRemove={() => {}}>
            Design
          </FilterChip>
        </ChipGroup>
      </RendersDemoCard>
      <RendersDemoCard label="disabled">
        <ChipGroup aria-label="Disabled chips">
          <Chip disabled>Archived</Chip>
          <Chip disabled defaultSelected>
            Locked
          </Chip>
        </ChipGroup>
      </RendersDemoCard>
      <RendersDemoCard label="Chip vs Badge">
        <Row className="gap-4">
          <Badge tone="quiet">Draft</Badge>
          <span className="text-xs text-muted-foreground">static</span>
          <Chip defaultSelected={false}>Draft</Chip>
          <span className="text-xs text-muted-foreground">pressable</span>
        </Row>
      </RendersDemoCard>
    </>
  )
}

const NAV_ITEMS: {
  id: string
  label: string
  icon: typeof MailIcon
  count?: number
}[] = [
  { id: "mail", label: "Mail", icon: MailIcon, count: 1284 },
  { id: "chat", label: "Chat", icon: MessageSquareIcon, count: 10 },
  { id: "rooms", label: "Rooms", icon: UsersIcon, count: undefined },
  { id: "meet", label: "Meet", icon: SquarePlayIcon, count: 3 },
]

function RendersLiveNavBadges() {
  const [active, setActive] = useState("mail")
  const [read, setRead] = useState<string[]>([])

  return (
    <RendersDemoCard label="Navigation bar (click to mark read)">
      <nav
        aria-label="Apps"
        className="flex w-full max-w-md justify-around rounded-xl bg-muted/60 p-2"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const unread = !read.includes(item.id)
          const isActive = active === item.id

          return (
            <button
              key={item.id}
              type="button"
              aria-current={isActive ? "page" : undefined}
              onClick={() => {
                setActive(item.id)
                setRead((current) => [...current, item.id])
              }}
              className="flex flex-col items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <span
                className={
                  isActive
                    ? "grid h-8 w-14 place-items-center rounded-full bg-primary/10"
                    : "grid h-8 w-14 place-items-center rounded-full"
                }
              >
                {unread ? (
                  <NotificationBadge count={item.count} max={999}>
                    <Icon className="size-5" />
                  </NotificationBadge>
                ) : (
                  <Icon className="size-5" />
                )}
              </span>
              {item.label}
            </button>
          )
        })}
      </nav>
    </RendersDemoCard>
  )
}

function RendersNotificationBadgeDemos() {
  return (
    <>
      <RendersLiveNavBadges />
      <RendersDemoCard label="Dot, count, max">
        <Row className="gap-10">
          <NotificationBadge>
            <TriangleIcon className="size-5" />
          </NotificationBadge>
          <NotificationBadge count={1}>
            <TriangleIcon className="size-5" />
          </NotificationBadge>
          <NotificationBadge count={1500} max={999}>
            <TriangleIcon className="size-5" />
          </NotificationBadge>
        </Row>
      </RendersDemoCard>
      <RendersDemoCard label="tone alert, brand, neutral">
        <Row className="gap-6">
          <NotificationBadge count={4}>
            <ButtonIcon label="Notifications, 4 unread" tone="outline">
              <BellIcon className="size-4" />
            </ButtonIcon>
          </NotificationBadge>
          <NotificationBadge count={5} tone="brand">
            <ButtonIcon label="Cart, 5 items" tone="outline">
              <ShoppingCartIcon className="size-4" />
            </ButtonIcon>
          </NotificationBadge>
          <NotificationBadge count={12} tone="neutral">
            <ButtonIcon label="Inbox, 12 unread" tone="outline">
              <InboxIcon className="size-4" />
            </ButtonIcon>
          </NotificationBadge>
        </Row>
      </RendersDemoCard>
      <RendersDemoCard label="Inline in a list">
        <div className="flex w-56 flex-col gap-1 text-sm">
          <span className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted">
            Inbox
            <NotificationBadge count={24} />
          </span>
          <span className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted">
            Mentions
            <NotificationBadge />
          </span>
          <span className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted">
            Archive
            <NotificationBadge count={0} />
          </span>
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="Zero: hidden vs showZero">
        <Row className="gap-6">
          <NotificationBadge count={0}>
            <BellIcon className="size-5" />
          </NotificationBadge>
          <NotificationBadge count={0} showZero tone="neutral">
            <BellIcon className="size-5" />
          </NotificationBadge>
        </Row>
      </RendersDemoCard>
    </>
  )
}

const PEOPLE = [
  { initials: "AK", status: "online" as const },
  { initials: "MR", status: "away" as const },
  { initials: "JL", status: "busy" as const },
  { initials: "SO", status: "offline" as const },
]

function RendersIndicatorDemos() {
  return (
    <>
      <RendersDemoCard label="On an avatar">
        <Row className="gap-4">
          {PEOPLE.map((person) => (
            <Indicator key={person.initials} status={person.status}>
              <Avatar>{person.initials}</Avatar>
            </Indicator>
          ))}
        </Row>
      </RendersDemoCard>
      <RendersDemoCard label="Inline with label">
        <div className="flex flex-col gap-2">
          {PEOPLE.map((person) => (
            <Indicator key={person.initials} status={person.status} showLabel />
          ))}
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="size sm, default, lg">
        <Row className="gap-4">
          <Indicator size="sm">
            <Avatar size="sm">AK</Avatar>
          </Indicator>
          <Indicator>
            <Avatar>AK</Avatar>
          </Indicator>
          <Indicator size="lg">
            <Avatar size="lg">AK</Avatar>
          </Indicator>
        </Row>
      </RendersDemoCard>
      <RendersDemoCard label="Custom label">
        <Indicator status="busy" label="In a meeting" showLabel />
      </RendersDemoCard>
    </>
  )
}

export function RendersStandardBadgeDemo({ pieceName }: { pieceName: string }) {
  if (pieceName === "Chip") {
    return <RendersChipDemos />
  }

  if (pieceName === "Notification Badge") {
    return <RendersNotificationBadgeDemos />
  }

  if (pieceName === "Indicator") {
    return <RendersIndicatorDemos />
  }

  if (pieceName === "Standard Toolbar Count") {
    return <RendersToolbarCountDemos />
  }

  if (pieceName === "Badge Select") {
    return <RendersBadgeSelectDemo />
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

  if (pieceName === "Standard Badge") {
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

  if (pieceName === "Pill") {
    return (
      <>
        <RendersDemoCard>
          <Pill label="Status">Ready</Pill>
        </RendersDemoCard>
        <RendersDemoCard label="tone outline">
          <Pill label="Build" tone="outline">
            Draft
          </Pill>
        </RendersDemoCard>
        <RendersDemoCard label="tone danger">
          <Pill label="Deploy" tone="danger">
            Hold
          </Pill>
        </RendersDemoCard>
        <RendersDemoCard label="radius none">
          <Pill label="Version" radius="none">
            v2.4
          </Pill>
        </RendersDemoCard>
        <RendersDemoCard label="radius sm">
          <Pill label="Region" radius="sm">
            us-east
          </Pill>
        </RendersDemoCard>
        <RendersDemoCard label="radius md">
          <Pill label="Coverage" radius="md">
            92%
          </Pill>
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
