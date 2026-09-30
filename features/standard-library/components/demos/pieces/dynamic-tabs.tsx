"use client"

import { useState } from "react"
import { FileTextIcon } from "lucide-react"

import {
  DynamicTabs,
  useDynamicTabs,
  type DynamicTabItem,
} from "@/components/standard/dynamic-tabs"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const createsSheet = (index: number): DynamicTabItem => ({
  id: `sheet-${index}`,
  label: `Sheet ${index}`,
})

const createsDoc = (index: number): DynamicTabItem => ({
  id: `doc-${index}`,
  label: `Untitled ${index}`,
  leading: <FileTextIcon className="size-3 text-muted-foreground" />,
})

function RendersLiveDynamicTabs() {
  const tabs = useDynamicTabs({
    initialItems: [
      { id: "groceries", label: "Groceries" },
      { id: "rent", label: "Rent" },
      { id: "travel", label: "Travel" },
    ],
    create: createsSheet,
  })
  const active = tabs.items.find((item) => item.id === tabs.value)

  return (
    <RendersDemoCard label="Add, close, rename" className="w-full max-w-md">
      <div className="min-w-0 overflow-hidden rounded-lg border border-border">
        <DynamicTabs {...tabs} aria-label="Sheets" addLabel="Add sheet">
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            {active?.label} panel
          </p>
        </DynamicTabs>
      </div>
    </RendersDemoCard>
  )
}

function RendersOverflowDynamicTabs() {
  const tabs = useDynamicTabs({
    initialItems: Array.from({ length: 9 }, (_, i) => createsDoc(i + 1)),
    create: createsDoc,
  })

  return (
    <RendersDemoCard
      label="Overflow scroll, size default"
      className="w-full max-w-sm"
    >
      <div className="min-w-0 overflow-hidden rounded-lg border border-border">
        <DynamicTabs {...tabs} size="default" aria-label="Documents" />
      </div>
    </RendersDemoCard>
  )
}

function RendersOverlayDynamicTabs() {
  const tabs = useDynamicTabs({
    initialItems: Array.from({ length: 9 }, (_, i) => createsDoc(i + 1)),
    create: createsDoc,
  })

  return (
    <RendersDemoCard
      label="Overlay arrows with fade"
      className="w-full max-w-sm"
    >
      <div className="min-w-0 overflow-hidden rounded-lg border border-border">
        <DynamicTabs {...tabs} scrollButtons="overlay" aria-label="Documents" />
      </div>
    </RendersDemoCard>
  )
}

function RendersPinnedDynamicTabs() {
  const [items, setItems] = useState<DynamicTabItem[]>([
    { id: "home", label: "Home", closable: false },
    { id: "a", label: "Report A" },
    { id: "b", label: "Report B" },
  ])

  return (
    <RendersDemoCard label="Pinned tab, no rename" className="w-full max-w-md">
      <div className="min-w-0 overflow-hidden rounded-lg border border-border">
        <DynamicTabs
          items={items}
          defaultValue="a"
          minTabs={0}
          aria-label="Reports"
          onClose={(id) =>
            setItems((previous) => previous.filter((item) => item.id !== id))
          }
        />
      </div>
    </RendersDemoCard>
  )
}

export function RendersDynamicTabsDemo() {
  return (
    <>
      <RendersLiveDynamicTabs />
      <RendersOverflowDynamicTabs />
      <RendersOverlayDynamicTabs />
      <RendersPinnedDynamicTabs />
    </>
  )
}
