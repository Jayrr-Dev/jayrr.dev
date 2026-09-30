"use client"

import { useState } from "react"
import { CalendarIcon, MapPinIcon, PlusIcon } from "lucide-react"

import { Badge } from "@/components/standard/badge"
import { Button } from "@/components/standard/button"
import { Chip, ChipGroup, FilterChip } from "@/components/standard/chip"
import { Row } from "@/components/standard/row"
import { StandardText } from "@/components/standard/standard-text"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

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

export function RendersChipDemo() {
  return <RendersChipDemos />
}
