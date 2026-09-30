"use client"

import { CheckIcon } from "lucide-react"

import { Badge } from "@/components/standard/badge"
import { BadgeIcon, BadgePill } from "@/components/standard/badge-pill"
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
    </>
  )
}
