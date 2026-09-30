"use client"

import { PopoverWizard } from "@/components/standard/popover-wizard"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const TOUR_STEPS = [
  {
    id: "search",
    title: "Search",
    subtitle: "Find any piece by name.",
    content: "Type in the box at the top. Results filter as you type.",
  },
  {
    id: "open",
    title: "Open a piece",
    subtitle: "Every card opens its demos.",
    content: "Click a card to see each variant side by side.",
  },
  {
    id: "copy",
    title: "Copy it",
    subtitle: "Install from the registry.",
    content: "Each piece has a shadcn add command you can paste.",
  },
]

export function RendersPopoverWizardDemo() {
  return (
    <>
      <RendersDemoCard label="Popover wizard · tour">
        <PopoverWizard trigger="Take the tour" steps={TOUR_STEPS} />
      </RendersDemoCard>
      <RendersDemoCard label="Popover wizard · jump from dots">
        <PopoverWizard
          trigger="Quick setup"
          steps={TOUR_STEPS}
          jumpFromDots
          width="sm"
        />
      </RendersDemoCard>
      <RendersDemoCard label="Popover wizard · count · custom labels">
        <PopoverWizard
          trigger="Walkthrough"
          steps={TOUR_STEPS}
          dots={false}
          showCount
          nextLabel={["Next", "Next", "Finish"]}
        />
      </RendersDemoCard>
      <RendersDemoCard label="Popover wizard · side right">
        <PopoverWizard
          trigger="Open to the side"
          steps={TOUR_STEPS}
          side="right"
          align="center"
          width="sm"
        />
      </RendersDemoCard>
    </>
  )
}
