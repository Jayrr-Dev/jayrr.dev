"use client"

import { CheckIcon, ChevronDownIcon, ClockIcon } from "lucide-react"

import { Badge } from "@/components/standard/badge"
import { BadgeIcon, BadgePill } from "@/components/standard/badge-pill"
import { Row } from "@/components/standard/row"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersBadgeDemo() {
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
      <RendersDemoCard label="pill">
        <BadgePill>Ready</BadgePill>
      </RendersDemoCard>
      <RendersDemoCard label="pill · tone outline">
        <BadgePill tone="outline">Draft</BadgePill>
      </RendersDemoCard>
      <RendersDemoCard label="pill · tone danger">
        <BadgePill tone="danger">Hold</BadgePill>
      </RendersDemoCard>
      <RendersDemoCard label="with icon">
        <BadgeIcon>
          <CheckIcon className="size-3" />
          Saved
        </BadgeIcon>
      </RendersDemoCard>
      <RendersDemoCard label="with icon · tone outline">
        <BadgeIcon tone="outline">
          <CheckIcon className="size-3" />
          Draft
        </BadgeIcon>
      </RendersDemoCard>
      <RendersDemoCard label="size sm, default, lg">
        <Row>
          <Badge size="sm">Small</Badge>
          <Badge>Default</Badge>
          <Badge size="lg">Large</Badge>
        </Row>
      </RendersDemoCard>
      <RendersDemoCard label="tone success, warning, info">
        <Row>
          <Badge tone="success">Live</Badge>
          <Badge tone="warning">Pending</Badge>
          <Badge tone="info">Beta</Badge>
        </Row>
      </RendersDemoCard>
      <RendersDemoCard label="appearance soft">
        <Row className="flex-wrap">
          <Badge appearance="soft">Default</Badge>
          <Badge appearance="soft" tone="quiet">
            Quiet
          </Badge>
          <Badge appearance="soft" tone="success">
            Success
          </Badge>
          <Badge appearance="soft" tone="warning">
            Warning
          </Badge>
          <Badge appearance="soft" tone="info">
            Info
          </Badge>
          <Badge appearance="soft" tone="danger">
            Danger
          </Badge>
        </Row>
      </RendersDemoCard>
      <RendersDemoCard label="appearance outline">
        <Row>
          <Badge appearance="outline">Default</Badge>
          <Badge appearance="outline" tone="success">
            Success
          </Badge>
          <Badge appearance="outline" tone="warning">
            Warning
          </Badge>
          <Badge appearance="outline" tone="danger">
            Danger
          </Badge>
        </Row>
      </RendersDemoCard>
      <RendersDemoCard label="leading icon">
        <Row>
          <Badge leading={<CheckIcon />}>Saved</Badge>
          <Badge appearance="soft" tone="info" leading={<ClockIcon />}>
            Scheduled
          </Badge>
        </Row>
      </RendersDemoCard>
      <RendersDemoCard label="trailing">
        <Badge tone="outline" trailing={<ChevronDownIcon />}>
          Status
        </Badge>
      </RendersDemoCard>
      <RendersDemoCard label="dot">
        <Row>
          <Badge appearance="soft" tone="success" dot>
            Online
          </Badge>
          <Badge appearance="soft" tone="warning" dot>
            Degraded
          </Badge>
          <Badge appearance="outline" tone="danger" dot>
            Down
          </Badge>
        </Row>
      </RendersDemoCard>
      <RendersDemoCard label="shape circle">
        <Row>
          <Badge shape="circle">4</Badge>
          <Badge shape="circle" tone="danger">
            12
          </Badge>
          <span className="inline-flex items-center gap-1 text-lg">
            Inbox <Badge shape="circle">128</Badge>
          </span>
        </Row>
      </RendersDemoCard>
    </>
  )
}
