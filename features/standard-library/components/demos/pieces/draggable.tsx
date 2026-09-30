"use client"

import { useState } from "react"
import {
  FileTextIcon,
  ImageIcon,
  MailIcon,
  MessageSquareIcon,
  MusicIcon,
  SmartphoneIcon,
  VideoIcon,
} from "lucide-react"

import { Badge } from "@/components/standard/badge"
import {
  applyDraggableMove,
  Draggable,
  DraggableHandle,
  DraggableRoot,
} from "@/components/standard/draggable"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const FILES = [
  { id: "demo", title: "Product demo", note: "Main product image", kind: "image", icon: ImageIcon },
  { id: "spec", title: "Specification", note: "Technical details", kind: "document", icon: FileTextIcon },
  { id: "video", title: "Demo video", note: "How to use it", kind: "video", icon: VideoIcon },
  { id: "audio", title: "Audio guide", note: "Spoken walkthrough", kind: "audio", icon: MusicIcon },
]

const PEOPLE = [
  "Phillip George",
  "Jaylon Donin",
  "Tiana Curtis",
  "Zaire Vetrovs",
  "Kianna Philips",
  "Santino Pratt",
]

const CHANNELS = [
  { id: "email", title: "Email", note: "Send via email", icon: MailIcon },
  { id: "sms", title: "Text message", note: "SMS alerts", icon: SmartphoneIcon },
  { id: "chat", title: "Team chat", note: "Post to a channel", icon: MessageSquareIcon },
]

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
}

/** Whole rows drag; a grip is only decoration. */
function FilesList() {
  const [files, setFiles] = useState(FILES)

  return (
    <Draggable
      items={files}
      onItemsChange={setFiles}
      getId={(file) => file.id}
      getItemLabel={(file) => file.title}
      label="Files"
      className="w-full"
      itemClassName="rounded-lg border border-border bg-background px-3 py-2.5"
      renderItem={(file) => (
        <div className="flex items-center gap-3">
          <file.icon aria-hidden className="size-4 text-muted-foreground" />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium">{file.title}</span>
            <span className="truncate text-xs text-muted-foreground">{file.note}</span>
          </div>
          <Badge tone="outline" appearance="outline" size="sm">
            {file.kind}
          </Badge>
        </div>
      )}
    />
  )
}

/** Only the grip drags, so the row can hold other controls. */
function ChannelsList() {
  const [channels, setChannels] = useState(CHANNELS)

  return (
    <div className="flex w-full flex-col gap-2">
      <p className="text-xs text-muted-foreground">
        Drag to set priority. Top channels are tried first.
      </p>
      <Draggable
        items={channels}
        onItemsChange={setChannels}
        getId={(channel) => channel.id}
        getItemLabel={(channel) => channel.title}
        label="Notification priority"
        handle
        className="w-full gap-0 divide-y divide-border rounded-lg border border-border bg-background"
        itemClassName="bg-background px-2 py-2 first:rounded-t-lg last:rounded-b-lg"
        renderItem={(channel, { index }) => (
          <div className="flex items-center gap-2">
            <DraggableHandle className="size-7" />
            <span className="w-4 text-xs text-muted-foreground tabular-nums">
              {index + 1}
            </span>
            <channel.icon aria-hidden className="size-4" />
            <div className="flex min-w-0 flex-col">
              <span className="text-sm font-medium">{channel.title}</span>
              <span className="text-xs text-muted-foreground">{channel.note}</span>
            </div>
          </div>
        )}
      />
    </div>
  )
}

function PeopleRow() {
  const [people, setPeople] = useState(PEOPLE)

  return (
    <Draggable
      items={people}
      onItemsChange={setPeople}
      getId={(name) => name}
      getItemLabel={(name) => name}
      label="Team order"
      orientation="horizontal"
      className="w-full overflow-x-auto p-1 [scrollbar-width:none]"
      itemClassName="rounded-lg"
      renderItem={(name) => (
        <div className="flex w-16 flex-col items-center gap-1.5 p-1">
          <span className="flex size-10 items-center justify-center rounded-full bg-muted text-xs font-medium">
            {initials(name)}
          </span>
          <span className="w-full truncate text-center text-[11px]">{name}</span>
        </div>
      )}
    />
  )
}

function ChipGrid() {
  const [colors, setColors] = useState([
    "White",
    "Black",
    "Grey",
    "Green",
    "Blue",
    "Red",
    "Orange",
  ])

  return (
    <Draggable
      items={colors}
      onItemsChange={setColors}
      getId={(color) => color}
      getItemLabel={(color) => color}
      label="Colors"
      orientation="grid"
      itemClassName="rounded-full"
      renderItem={(color) => (
        <Badge tone="quiet" appearance="soft" size="lg">
          {color}
        </Badge>
      )}
    />
  )
}

/** Two lists in one root, so items cross between them. */
function TwoLists() {
  const [lists, setLists] = useState<Record<string, string[]>>({
    pending: ["Design new logo", "Finalize budget", "Schedule team meeting"],
    done: ["Launch website", "Quarterly report"],
  })

  const column = (id: string, title: string) => (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <span className="text-xs font-medium text-muted-foreground">{title}</span>
      <Draggable
        listId={id}
        label={title}
        items={lists[id]}
        getId={(task) => task}
        getItemLabel={(task) => task}
        className="min-h-24 rounded-lg border border-dashed border-border p-2 data-[over]:border-primary/50"
        itemClassName="rounded-md border border-border bg-background px-2.5 py-2 text-sm"
        empty={<span className="text-xs text-muted-foreground">Nothing here</span>}
        renderItem={(task) => task}
      />
    </div>
  )

  return (
    <DraggableRoot onMove={(move) => setLists((current) => applyDraggableMove(current, move))}>
      <div className="flex w-full gap-3">
        {column("pending", "Pending")}
        {column("done", "Completed")}
      </div>
    </DraggableRoot>
  )
}

export function RendersDraggableDemo() {
  return (
    <>
      <RendersDemoCard label="vertical · whole row" className="w-full max-w-xl">
        <FilesList />
      </RendersDemoCard>
      <RendersDemoCard label="handle · priority" className="w-full max-w-xl">
        <ChannelsList />
      </RendersDemoCard>
      <RendersDemoCard label="horizontal" className="w-full max-w-xl">
        <PeopleRow />
      </RendersDemoCard>
      <RendersDemoCard label="grid · chips" className="w-full max-w-xl">
        <ChipGrid />
      </RendersDemoCard>
      <RendersDemoCard label="between lists" className="w-full max-w-xl">
        <TwoLists />
      </RendersDemoCard>
    </>
  )
}
