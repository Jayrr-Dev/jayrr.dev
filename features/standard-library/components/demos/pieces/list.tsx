"use client"

import {
  BellIcon,
  BluetoothIcon,
  CameraIcon,
  CloudIcon,
  CompassIcon,
  FileTextIcon,
  FolderIcon,
  HashIcon,
  HouseIcon,
  ImageIcon,
  LockIcon,
  MessageCircleIcon,
  NewspaperIcon,
  PaletteIcon,
  PlusIcon,
  ScissorsIcon,
  SparklesIcon,
  StarIcon,
  TrendingUpIcon,
  UserIcon,
  ChevronRightIcon,
} from "lucide-react"
import type * as React from "react"

import { Bar } from "@/components/standard/bar"
import {
  List,
  ListItem,
  ListSection,
  ListSeparator,
  type ListEntry,
} from "@/components/standard/list"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

/** A rounded colour tile standing in for an app icon. */
function RendersAppTile({
  className,
  children,
}: {
  className: string
  children: React.ReactNode
}) {
  return (
    <span
      className={`inline-flex size-6 items-center justify-center rounded-md text-white [&_svg]:size-3.5 ${className}`}
    >
      {children}
    </span>
  )
}

const RECENT: ListEntry[] = [
  {
    id: "snip",
    label: "Snipping Tool",
    icon: (
      <RendersAppTile className="bg-sky-500">
        <ScissorsIcon />
      </RendersAppTile>
    ),
  },
  {
    id: "claude",
    label: "Claude",
    icon: (
      <RendersAppTile className="bg-orange-500">
        <SparklesIcon />
      </RendersAppTile>
    ),
  },
  {
    id: "discord",
    label: "Discord",
    icon: (
      <RendersAppTile className="rounded-full bg-indigo-500">
        <MessageCircleIcon />
      </RendersAppTile>
    ),
  },
  {
    id: "bluetooth",
    label: "Bluetooth and other devices settings",
    icon: (
      <RendersAppTile className="bg-zinc-600">
        <BluetoothIcon />
      </RendersAppTile>
    ),
  },
  {
    id: "onedrive",
    label: "OneDrive",
    icon: (
      <RendersAppTile className="bg-blue-600">
        <CloudIcon />
      </RendersAppTile>
    ),
  },
]

const folder = <FolderIcon className="fill-amber-400/80 text-amber-500" />

const FOLDERS: ListEntry[] = [
  {
    id: "gallery",
    label: "Gallery",
    icon: <ImageIcon className="text-sky-500" />,
  },
  {
    id: "personal",
    label: "Personal cloud",
    icon: <CloudIcon className="text-sky-500" />,
    defaultOpen: true,
    items: [
      {
        id: "apps",
        label: "Apps",
        icon: folder,
        items: [{ id: "a1", label: "Installers", icon: folder }],
      },
      { id: "desktop", label: "Desktop", icon: folder },
      {
        id: "drawings",
        label: "Drawings",
        icon: folder,
        defaultOpen: true,
        items: [
          {
            id: "library",
            label: "library",
            icon: folder,
            items: [
              { id: "shapes", label: "shapes.lib", icon: <FileTextIcon /> },
            ],
          },
          { id: "sketch", label: "sketch.draw", icon: <FileTextIcon /> },
        ],
      },
      {
        id: "pictures",
        label: "Pictures",
        icon: <ImageIcon className="text-sky-500" />,
      },
      {
        id: "projects",
        label: "Projects",
        icon: folder,
        items: [{ id: "p1", label: "jayrr.dev", icon: folder }],
      },
      { id: "archive", label: "Ω Archive", icon: folder },
    ],
  },
]

const NAV: ListEntry[] = [
  { id: "home", value: "home", label: "Home", icon: <HouseIcon /> },
  {
    id: "popular",
    value: "popular",
    label: "Popular",
    icon: <TrendingUpIcon />,
  },
  { id: "news", value: "news", label: "News", icon: <NewspaperIcon /> },
  { id: "explore", value: "explore", label: "Explore", icon: <CompassIcon /> },
  { type: "separator", id: "sep" },
  { id: "start", label: "Start a community", icon: <PlusIcon /> },
]

const count = (n: number) => (
  <span className="text-xs text-muted-foreground tabular-nums">{n}</span>
)

