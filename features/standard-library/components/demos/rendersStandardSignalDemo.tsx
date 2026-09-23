"use client"

import { useState } from "react"

import { Alert, BroadcastBanner, LoadingState, Spinner } from "@/components/standard/bar-stack"
import { Button } from "@/components/standard/button"
import { FilterSelect } from "@/components/standard/filter-select"
import { ControlBar, PageHeader, TabNavigation } from "@/components/standard/page-header"
import { RefreshButton } from "@/components/standard/refresh-button"
import { Row } from "@/components/standard/row"
import { Search } from "@/components/standard/search"
import { ToastButton } from "@/components/standard/toast"
import { RendersNotBuiltDemo } from "@/features/standard-library/components/demos/rendersNotBuiltDemo"
import { Skeleton } from "@/components/standard/skeleton"
import { Stack } from "@/components/standard/stack"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const NAV_ITEMS = [
  { id: "events", label: "Events" },
  { id: "reports", label: "Reports" },
  { id: "crew", label: "Crew" },
]

function RendersLiveTabs() {
  const [value, setValue] = useState("events")

  return (
    <>
      <RendersDemoCard className="w-full max-w-xl">
        <TabNavigation
          items={NAV_ITEMS}
          value={value}
          onValueChange={setValue}
        />
      </RendersDemoCard>
      <RendersDemoCard label="selected">
        <span className="text-sm">{value}</span>
      </RendersDemoCard>
    </>
  )
}

export function RendersStandardSignalDemo({
  pieceName,
}: {
  pieceName: string
}) {
  if (
    pieceName === "Skeleton" ||
    pieceName === "Page Skeletons" ||
    pieceName === "Job Costing Skeleton"
  ) {
    return (
      <>
        <RendersDemoCard>
          <Row className="w-full">
            <Skeleton className="size-10 rounded-full" />
            <Stack className="flex-1">
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-full" />
            </Stack>
          </Row>
        </RendersDemoCard>
        <RendersDemoCard label="block">
          <Skeleton className="h-16 w-full" />
        </RendersDemoCard>
      </>
    )
  }

  if (
    pieceName === "Spinner" ||
    pieceName === "Loading Check" ||
    pieceName === "Loading State"
  ) {
    return (
      <>
        <RendersDemoCard>
          <LoadingState label="Loading jobs" />
        </RendersDemoCard>
        <RendersDemoCard label="spinner only">
          <Spinner />
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Alert") {
    return (
      <>
        <RendersDemoCard>
          <Alert title="Hold">This job is on hold.</Alert>
        </RendersDemoCard>
        <RendersDemoCard label="success">
          <Alert title="Saved">Hours posted for Monday.</Alert>
        </RendersDemoCard>
      </>
    )
  }

  if (
    pieceName === "Broadcast Banner" ||
    pieceName === "Broadcast Banner Container"
  ) {
    return (
      <>
        <RendersDemoCard className="w-full max-w-xl">
          <BroadcastBanner title="Office closed Friday">
            Submit hours by Thursday.
          </BroadcastBanner>
        </RendersDemoCard>
        <RendersDemoCard label="short" className="w-full max-w-xl">
          <BroadcastBanner title="New rate card">
            Starts next period.
          </BroadcastBanner>
        </RendersDemoCard>
      </>
    )
  }

  if (
    pieceName === "Toast" ||
    pieceName === "Popup Notification Display" ||
    pieceName === "Popup Notification Container" ||
    pieceName === "PWA Notification" ||
    pieceName === "App Badge Notification" ||
    pieceName === "App Title Notification" ||
    pieceName === "Favicon Notification"
  ) {
    return (
      <>
        <RendersDemoCard label="Toast">
          <ToastButton message="Saved timesheet.">Show toast</ToastButton>
        </RendersDemoCard>
        <RendersDemoCard label="Toast · danger">
          <ToastButton message="Could not post hours." tone="danger">
            Show error
          </ToastButton>
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Page Header") {
    return (
      <>
        <RendersDemoCard className="w-full max-w-xl">
          <PageHeader
            title="Timesheets"
            info="Hours for the open period."
            backLabel="Back"
          >
            <RefreshButton />
          </PageHeader>
        </RendersDemoCard>
        <RendersDemoCard label="with action" className="w-full max-w-xl">
          <PageHeader title="Jobs">
            <Button size="sm">New</Button>
          </PageHeader>
        </RendersDemoCard>
      </>
    )
  }

  if (
    pieceName === "Control Bar" ||
    pieceName === "Standard Toolbar Search Cluster"
  ) {
    return (
      <>
        <RendersDemoCard className="w-full max-w-xl">
          <ControlBar>
            <Search size="sm" placeholder="Filter" />
            <FilterSelect
              placeholder="Owner"
              options={[
                { value: "all", label: "All" },
                { value: "mine", label: "Mine" },
              ]}
            />
          </ControlBar>
        </RendersDemoCard>
        <RendersDemoCard label="refresh only" className="w-full max-w-xl">
          <ControlBar>
            <RefreshButton />
          </ControlBar>
        </RendersDemoCard>
      </>
    )
  }

  if (
    pieceName === "Tab Navigation" ||
    pieceName === "Tabs" ||
    pieceName === "Tab Drawn"
  ) {
    return <RendersLiveTabs />
  }

  if (pieceName === "Navigation Menu") {
    return <RendersLiveTabs />
  }

  if (pieceName === "Blur Overlay") {
    return <RendersNotBuiltDemo pieceName={pieceName} />
  }

  return <RendersNotBuiltDemo pieceName={pieceName} />
}
