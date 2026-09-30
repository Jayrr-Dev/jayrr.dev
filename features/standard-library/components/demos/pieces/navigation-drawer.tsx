"use client"

import { useState } from "react"
import {
  BellIcon,
  InboxIcon,
  SendIcon,
  SettingsIcon,
  StarIcon,
} from "lucide-react"

import {
  NavigationDrawer,
  type NavigationDrawerSection,
} from "@/components/standard/navigation"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

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

export function RendersNavigationDrawerDemo() {
  return <RendersLiveNavigationDrawer />
}
