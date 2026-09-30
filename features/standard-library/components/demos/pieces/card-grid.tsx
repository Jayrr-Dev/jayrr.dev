"use client"

import { useState, type ReactNode } from "react"
import {
  BellIcon,
  BluetoothIcon,
  CalendarIcon,
  CloudIcon,
  CpuIcon,
  GlobeIcon,
  HardDriveIcon,
  HeadphonesIcon,
  MailIcon,
  MessageCircleIcon,
  MonitorIcon,
  ShieldCheckIcon,
  ShieldAlertIcon,
  SunIcon,
  UsbIcon,
  UsersIcon,
  VolumeIcon,
  WifiIcon,
  ZapIcon,
} from "lucide-react"

import { Avatar } from "@/components/standard/avatar"
import {
  CardGrid,
  CardGridItem,
  type CardGridEntry,
} from "@/components/standard/card-grid"
import { NotificationBadge } from "@/components/standard/notification-badge"

const trayItems: CardGridEntry[] = [
  { id: "sun", label: "Night light", icon: <SunIcon /> },
  { id: "chat", label: "Messages", icon: <MessageCircleIcon className="text-success" /> },
  { id: "shield", label: "Security", icon: <ShieldCheckIcon className="text-info" /> },
  { id: "cloud", label: "Cloud sync", icon: <CloudIcon className="text-info" /> },
  { id: "gpu", label: "Graphics", icon: <CpuIcon /> },
  { id: "net", label: "Network", icon: <WifiIcon /> },
  { id: "globe", label: "Browser", icon: <GlobeIcon className="text-info" /> },
  { id: "audio", label: "Audio", icon: <HeadphonesIcon /> },
  { id: "volume", label: "Volume mixer", icon: <VolumeIcon /> },
  { id: "power", label: "Power", icon: <ZapIcon className="text-warning" /> },
  { id: "team", label: "Team chat", icon: <UsersIcon /> },
  { id: "bt", label: "Bluetooth", icon: <BluetoothIcon className="text-info" /> },
  { id: "usb", label: "Safely remove hardware", icon: <UsbIcon /> },
  { id: "warn", label: "Security warning", icon: <ShieldAlertIcon className="text-warning" /> },
  { id: "display", label: "Display", icon: <MonitorIcon /> },
  { id: "disk", label: "Storage", icon: <HardDriveIcon className="text-destructive" />, disabled: true },
]

const people = [
  { id: "ada", name: "Ada Lovelace", initials: "AL", status: "online" },
  { id: "alan", name: "Alan Turing", initials: "AT", status: "away" },
  { id: "grace", name: "Grace Hopper", initials: "GH", status: "busy" },
  { id: "linus", name: "Linus Torvalds", initials: "LT", status: "offline" },
  { id: "margaret", name: "Margaret Hamilton", initials: "MH", status: "online" },
  { id: "dennis", name: "Dennis Ritchie", initials: "DR", status: "offline" },
] as const

const swatches = [
  { id: "slate", label: "Slate", color: "oklch(0.55 0.03 260)" },
  { id: "red", label: "Red", color: "oklch(0.63 0.22 25)" },
  { id: "amber", label: "Amber", color: "oklch(0.77 0.16 70)" },
  { id: "lime", label: "Lime", color: "oklch(0.8 0.18 130)" },
  { id: "emerald", label: "Emerald", color: "oklch(0.7 0.15 162)" },
  { id: "sky", label: "Sky", color: "oklch(0.7 0.14 235)" },
  { id: "violet", label: "Violet", color: "oklch(0.6 0.22 293)" },
  { id: "pink", label: "Pink", color: "oklch(0.68 0.21 355)" },
]

const emoji = [
  { id: "thumbs", label: "Thumbs up", char: "\u{1F44D}" },
  { id: "heart", label: "Heart", char: "\u{2764}\u{FE0F}" },
  { id: "laugh", label: "Laughing", char: "\u{1F602}" },
  { id: "wow", label: "Surprised", char: "\u{1F62E}" },
  { id: "party", label: "Party", char: "\u{1F389}" },
  { id: "eyes", label: "Eyes", char: "\u{1F440}" },
  { id: "fire", label: "Fire", char: "\u{1F525}" },
  { id: "rocket", label: "Rocket", char: "\u{1F680}" },
]

function Example({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <figure className="flex flex-col items-center gap-2">
      {children}
      <figcaption className="text-xs text-muted-foreground">{title}</figcaption>
    </figure>
  )
}

// Counts go in the tile's label too: the badge itself is hidden inside it.
function BadgedTray() {
  return (
    <CardGrid columns={3} size="lg">
      <CardGridItem label="Mail, 3 unread">
        <NotificationBadge count={3}>
          <MailIcon className="size-6" />
        </NotificationBadge>
      </CardGridItem>
      <CardGridItem label="Calendar, new">
        <NotificationBadge tone="default">
          <CalendarIcon className="size-6 text-info" />
        </NotificationBadge>
      </CardGridItem>
      <CardGridItem label="Alerts, 120 unread">
        <NotificationBadge count={120}>
          <BellIcon className="size-6 text-warning" />
        </NotificationBadge>
      </CardGridItem>
    </CardGrid>
  )
}

function PeopleGrid() {
  return (
    <CardGrid columns={3} size="lg">
      {people.map((person) => (
        <CardGridItem
          key={person.id}
          label={`${person.name}, ${person.status}`}
        >
          <Avatar size="sm" fallback={person.initials} status={person.status} />
        </CardGridItem>
      ))}
    </CardGrid>
  )
}

function SwatchPicker() {
  const [value, setValue] = useState("sky")

  return (
    <CardGrid columns={4} appearance="outline">
      {swatches.map((swatch) => (
        <CardGridItem
          key={swatch.id}
          label={swatch.label}
          selected={value === swatch.id}
          onSelect={() => setValue(swatch.id)}
        >
          <span
            className="size-6 rounded-full"
            style={{ background: swatch.color }}
          />
        </CardGridItem>
      ))}
    </CardGrid>
  )
}

function EmojiPicker() {
  return (
    <CardGrid columns={4} appearance="elevated">
      {emoji.map((item) => (
        <CardGridItem key={item.id} label={item.label}>
          {item.char}
        </CardGridItem>
      ))}
    </CardGrid>
  )
}

export function RendersCardGridDemo() {
  return (
    <div className="flex flex-col items-center gap-10">
      <div className="flex flex-wrap items-start justify-center gap-6">
        <CardGrid size="sm" columns={4} items={trayItems.slice(0, 8)} />
        <CardGrid appearance="elevated" columns={5} items={trayItems} />
        <CardGrid size="lg" appearance="muted" columns={3} items={trayItems.slice(0, 9)} />
      </div>
      <div className="flex flex-wrap items-start justify-center gap-8">
        <Example title="Notification badges">
          <BadgedTray />
        </Example>
        <Example title="Avatars with presence">
          <PeopleGrid />
        </Example>
        <Example title="Color picker">
          <SwatchPicker />
        </Example>
        <Example title="Emoji">
          <EmojiPicker />
        </Example>
      </div>
    </div>
  )
}
