"use client"

import type * as React from "react"
import {
  CreditCardIcon,
  LifeBuoyIcon,
  PlusIcon,
  SlidersHorizontalIcon,
  TruckIcon,
} from "lucide-react"

import {
  Accordion,
  type AccordionChevron,
  type AccordionItem,
} from "@/components/standard/accordion"
import { Bar } from "@/components/standard/bar"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const FAQ: AccordionItem[] = [
  {
    id: "shipping",
    title: "Shipping",
    icon: <TruckIcon />,
    body: "Orders leave the warehouse within two working days.",
  },
  {
    id: "billing",
    title: "Billing",
    icon: <CreditCardIcon />,
    body: "Cards are charged when the order ships, not when it is placed.",
  },
  {
    id: "support",
    title: "Support",
    icon: <LifeBuoyIcon />,
    body: "Replies within a day, weekdays included.",
  },
]

const CHEVRONS: { chevron: AccordionChevron; label: string }[] = [
  { chevron: "end", label: "chevron · end" },
  { chevron: "start", label: "chevron · start" },
  { chevron: "inline", label: "chevron · inline" },
  { chevron: "icon", label: "chevron · icon (hover)" },
  { chevron: "none", label: "chevron · none" },
]

type Status = "active" | "running" | "waiting" | "idle"

const DOT: Record<Status, string> = {
  active: "bg-muted-foreground",
  running: "bg-blue-500",
  waiting: "bg-amber-500",
  idle: "border border-muted-foreground/60",
}

const PROJECTS: {
  id: string
  name: string
  open?: boolean
  sessions: { title: string; status: Status }[]
}[] = [
  {
    id: "jayrr",
    name: "jayrr.dev",
    open: true,
    sessions: [
      { title: "Spacing and alignment options", status: "active" },
      { title: "Data grid hide feature", status: "running" },
      { title: "Bar primitive with menu variants", status: "waiting" },
      { title: "Icon improvement", status: "idle" },
      { title: "Full space usage", status: "running" },
      { title: "Remove stack from UI layers", status: "idle" },
    ],
  },
  {
    id: "notes",
    name: "notes-app",
    sessions: [
      { title: "Sync conflicts", status: "idle" },
      { title: "Offline mode", status: "idle" },
    ],
  },
]

function StatusDot({ status }: { status: Status }) {
  return <span className={`size-1.5 rounded-full ${DOT[status]}`} />
}

function HeaderAction({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="grid size-6 place-items-center rounded-md text-muted-foreground hover:bg-background/60 hover:text-foreground [&_svg]:size-3.5"
      // Inside the header: act without toggling the section.
      onClick={(event) => event.preventDefault()}
    >
      {children}
    </button>
  )
}

/** Sidebar of projects: each header folds a list of Bar rows. */
function RendersSessionSidebarDemo() {
  return (
    <div className="w-72">
      <Accordion
        tone="plain"
        chevron="inline"
        items={PROJECTS.map((project) => ({
          id: project.id,
          title: project.name,
          defaultOpen: project.open,
          trailing: (
            <>
              <HeaderAction label={`New session in ${project.name}`}>
                <PlusIcon />
              </HeaderAction>
              <HeaderAction label={`Filter ${project.name}`}>
                <SlidersHorizontalIcon />
              </HeaderAction>
            </>
          ),
          body: (
            <div className="flex flex-col gap-0.5">
              {project.sessions.map((session, index) => (
                <Bar
                  key={session.title}
                  size="sm"
                  active={project.open && index === 0}
                  icon={<StatusDot status={session.status} />}
                  label={<span className="font-normal">{session.title}</span>}
                />
              ))}
            </div>
          ),
        }))}
      />
    </div>
  )
}

export function RendersAccordionDemo() {
  return (
    <>
      <RendersDemoCard>
        <Accordion
          items={[
            { id: "one", title: "Hours", body: "Billable vs non-billable." },
            { id: "two", title: "Cost", body: "Labor and equipment." },
          ]}
        />
      </RendersDemoCard>
      <RendersDemoCard label="one item">
        <Accordion
          items={[
            {
              id: "faq",
              title: "What is this?",
              body: "A collapsible panel.",
            },
          ]}
        />
      </RendersDemoCard>
      {CHEVRONS.map(({ chevron, label }) => (
        <RendersDemoCard key={chevron} label={label}>
          <Accordion chevron={chevron} items={FAQ} />
        </RendersDemoCard>
      ))}
      <RendersDemoCard label="single open">
        <Accordion single items={FAQ} />
      </RendersDemoCard>
      <RendersDemoCard label="plain tone · chevron start">
        <div className="w-64">
          <Accordion tone="plain" chevron="start" items={FAQ} />
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="bar + accordion" className="w-full">
        <RendersSessionSidebarDemo />
      </RendersDemoCard>
    </>
  )
}
