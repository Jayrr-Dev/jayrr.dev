"use client"

import * as React from "react"

import { Button } from "@/components/standard/button"
import { Dialog } from "@/components/standard/dialog"

function TabbedDialog({
  title,
  tabs,
  trigger = "Open tabs",
}: {
  title: string
  tabs: { id: string; label: string; body: string }[]
  trigger?: string
}) {
  const [active, setActive] = React.useState(tabs[0]?.id)

  return (
    <Dialog title={title} trigger={trigger}>
      <div data-slot="tabbed-dialog" className="flex flex-col gap-2">
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const tone = tab.id === active ? "default" : "outline"

            return (
              <Button
                key={tab.id}
                size="sm"
                tone={tone}
                onClick={() => setActive(tab.id)}
              >
                {tab.label}
              </Button>
            )
          })}
        </div>
        {tabs.map((tab) => {
          if (tab.id !== active) {
            return null
          }
          return (
            <p key={tab.id} className="text-sm text-muted-foreground">
              {tab.body}
            </p>
          )
        })}
      </div>
    </Dialog>
  )
}

export { TabbedDialog }
