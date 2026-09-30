"use client"

import { useRef, useState } from "react"
import {
  ArrowLeftIcon,
  BellIcon,
  CalendarIcon,
  ClipboardListIcon,
  HomeIcon,
  InboxIcon,
  MenuIcon,
  MicIcon,
  MoreVerticalIcon,
  PencilIcon,
  SendIcon,
  SettingsIcon,
  StarIcon,
  UsersIcon,
} from "lucide-react"

import { AppBar, AppBarSearch } from "@/components/standard/app-bar"
import {
  Alert,
  BroadcastBanner,
  LoadingState,
  Spinner,
} from "@/components/standard/bar-stack"
import { Button } from "@/components/standard/button"
import { ButtonIcon } from "@/components/standard/button-icon"
import { Select } from "@/components/standard/select"
import {
  NavigationBar,
  NavigationDrawer,
  NavigationRail,
  type NavigationDrawerSection,
  type NavigationItem,
} from "@/components/standard/navigation"
import {
  ControlBar,
  PageHeader,
  TabNavigation,
} from "@/components/standard/page-header"
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

const DESTINATIONS: NavigationItem[] = [
  { id: "home", label: "Home", icon: <HomeIcon /> },
  { id: "jobs", label: "Jobs", icon: <ClipboardListIcon />, badge: 3 },
  { id: "schedule", label: "Schedule", icon: <CalendarIcon /> },
  { id: "crew", label: "Crew", icon: <UsersIcon />, badge: true },
]

const DRAWER_SECTIONS: NavigationDrawerSection[] = [
  {
    id: "mail",
    items: [
      { id: "inbox", label: "Inbox", icon: <InboxIcon />, badge: 24 },
      { id: "sent", label: "Sent", icon: <SendIcon /> },
      { id: "starred", label: "Starred", icon: <StarIcon /> },
    ],
  },
  {
    id: "workspace",
    label: "Workspace",
    items: [
      { id: "alerts", label: "Alerts", icon: <BellIcon />, badge: true },
      { id: "settings", label: "Settings", icon: <SettingsIcon /> },
    ],
  },
]

function RendersLiveNavigationBar() {
  const [value, setValue] = useState("home")

  return (
    <>
      <RendersDemoCard className="w-full max-w-md p-0">
        <NavigationBar
          className="rounded-b-xl"
          items={DESTINATIONS}
          value={value}
          onValueChange={setValue}
        />
      </RendersDemoCard>
      <RendersDemoCard label="inline" className="w-full max-w-xl p-0">
        <NavigationBar
          className="rounded-b-xl"
          layout="inline"
          items={DESTINATIONS.slice(0, 3)}
          value={value}
          onValueChange={setValue}
        />
      </RendersDemoCard>
    </>
  )
}

function RendersLiveNavigationRail() {
  const [value, setValue] = useState("home")
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <RendersDemoCard className="w-full max-w-xl p-0">
        <div className="flex h-96 overflow-hidden rounded-xl">
          <NavigationRail
            className="border-r border-border"
            items={DESTINATIONS}
            value={value}
            onValueChange={setValue}
            expanded={expanded}
            header={
              <>
                <ButtonIcon
                  label={expanded ? "Collapse" : "Expand"}
                  tone="ghost"
                  onClick={() => setExpanded(!expanded)}
                >
                  <MenuIcon className="size-4" />
                </ButtonIcon>
                <Button size="sm" className="[&_svg]:size-4">
                  <PencilIcon />
                  {expanded ? "New job" : null}
                </Button>
              </>
            }
          />
          <div className="flex-1 p-4 text-sm text-muted-foreground">
            {value}
          </div>
        </div>
      </RendersDemoCard>
    </>
  )
}

function RendersLiveNavigationDrawer() {
  const [value, setValue] = useState("inbox")

  return (
    <>
      <RendersDemoCard className="w-full max-w-xl p-0">
        <div className="flex overflow-hidden rounded-xl">
          <NavigationDrawer
            className="border-r border-border"
            title="Mail"
            sections={DRAWER_SECTIONS}
            value={value}
            onValueChange={setValue}
          />
          <div className="flex-1 p-4 text-sm text-muted-foreground">
            {value}
          </div>
        </div>
      </RendersDemoCard>
    </>
  )
}

