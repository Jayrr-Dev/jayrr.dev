"use client"

import { useState, type ReactNode } from "react"

import { Button } from "@/components/standard/button"
import {
  ScrollMask,
  scrollMaskVariants,
  type ScrollMaskVariant,
} from "@/components/standard/scroll-mask"

const photo = "/samples/sample-video-poster.jpg"

function Example({ title, children }: { title: string; children: ReactNode }) {
  return (
    <figure className="flex min-w-0 flex-col gap-2">
      <figcaption className="text-xs text-muted-foreground">{title}</figcaption>
      {children}
    </figure>
  )
}

function ScrollPad({ children }: { children: ReactNode }) {
  return <p className="px-4 py-16 text-center text-sm text-muted-foreground">{children}</p>
}

/** Every variant over the same photo; switching remounts the panel at the top. */
function Variants() {
  const [variant, setVariant] = useState<ScrollMaskVariant>("iris")

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5">
        {scrollMaskVariants.map((name) => (
          <Button
            key={name}
            size="sm"
            tone={name === variant ? "default" : "outline"}
            aria-pressed={name === variant}
            onClick={() => setVariant(name)}
          >
            {name}
          </Button>
        ))}
      </div>
      <div key={variant} className="h-96 overflow-y-auto rounded-xl border">
        <ScrollPad>Scroll down</ScrollPad>
        <ScrollMask
          variant={variant}
          src={photo}
          alt="Still from the sample video"
          word="OPEN"
          overlay={0.3}
          inset
        >
          <h3 className="text-3xl font-semibold tracking-tight text-background dark:text-foreground">
            {variant}
          </h3>
        </ScrollMask>
        <ScrollPad>…and back up</ScrollPad>
      </div>
    </div>
  )
}

/** `media` takes any node: here a grid of cells opening from a corner. */
function AnyMedia() {
  return (
    <div className="h-96 overflow-y-auto rounded-xl border">
      <ScrollPad>Scroll down</ScrollPad>
      <ScrollMask
        variant="grid"
        columns={6}
        originX={0}
        originY={0}
        stagger={0.7}
        scrollLength={1.2}
        inset
        media={
          <div className="grid grid-cols-3 gap-3 bg-muted p-6">
            {["Plan", "Build", "Ship", "Measure", "Learn", "Repeat"].map((label) => (
              <div
                key={label}
                className="grid place-items-center rounded-md bg-primary text-sm font-medium text-primary-foreground"
              >
                {label}
              </div>
            ))}
          </div>
        }
      />
      <ScrollPad>Cells open from the top-left corner</ScrollPad>
    </div>
  )
}

export function RendersScrollMaskDemo() {
  return (
    <div className="grid w-full max-w-5xl gap-8 md:grid-cols-2">
      <Example title="Six variants over a photo">
        <Variants />
      </Example>
      <Example title="Any node as media, staggered from a corner">
        <AnyMedia />
      </Example>
    </div>
  )
}
