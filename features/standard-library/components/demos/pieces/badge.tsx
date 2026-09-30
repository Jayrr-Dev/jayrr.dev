"use client"

import { CheckIcon, ChevronDownIcon, ClockIcon } from "lucide-react"

import { Badge } from "@/components/standard/badge"
import { Stack } from "@/components/standard/stack"
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
      <RendersDemoCard label="size sm, default, lg">
        <Stack direction="row" align="center">
          <Badge size="sm">Small</Badge>
          <Badge>Default</Badge>
          <Badge size="lg">Large</Badge>
        </Stack>
      </RendersDemoCard>
      <RendersDemoCard label="tone success, warning, info">
        <Stack direction="row" align="center">
          <Badge tone="success">Live</Badge>
          <Badge tone="warning">Pending</Badge>
          <Badge tone="info">Beta</Badge>
        </Stack>
      </RendersDemoCard>
      <RendersDemoCard label="appearance soft">
        <Stack direction="row" align="center" className="flex-wrap">
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
        </Stack>
      </RendersDemoCard>
      <RendersDemoCard label="appearance outline">
        <Stack direction="row" align="center">
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
        </Stack>
      </RendersDemoCard>
      <RendersDemoCard label="leading icon">
        <Stack direction="row" align="center">
          <Badge leading={<CheckIcon />}>Saved</Badge>
          <Badge appearance="soft" tone="info" leading={<ClockIcon />}>
            Scheduled
          </Badge>
        </Stack>
      </RendersDemoCard>
      <RendersDemoCard label="trailing">
        <Badge tone="outline" trailing={<ChevronDownIcon />}>
          Status
        </Badge>
      </RendersDemoCard>
      <RendersDemoCard label="dot">
        <Stack direction="row" align="center">
          <Badge appearance="soft" tone="success" dot>
            Online
          </Badge>
          <Badge appearance="soft" tone="warning" dot>
            Degraded
          </Badge>
          <Badge appearance="outline" tone="danger" dot>
            Down
          </Badge>
        </Stack>
      </RendersDemoCard>
      <RendersDemoCard label="shape circle">
        <Stack direction="row" align="center">
          <Badge shape="circle">4</Badge>
          <Badge shape="circle" tone="danger">
            12
          </Badge>
          <span className="inline-flex items-center gap-1 text-lg">
            Inbox <Badge shape="circle">128</Badge>
          </span>
        </Stack>
      </RendersDemoCard>
    </>
  )
}
