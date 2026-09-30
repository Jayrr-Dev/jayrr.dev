"use client"

import { useState } from "react"
import {
  BellIcon,
  InboxIcon,
  MailIcon,
  MessageSquareIcon,
  SquarePlayIcon,
  TriangleIcon,
  UsersIcon,
} from "lucide-react"

import { Button } from "@/components/standard/button"
import { NotificationBadge } from "@/components/standard/notification-badge"
import { Stack } from "@/components/standard/stack"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const NAV_ITEMS: {
  id: string
  label: string
  icon: typeof MailIcon
  count?: number
}[] = [
  { id: "mail", label: "Mail", icon: MailIcon, count: 1284 },
  { id: "chat", label: "Chat", icon: MessageSquareIcon, count: 10 },
  { id: "rooms", label: "Rooms", icon: UsersIcon, count: undefined },
  { id: "meet", label: "Meet", icon: SquarePlayIcon, count: 3 },
]

function RendersLiveNavBadges() {
  const [active, setActive] = useState("mail")
  const [read, setRead] = useState<string[]>([])

  return (
    <RendersDemoCard label="Navigation bar (click to mark read)">
      <nav
        aria-label="Apps"
        className="flex w-full max-w-md justify-around rounded-xl bg-muted/60 p-2"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const unread = !read.includes(item.id)
          const isActive = active === item.id

          return (
            <button
              key={item.id}
              type="button"
              aria-current={isActive ? "page" : undefined}
              onClick={() => {
                setActive(item.id)
                setRead((current) => [...current, item.id])
              }}
              className="flex flex-col items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <span
                className={
                  isActive
                    ? "grid h-8 w-14 place-items-center rounded-full bg-primary/10"
                    : "grid h-8 w-14 place-items-center rounded-full"
                }
              >
                {unread ? (
                  <NotificationBadge count={item.count} max={999}>
                    <Icon className="size-5" />
                  </NotificationBadge>
                ) : (
                  <Icon className="size-5" />
                )}
              </span>
              {item.label}
            </button>
          )
        })}
      </nav>
    </RendersDemoCard>
  )
}

function RendersNotificationBadgeDemos() {
  return (
    <>
      <RendersLiveNavBadges />
      <RendersDemoCard label="Dot, count, max">
        <Stack direction="row" align="center" className="gap-10">
          <NotificationBadge>
            <TriangleIcon className="size-5" />
          </NotificationBadge>
          <NotificationBadge count={1}>
            <TriangleIcon className="size-5" />
          </NotificationBadge>
          <NotificationBadge count={1500} max={999}>
            <TriangleIcon className="size-5" />
          </NotificationBadge>
        </Stack>
      </RendersDemoCard>
      <RendersDemoCard label="Inline in a list">
        <div className="flex w-56 flex-col gap-1 text-sm">
          <span className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted">
            Inbox
            <NotificationBadge count={24} />
          </span>
          <span className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted">
            Mentions
            <NotificationBadge />
          </span>
          <span className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted">
            Archive
            <NotificationBadge count={0} />
          </span>
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="Zero: hidden vs showZero">
        <Stack direction="row" align="center" className="gap-6">
          <NotificationBadge count={0}>
            <BellIcon className="size-5" />
          </NotificationBadge>
          <NotificationBadge count={0} showZero tone="quiet">
            <BellIcon className="size-5" />
          </NotificationBadge>
        </Stack>
      </RendersDemoCard>
    </>
  )
}

export function RendersNotificationBadgeDemo() {
  return (
    <>
      <RendersNotificationBadgeDemos />
      <RendersDemoCard label="tone danger, default, quiet">
        <Stack direction="row" align="center" className="gap-6">
          <NotificationBadge count={3} tone="danger">
            <BellIcon className="size-5" />
          </NotificationBadge>
          <NotificationBadge count={3} tone="default">
            <BellIcon className="size-5" />
          </NotificationBadge>
          <NotificationBadge count={3} tone="quiet">
            <BellIcon className="size-5" />
          </NotificationBadge>
        </Stack>
      </RendersDemoCard>
      <RendersDemoCard label="size inline">
        <Stack direction="row" align="center" className="gap-4">
          <Button tone="outline" size="sm">
            Inbox
            <NotificationBadge size="inline" count={8} />
          </Button>
          <span className="inline-flex items-center gap-1.5 text-lg">
            Mentions
            <NotificationBadge size="inline" count={2} tone="default" />
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm">
            Updates
            <NotificationBadge size="inline" dot />
          </span>
        </Stack>
      </RendersDemoCard>
      <RendersDemoCard label="size sm">
        <Stack direction="row" align="center" className="gap-6">
          <NotificationBadge size="sm" count={7}>
            <MailIcon className="size-4" />
          </NotificationBadge>
          <NotificationBadge size="sm">
            <MailIcon className="size-4" />
          </NotificationBadge>
        </Stack>
      </RendersDemoCard>
      <RendersDemoCard label="placement top-start, bottom-end, bottom-start">
        <Stack direction="row" align="center" className="gap-8">
          <NotificationBadge count={2} placement="top-start">
            <InboxIcon className="size-5" />
          </NotificationBadge>
          <NotificationBadge count={2} placement="bottom-end">
            <InboxIcon className="size-5" />
          </NotificationBadge>
          <NotificationBadge count={2} placement="bottom-start">
            <InboxIcon className="size-5" />
          </NotificationBadge>
          <NotificationBadge placement="bottom-start">
            <InboxIcon className="size-5" />
          </NotificationBadge>
        </Stack>
      </RendersDemoCard>
      <RendersDemoCard label="pulse">
        <Stack direction="row" align="center" className="gap-6">
          <NotificationBadge pulse>
            <BellIcon className="size-5" />
          </NotificationBadge>
          <NotificationBadge pulse count={1}>
            <MessageSquareIcon className="size-5" />
          </NotificationBadge>
        </Stack>
      </RendersDemoCard>
      <RendersDemoCard label="ring off">
        <Stack direction="row" align="center" className="gap-6">
          <NotificationBadge count={4} ring={false}>
            <Button iconOnly aria-label="Notifications, 4 unread" tone="outline">
              <BellIcon className="size-4" />
            </Button>
          </NotificationBadge>
          <NotificationBadge count={4}>
            <Button iconOnly aria-label="Notifications, 4 unread" tone="outline">
              <BellIcon className="size-4" />
            </Button>
          </NotificationBadge>
        </Stack>
      </RendersDemoCard>
    </>
  )
}
