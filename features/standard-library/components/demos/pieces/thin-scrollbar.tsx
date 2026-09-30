"use client"

import { ThinScrollbar } from "@/components/standard/scrollbar"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersThinScrollbarDemo() {
  return (
    <>
      <RendersDemoCard className="w-full max-w-xl" label="thin">
        <ThinScrollbar className="h-28 w-full">
          <p>Week 1 hours</p>
          <p>Week 2 hours</p>
          <p>Week 3 hours</p>
          <p>Week 4 hours</p>
          <p>Week 5 hours</p>
          <p>Week 6 hours</p>
          <p>Week 7 hours</p>
          <p>Week 8 hours</p>
        </ThinScrollbar>
      </RendersDemoCard>
      <RendersDemoCard label="class only">
        <div className="scrollbar-thin h-28 w-full overflow-auto rounded-lg border border-border p-2 text-sm">
          <p>Chip row</p>
          <p>Chip row</p>
          <p>Chip row</p>
          <p>Chip row</p>
          <p>Chip row</p>
          <p>Chip row</p>
        </div>
      </RendersDemoCard>
    </>
  )
}
