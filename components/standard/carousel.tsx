"use client"

import * as React from "react"
import useEmblaCarousel from "embla-carousel-react"

import { Button } from "@/components/standard/button"

function Carousel({ slides }: { slides: string[] }) {
  const [ref, api] = useEmblaCarousel()
  const [index, setIndex] = React.useState(0)

  React.useEffect(() => {
    if (!api) {
      return
    }
    function sync() {
      setIndex(api?.selectedScrollSnap() ?? 0)
    }
    api.on("select", sync)
    return () => {
      api.off("select", sync)
    }
  }, [api])

  return (
    <div data-slot="carousel" className="flex w-full flex-col gap-2">
      <div ref={ref} className="overflow-hidden rounded-lg border border-border">
        <div className="flex">
          {slides.map((slide) => (
            <div
              key={slide}
              className="min-w-0 flex-[0_0_100%] px-3 py-6 text-center text-sm"
            >
              {slide}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Button tone="outline" size="sm" onClick={() => api?.scrollPrev()}>
          Prev
        </Button>
        <span className="text-xs text-muted-foreground">
          {index + 1} / {slides.length}
        </span>
        <Button tone="outline" size="sm" onClick={() => api?.scrollNext()}>
          Next
        </Button>
      </div>
    </div>
  )
}

export { Carousel }
