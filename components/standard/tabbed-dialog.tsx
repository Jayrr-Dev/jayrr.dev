"use client"

import * as React from "react"

import { Dialog } from "@/components/standard/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

// Arrow keys move between tabs (roving focus) and each panel is linked to
// its tab, so the dialog reads as one tablist to screen readers.
function TabbedDialog({
  title,
  tabs,
  trigger = "Open tabs",
}: {
  title: string
  tabs: { id: string; label: string; body: React.ReactNode }[]
  trigger?: React.ReactNode
}) {
  return (
    <Dialog title={title} trigger={trigger}>
      <Tabs
        data-slot="tabbed-dialog"
        defaultValue={tabs[0]?.id}
        className="gap-2"
      >
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent
            key={tab.id}
            value={tab.id}
            className="text-muted-foreground"
          >
            {tab.body}
          </TabsContent>
        ))}
      </Tabs>
    </Dialog>
  )
}

export { TabbedDialog }
