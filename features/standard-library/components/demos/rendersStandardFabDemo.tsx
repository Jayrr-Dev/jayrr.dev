"use client"

import { useRef } from "react"
import {
  CameraIcon,
  FileTextIcon,
  ListTodoIcon,
  MessageSquarePlusIcon,
  PencilIcon,
  PlusIcon,
  StickyNoteIcon,
} from "lucide-react"

import {
  Fab,
  FabMenu,
  FabStack,
  useFabScroll,
  type FabTone,
} from "@/components/standard/fab"
import { Stack } from "@/components/standard/stack"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const MENU_ITEMS = [
  { label: "Note", icon: <StickyNoteIcon /> },
  { label: "Task", icon: <ListTodoIcon /> },
  { label: "Document", icon: <FileTextIcon /> },
  { label: "Photo", icon: <CameraIcon /> },
]

const FAB_TONES: FabTone[] = ["primary", "secondary", "surface"]

function RendersFabScreen({
  children,
  className = "h-72",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl border border-border bg-background ${className}`}
    >
      <div className="flex flex-col gap-2 p-4">
        <div className="h-3 w-2/3 rounded-full bg-muted" />
        <div className="h-3 w-1/2 rounded-full bg-muted" />
        <div className="h-3 w-3/5 rounded-full bg-muted" />
      </div>
      {children}
    </div>
  )
}

function RendersFabMenuDemo() {
  return (
    <RendersDemoCard
      label="FAB menu · M3 expressive"
      className="w-full max-w-md"
    >
      <RendersFabScreen className="h-96">
        <FabStack anchor="container">
          <FabMenu label="Create" icon={<PlusIcon />} items={MENU_ITEMS} />
        </FabStack>
      </RendersFabScreen>
    </RendersDemoCard>
  )
}

function RendersFabScrollDemo() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { collapsed, hidden } = useFabScroll(scrollRef)

  return (
    <RendersDemoCard
      label="collapse + hide on scroll"
      className="w-full max-w-md"
    >
      <div className="relative h-72 w-full overflow-hidden rounded-xl border border-border bg-background">
        <div ref={scrollRef} className="h-full overflow-y-auto p-4">
          <div className="flex flex-col gap-3">
            {Array.from({ length: 24 }, (_, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="size-8 shrink-0 rounded-full bg-muted" />
                <div className="h-3 flex-1 rounded-full bg-muted" />
              </div>
            ))}
          </div>
        </div>
        <FabStack anchor="container" hidden={hidden}>
          <Fab
            label="New message"
            icon={<MessageSquarePlusIcon />}
            extended={!collapsed}
          />
        </FabStack>
      </div>
    </RendersDemoCard>
  )
}

function RendersUtilitekChromeDemo() {
  return (
    <RendersDemoCard
      label="compact stack · utilitek chrome"
      className="w-full max-w-md"
    >
      <RendersFabScreen>
        <FabStack anchor="container" className="gap-2">
          <Fab
            size="compact"
            tone="surface"
            label="Tasks"
            icon={<ListTodoIcon />}
            extended="hover"
            badge={3}
          />
          <Fab
            size="compact"
            tone="surface"
            label="Page draw"
            icon={<PencilIcon />}
            extended="hover"
          />
          <Fab
            size="compact"
            tone="surface"
            label="Restore invoice"
            icon={<FileTextIcon />}
            extended="hover"
          />
        </FabStack>
      </RendersFabScreen>
    </RendersDemoCard>
  )
}

export function RendersStandardFabDemo() {
  return (
    <>
      <RendersDemoCard label="sizes · compact, FAB, medium, large">
        <Stack direction="row" align="center" className="items-end gap-4">
          <Fab size="compact" label="Add" icon={<PlusIcon />} />
          <Fab label="Add" icon={<PlusIcon />} />
          <Fab size="medium" label="Add" icon={<PlusIcon />} />
          <Fab size="large" label="Add" icon={<PlusIcon />} />
        </Stack>
      </RendersDemoCard>
      <RendersDemoCard label="tones">
        <Stack direction="row" align="center" className="gap-4">
          {FAB_TONES.map((tone) => (
            <Fab
              key={tone}
              tone={tone}
              label={`Edit (${tone})`}
              icon={<PencilIcon />}
            />
          ))}
        </Stack>
      </RendersDemoCard>
      <RendersDemoCard label="extended">
        <div className="flex flex-col items-start gap-3">
          <Fab extended label="Compose" icon={<PencilIcon />} />
          <Fab
            extended
            size="medium"
            tone="secondary"
            label="Compose"
            icon={<PencilIcon />}
          />
          <Fab
            extended
            size="large"
            tone="surface"
            label="Compose"
            icon={<PencilIcon />}
          />
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="extended on hover">
        <Stack direction="row" align="center" className="gap-4">
          <Fab extended="hover" label="New task" icon={<ListTodoIcon />} />
          <Fab
            extended="hover"
            size="compact"
            tone="surface"
            label="New task"
            icon={<ListTodoIcon />}
          />
        </Stack>
      </RendersDemoCard>
      <RendersDemoCard label="badge · disabled">
        <Stack direction="row" align="center" className="gap-4">
          <Fab label="Tasks" icon={<ListTodoIcon />} badge={12} />
          <Fab label="Add" icon={<PlusIcon />} disabled />
        </Stack>
      </RendersDemoCard>
      <RendersFabMenuDemo />
      <RendersFabScrollDemo />
      <RendersUtilitekChromeDemo />
    </>
  )
}