export function RendersListDemo() {
  return (
    <>
      <RendersDemoCard label="launcher · title">
        <List title="Recent" size="lg" items={RECENT} className="max-w-80" />
      </RendersDemoCard>

      <RendersDemoCard label="tree · nested folders">
        <List tone="ghost" tree items={FOLDERS} className="max-w-72" />
      </RendersDemoCard>

      <RendersDemoCard label="nav · selectable (click a row)">
        <List
          tone="ghost"
          size="lg"
          defaultValue="home"
          items={NAV}
          className="max-w-64"
        />
      </RendersDemoCard>

      <RendersDemoCard label="sections · collapsible">
        <List className="max-w-72" defaultValue="design">
          <ListSection label="Favorites" trailing={count(2)}>
            <ListItem value="inbox" icon={<StarIcon />} label="Starred" />
            <ListItem
              value="mentions"
              icon={<BellIcon />}
              label="Mentions"
              trailing={count(4)}
            />
          </ListSection>
          <ListSection label="Channels" collapsible>
            <ListItem value="general" icon={<HashIcon />} label="general" />
            <ListItem value="design" icon={<HashIcon />} label="design" />
            <ListItem
              value="launch"
              icon={<HashIcon />}
              label="launch"
              trailing={count(12)}
            />
          </ListSection>
          <ListSection label="Archived" collapsible defaultOpen={false}>
            <ListItem value="old" icon={<HashIcon />} label="q2-planning" />
          </ListSection>
        </List>
      </RendersDemoCard>

      <RendersDemoCard label="description · divided · links">
        <List divided title="Settings" className="max-w-80">
          {[
            {
              icon: <UserIcon />,
              label: "Account",
              description: "Name, email and photo",
            },
            {
              icon: <LockIcon />,
              label: "Privacy",
              description: "Who can see your activity",
            },
            {
              icon: <PaletteIcon />,
              label: "Appearance",
              description: "Theme, density and font",
            },
            {
              icon: <BellIcon />,
              label: "Notifications",
              description: "Email and push",
            },
          ].map((row) => (
            <ListItem
              key={row.label}
              href="#list"
              {...row}
              trailing={<ChevronRightIcon className="text-muted-foreground" />}
            />
          ))}
        </List>
      </RendersDemoCard>

      <RendersDemoCard label="header trailing · footer">
        <List
          title="Files"
          leading={<FolderIcon className="size-4" />}
          trailing={
            <a href="#list" className="hover:text-foreground hover:underline">
              See all
            </a>
          }
          footer={
            <Bar icon={<PlusIcon />} label="New file" shortcut="Ctrl+N" />
          }
          className="max-w-80"
        >
          <ListItem
            icon={<FileTextIcon />}
            label="Brief.md"
            shortcut="2m ago"
          />
          <ListItem icon={<ImageIcon />} label="hero.png" shortcut="1h ago" />
          <ListItem
            icon={<CameraIcon />}
            label="shoot-04.raw"
            shortcut="Yesterday"
          />
        </List>
      </RendersDemoCard>

      <RendersDemoCard label="tone">
        <div className="grid w-full grid-cols-2 gap-3">
          {(["default", "quiet", "outline", "ghost"] as const).map((tone) => (
            <List key={tone} tone={tone} title={tone} size="sm">
              <ListItem icon={<HouseIcon />} label="Home" active />
              <ListItem icon={<CompassIcon />} label="Explore" />
            </List>
          ))}
        </div>
      </RendersDemoCard>

      <RendersDemoCard label="size">
        <div className="flex w-full max-w-64 flex-col gap-3">
          {(["sm", "default", "lg"] as const).map((size) => (
            <List key={size} size={size} tone="outline">
              <ListItem icon={<HouseIcon />} label={size} />
              <ListItem icon={<FolderIcon />} label="Folder">
                <ListItem icon={<FileTextIcon />} label="File" />
              </ListItem>
            </List>
          ))}
        </div>
      </RendersDemoCard>

      <RendersDemoCard label="composed · separator · disabled">
        <List className="max-w-64" tone="quiet">
          <ListItem icon={<FileTextIcon />} label="Rename" shortcut="F2" />
          <ListItem icon={<FolderIcon />} label="Move to…" />
          <ListSeparator />
          <ListItem icon={<LockIcon />} label="Lock (admins only)" disabled />
        </List>
      </RendersDemoCard>
    </>
  )
}
