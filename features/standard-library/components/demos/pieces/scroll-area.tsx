"use client"

import { ScrollArea } from "@/components/standard/scroll-area"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersScrollAreaDemo() {
  return (
    <>
      <RendersDemoCard className="w-full max-w-xl" label="Scroll area">
        <ScrollArea>
          <p>Week 1 hours</p>
          <p>Week 2 hours</p>
          <p>Week 3 hours</p>
          <p>Week 4 hours</p>
        </ScrollArea>
      </RendersDemoCard>
      <RendersDemoCard className="w-full max-w-xl" label="Scroll area · arrows">
        <ScrollArea showArrows>
          <p>Week 1 hours</p>
          <p>Week 2 hours</p>
          <p>Week 3 hours</p>
          <p>Week 4 hours</p>
          <p>Week 5 hours</p>
          <p>Week 6 hours</p>
          <p>Week 7 hours</p>
          <p>Week 8 hours</p>
        </ScrollArea>
      </RendersDemoCard>
    </>
  )
}
