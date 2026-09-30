"use client"

import { Accordion } from "@/components/standard/accordion"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersAccordionDemo() {
  return (
    <>
      <RendersDemoCard>
        <Accordion
          items={[
            { id: "one", title: "Hours", body: "Billable vs non-billable." },
            { id: "two", title: "Cost", body: "Labor and equipment." },
          ]}
        />
      </RendersDemoCard>
      <RendersDemoCard label="one item">
        <Accordion
          items={[
            {
              id: "faq",
              title: "What is this?",
              body: "A collapsible panel.",
            },
          ]}
        />
      </RendersDemoCard>
    </>
  )
}
