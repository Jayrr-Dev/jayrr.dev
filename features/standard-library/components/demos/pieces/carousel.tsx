"use client"

import { Carousel } from "@/components/standard/carousel"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersCarouselDemo() {
  return (
    <>
      <RendersDemoCard className="w-full max-w-xl" label="Carousel">
        <Carousel slides={["Hours", "Cost", "Crew"]} />
      </RendersDemoCard>
      <RendersDemoCard
        className="w-full max-w-xl"
        label='variant "multi-browse"'
      >
        <Carousel
          variant="multi-browse"
          slides={["Family", "Festivals", "Plants", "Travel", "Food", "Pets"]}
        />
      </RendersDemoCard>
    </>
  )
}
