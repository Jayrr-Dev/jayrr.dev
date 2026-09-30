"use client"

import { useState } from "react"
import {
  BellIcon,
  InboxIcon,
  ListFilterIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react"

import { CircleBadge } from "@/components/standard/badge-pill"
import { Button } from "@/components/standard/button"
import { ButtonIcon } from "@/components/standard/button-icon"
import { Row } from "@/components/standard/row"
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

export function RendersStandardToolbarCountDemo() {
  return <RendersToolbarCountDemos />
}
