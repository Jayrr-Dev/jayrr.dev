"use client"

import { StarIcon } from "lucide-react"

import { CircleBadge } from "@/components/standard/badge-pill"
import { Button } from "@/components/standard/button"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersButtonDemo() {
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
      <RendersDemoCard label="with count">
        <Button>
          <StarIcon className="size-3.5" />
          Inbox
          <CircleBadge className="bg-primary-foreground text-primary">
            3
          </CircleBadge>
        </Button>
      </RendersDemoCard>
      <RendersDemoCard label="with count · tone outline">
        <Button tone="outline">
          Reports
          <CircleBadge className="bg-destructive text-white">2</CircleBadge>
        </Button>
      </RendersDemoCard>
    </>
  )
}
