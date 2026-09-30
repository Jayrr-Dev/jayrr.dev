"use client"

import { ChevronRightIcon, ClockIcon } from "lucide-react"

import { CardBar } from "@/components/standard/card-bar"
import { Stack } from "@/components/standard/stack"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

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
      <RendersDemoCard label="icon left">
        <CardBar
          title="Timesheets"
          description="Hours for this week"
          icon={<ClockIcon />}
        />
      </RendersDemoCard>
      <RendersDemoCard label="icon right">
        <CardBar
          title="Timesheets"
          description="Hours for this week"
          icon={<ChevronRightIcon />}
          iconPosition="right"
        />
      </RendersDemoCard>
      <RendersDemoCard label="auto size">
        <Stack className="w-full">
          <CardBar
            autoSize
            title="Timesheets"
            description="Hours for this week"
            icon={<ClockIcon />}
          />
          <CardBar
            autoSize
            title="Site photos"
            description="12 uploads from today"
            image={
              <span className="block size-full bg-linear-to-br from-muted to-border" />
            }
          />
        </Stack>
      </RendersDemoCard>
      <RendersDemoCard label="image left">
        <CardBar
          title="Site photos"
          description="12 uploads from today"
          image={
            <span className="block size-full bg-linear-to-br from-muted to-border" />
          }
        />
      </RendersDemoCard>
      <RendersDemoCard label="image right">
        <CardBar
          title="Site photos"
          description="12 uploads from today"
          imagePosition="right"
          image={
            <span className="block size-full bg-linear-to-br from-muted to-border" />
          }
        />
      </RendersDemoCard>
    </>
  )
}
