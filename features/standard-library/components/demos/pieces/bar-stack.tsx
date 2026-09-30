"use client"

import { BarStack } from "@/components/standard/bar-stack"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersBarStackDemo() {
  return (
    <>
      <RendersDemoCard>
        <BarStack
          className="w-full"
          segments={[
            { id: "a", value: 40, className: "bg-primary" },
            { id: "b", value: 25, className: "bg-muted-foreground/50" },
            { id: "c", value: 15, className: "bg-destructive" },
          ]}
        />
      </RendersDemoCard>
      <RendersDemoCard label="two segments">
        <BarStack
          className="w-full"
          segments={[
            { id: "billable", value: 8, className: "bg-primary" },
            { id: "other", value: 2, className: "bg-muted-foreground/40" },
          ]}
        />
      </RendersDemoCard>
    </>
  )
}
