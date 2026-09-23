"use client"

import { useState } from "react"
import { CheckIcon } from "lucide-react"

import { StandardText } from "@/components/standard/accordion"
import { Kbd } from "@/components/standard/bar-stack"
import { Badge } from "@/components/standard/badge"
import { BadgeIcon, BadgePill, CircleBadge } from "@/components/standard/badge-pill"
import { InfoIcon, QuestionIcon } from "@/components/standard/info-icon"
import { Row } from "@/components/standard/row"
import { ToggleableBadges } from "@/components/standard/toggleable-badges"
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

export function RendersStandardBadgeDemo({
  pieceName,
}: {
  pieceName: string
}) {
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

  if (pieceName === "Circle Badge" || pieceName === "Displays Defines New Badge") {
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
            <QuestionIcon
              label="Cost help"
              body="Labor plus equipment."
            />
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
