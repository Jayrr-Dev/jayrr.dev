"use client"

import * as React from "react"
import { cn } from "cn"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useControllableState } from "@/hooks/use-controllable-state"

/** @deprecated Use <Tabs> with <TabsList variant="line"> from components/ui/tabs */
function TabNavigation({
  className,
  items,
  value,
  defaultValue,
  onValueChange,
}: {
  className?: string
  items: { id: string; label: string }[]
  value?: string
  defaultValue?: string
  onValueChange?: (id: string) => void
}) {
  const [selected, setSelected] = useControllableState({
    value,
    defaultValue: defaultValue ?? items[0]?.id ?? "",
    onChange: onValueChange,
  })

  return (
    <Tabs
      data-slot="tab-navigation"
      value={selected}
      onValueChange={setSelected}
      className={cn("w-full", className)}
    >
      <TabsList variant="line">
        {items.map((item) => (
          <TabsTrigger key={item.id} value={item.id}>
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}

export { TabNavigation }