function RendersAppBarActions() {
  return (
    <>
      <ButtonIcon label="Edit" tone="ghost">
        <PencilIcon className="size-4" />
      </ButtonIcon>
      <ButtonIcon label="More" tone="ghost">
        <MoreVerticalIcon className="size-4" />
      </ButtonIcon>
    </>
  )
}

function RendersLiveAppBar() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [variant, setVariant] = useState<"medium" | "large">("large")

  return (
    <>
      <RendersDemoCard
        label="flexible — scroll to collapse"
        className="w-full max-w-md"
      >
        <Select
          value={variant}
          onValueChange={(next) => setVariant(next as "medium" | "large")}
          options={[
            { value: "medium", label: "Medium" },
            { value: "large", label: "Large" },
          ]}
        />
        <div className="flex h-80 w-full flex-col overflow-hidden rounded-xl border border-border">
          <AppBar
            variant={variant}
            title="Jobs"
            subtitle="12 open this week"
            scrollRef={scrollRef}
            leading={
              <ButtonIcon label="Back" tone="ghost">
                <ArrowLeftIcon className="size-4" />
              </ButtonIcon>
            }
            actions={<RendersAppBarActions />}
          />
          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            <div className="flex flex-col gap-2 p-4">
              {Array.from({ length: 16 }, (_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          </div>
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="small" className="w-full max-w-md">
        <div className="flex w-full flex-col gap-2">
          <AppBar
            className="rounded-xl border border-border"
            title="Schedule"
            leading={
              <ButtonIcon label="Menu" tone="ghost">
                <MenuIcon className="size-4" />
              </ButtonIcon>
            }
            actions={<RendersAppBarActions />}
          />
          <AppBar
            className="rounded-xl border border-border"
            align="center"
            title="Schedule"
            subtitle="Week 40"
            scrolled
            leading={
              <ButtonIcon label="Back" tone="ghost">
                <ArrowLeftIcon className="size-4" />
              </ButtonIcon>
            }
            actions={<RendersAppBarActions />}
          />
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="search" className="w-full max-w-md">
        <AppBar
          className="rounded-xl border border-border"
          variant="search"
          leading={
            <ButtonIcon label="Menu" tone="ghost">
              <MenuIcon className="size-4" />
            </ButtonIcon>
          }
          search={
            <AppBarSearch
              placeholder="Search jobs"
              trailing={
                <ButtonIcon
                  label="Voice search"
                  tone="ghost"
                  className="rounded-full"
                >
                  <MicIcon className="size-4" />
                </ButtonIcon>
              }
            />
          }
        />
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
        <RendersDemoCard label="Snackbar">
          <ToastButton variant="snackbar" message="Timesheet archived.">
            Show snackbar
          </ToastButton>
        </RendersDemoCard>
        <RendersDemoCard label="Snackbar · action">
          <ToastButton
            variant="snackbar"
            message="Timesheet archived."
            action={{ label: "Undo" }}
            dismissible
          >
            Show with action
          </ToastButton>
        </RendersDemoCard>
        <RendersDemoCard label="Snackbar · stacked">
          <ToastButton
            variant="snackbar"
            message="Hours could not sync. Your changes are saved on this device and will retry when you're back online."
            action={{ label: "Retry now" }}
            stackAction
          >
            Show stacked
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
            <Select
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

  if (pieceName === "App Bar") {
    return <RendersLiveAppBar />
  }

  if (pieceName === "Navigation Bar") {
    return <RendersLiveNavigationBar />
  }

  if (pieceName === "Navigation Rail") {
    return <RendersLiveNavigationRail />
  }

  if (pieceName === "Navigation Drawer") {
    return <RendersLiveNavigationDrawer />
  }

  if (pieceName === "Navigation Menu") {
    return <RendersLiveTabs />
  }

  if (pieceName === "Blur Overlay") {
    return <RendersNotBuiltDemo pieceName={pieceName} />
  }

  return <RendersNotBuiltDemo pieceName={pieceName} />
}
