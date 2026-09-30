"use client"

import { ChevronRightIcon, ClockIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"

import { CardBar } from "@/components/standard/card-bar"
import { Stack } from "@/components/standard/stack"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

function RendersThumbnail() {
  return (
    <span className="block aspect-square w-24 overflow-hidden rounded-lg border border-border bg-linear-to-br from-muted to-border" />
  )
}

export function RendersCardBarDemo() {
  return (
    <>
      <RendersDemoCard>
        <CardBar title="Timesheets" description="Hours for this week" />
      </RendersDemoCard>
      <RendersDemoCard label="stack">
        <Stack className="w-full">
          <CardBar title="Jobs" description="Open work" />
          <CardBar title="Crew" description="Who is on site" />
        </Stack>
      </RendersDemoCard>
      <RendersDemoCard label="leading image">
        <CardBar
          title="Site photos"
          description="12 uploads from today"
          leading={<RendersThumbnail />}
        />
      </RendersDemoCard>
      <RendersDemoCard label="leading">
        <CardBar
          title="Timesheets"
          description="Hours for this week"
          leading={<ClockIcon className="size-4" />}
        />
      </RendersDemoCard>
      <RendersDemoCard label="trailing">
        <CardBar
          title="Jobs"
          description="Open work"
          trailing={
            <>
              <Badge variant="secondary">12</Badge>
              <ChevronRightIcon className="size-4" />
            </>
          }
        />
      </RendersDemoCard>
      <RendersDemoCard label="selected">
        <Stack className="w-full">
          <CardBar title="Jobs" description="Open work" selected />
          <CardBar title="Crew" description="Who is on site" selected={false} />
        </Stack>
      </RendersDemoCard>
      <RendersDemoCard label="size sm">
        <CardBar
          size="sm"
          title="Timesheets"
          description="Hours for this week"
          leading={<ClockIcon className="size-3.5" />}
          trailing={<ChevronRightIcon className="size-3.5" />}
        />
      </RendersDemoCard>
      <RendersDemoCard label="trailing image">
        <CardBar
          title="Site photos"
          description="12 uploads from today"
          trailing={<RendersThumbnail />}
        />
      </RendersDemoCard>
    </>
  )
}
