"use client"

import { ScrollArea } from "@/components/standard/scroll-area"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const weeks = Array.from({ length: 10 }, (_, index) => `Week ${index + 1} hours`)

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
      <RendersDemoCard className="w-full max-w-xl" label="scrollbar thin">
        <ScrollArea scrollbar="thin">
          {weeks.map((week) => (
            <p key={week}>{week}</p>
          ))}
        </ScrollArea>
      </RendersDemoCard>
      <RendersDemoCard className="w-full max-w-xl" label="class scrollbar-thin">
        <div className="scrollbar-thin h-28 w-full overflow-auto rounded-lg border border-border p-2 text-sm">
          {weeks.map((week) => (
            <p key={week}>{week}</p>
          ))}
        </div>
      </RendersDemoCard>
      <RendersDemoCard className="w-full max-w-xl" label="scrollbar hidden">
        <ScrollArea scrollbar="hidden">
          {weeks.map((week) => (
            <p key={week}>{week}</p>
          ))}
        </ScrollArea>
      </RendersDemoCard>
      <RendersDemoCard className="w-full max-w-xl" label="fade">
        <ScrollArea fade className="h-28">
          {weeks.map((week) => (
            <p key={week}>{week}</p>
          ))}
        </ScrollArea>
      </RendersDemoCard>
      <RendersDemoCard className="w-full max-w-xl" label="maxHeight 160">
        <ScrollArea maxHeight={160} scrollbar="thin">
          {weeks.map((week) => (
            <p key={week}>{week}</p>
          ))}
        </ScrollArea>
      </RendersDemoCard>
    </>
  )
}
