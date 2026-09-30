"use client"

import { useRef, useState, type ReactNode } from "react"

import { ScrollTrack } from "@/components/standard/scroll-track"

function Example({ title, children }: { title: string; children: ReactNode }) {
  return (
    <figure className="flex min-w-0 flex-col gap-2">
      <figcaption className="text-xs text-muted-foreground">{title}</figcaption>
      {children}
    </figure>
  )
}

function Filler({ lines = 8 }: { lines?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <div className="h-2 w-full rounded-full bg-muted" />
          <div className="h-2 w-11/12 rounded-full bg-muted" />
          <div className="h-2 w-3/4 rounded-full bg-muted" />
        </div>
      ))}
    </div>
  )
}

const dot = <span className="block size-3 rounded-full bg-primary ring-4 ring-primary/20" />

/** The reading bar: a straight line pinned under a header. */
function ReadingBar() {
  return (
    <div className="h-72 overflow-y-auto rounded-xl border">
      <header className="sticky top-0 z-10 border-b bg-background px-4 py-2 text-sm font-medium">
        Our next era of intelligence
        <ScrollTrack className="absolute inset-x-0 -bottom-px" />
      </header>
      <div className="p-4">
        <Filler lines={10} />
      </div>
    </div>
  )
}

/** A wave with a dot riding the tip. */
function Wave() {
  return (
    <div className="h-72 overflow-y-auto rounded-xl border">
      <div className="sticky top-0 z-10 border-b bg-background px-4 py-3">
        <ScrollTrack
          d="M2 10 C 14 0, 22 0, 34 10 S 54 20, 66 10 S 86 0, 98 10"
          viewBox="0 0 100 20"
          thickness={2}
          rounded
          rail
          marker={dot}
          className="h-6 w-full"
        />
      </div>
      <div className="p-4">
        <Filler lines={10} />
      </div>
    </div>
  )
}

/** A route down the side, with a marker that moves down it and faces its way. */
function Route() {
  const [percent, setPercent] = useState(0)
  return (
    <div className="h-72 overflow-y-auto rounded-xl border">
      <div className="grid grid-cols-[4rem_1fr] gap-4 p-4">
        <div className="sticky top-4 h-64">
          <ScrollTrack
            d="M20 2 C 20 20, 4 22, 4 40 S 36 60, 36 78 S 20 96, 20 98"
            viewBox="0 0 40 100"
            thickness={1.5}
            rounded
            rail
            tone="info"
            rotateMarker
            onProgressChange={(value) => setPercent(Math.round(value * 100))}
            marker={
              <svg viewBox="0 0 16 16" className="size-4 fill-info">
                <path d="M16 8 L2 15 L5 8 L2 1 Z" />
              </svg>
            }
            className="size-full"
          />
        </div>
        <div className="flex flex-col gap-3">
          <p className="sticky top-0 bg-background py-1 text-sm font-medium tabular-nums">{percent}% of the way down</p>
          <Filler lines={12} />
        </div>
      </div>
    </div>
  )
}

/** Tracks one section only: empty until it reaches the top, full at its end. */
function Section() {
  const sectionRef = useRef<HTMLElement>(null)
  return (
    <div className="h-72 overflow-y-auto rounded-xl border">
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b bg-background px-4 py-2">
        <span className="text-xs text-muted-foreground">Chapter 2</span>
        <ScrollTrack
          target={sectionRef}
          orientation="horizontal"
          thickness={6}
          rounded
          rail
          tone="success"
          className="flex-1"
        />
      </div>
      <div className="flex flex-col gap-6 p-4">
        <p className="text-sm text-muted-foreground">Chapter 1</p>
        <Filler lines={4} />
        <section ref={sectionRef} className="flex flex-col gap-3 rounded-lg bg-success/10 p-3">
          <p className="text-sm font-medium text-success">Chapter 2 (tracked)</p>
          <Filler lines={8} />
        </section>
        <p className="text-sm text-muted-foreground">Chapter 3</p>
        <Filler lines={6} />
      </div>
    </div>
  )
}

const chapterTitles = ["Origins", "The first models", "Scaling up", "What comes next"]

/** One segment per chapter, each filling while that chapter is read. */
function Chapters() {
  const ref0 = useRef<HTMLElement>(null)
  const ref1 = useRef<HTMLElement>(null)
  const ref2 = useRef<HTMLElement>(null)
  const ref3 = useRef<HTMLElement>(null)
  // A stable array, so the track doesn't rewire on every render.
  const [chapters] = useState(() => [ref0, ref1, ref2, ref3])
  const [current, setCurrent] = useState(0)
  return (
    <div className="h-72 overflow-y-auto rounded-xl border">
      <div className="sticky top-0 z-10 flex flex-col gap-2 border-b bg-background px-4 py-2">
        <p className="text-xs text-muted-foreground">
          Chapter {current + 1} of {chapterTitles.length} ·{" "}
          <span className="font-medium text-foreground">{chapterTitles[current]}</span>
        </p>
        <ScrollTrack chapters={chapters} onChapterChange={setCurrent} thickness={4} rounded rail />
      </div>
      <div className="flex flex-col gap-6 p-4">
        {chapterTitles.map((title, index) => (
          <section key={title} ref={chapters[index]} className="flex flex-col gap-3">
            <p className="text-sm font-medium">
              {index + 1}. {title}
            </p>
            <Filler lines={3 + (index % 2) * 2} />
          </section>
        ))}
      </div>
    </div>
  )
}

/** A vertical line with a fixed range: y1 = 200px to y2 = 600px of scroll. */
function Range() {
  return (
    <div className="h-72 overflow-y-auto rounded-xl border">
      <div className="grid grid-cols-[1.5rem_1fr] gap-4 p-4">
        <div className="sticky top-4 flex h-64 justify-center">
          <ScrollTrack
            start={200}
            end={600}
            orientation="vertical"
            thickness={4}
            rounded
            rail
            tone="warning"
            marker={<span className="block size-4 rounded-full border-2 border-warning bg-background" />}
          />
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">Fills between 200px and 600px of scroll</p>
          <Filler lines={14} />
        </div>
      </div>
    </div>
  )
}

export function RendersScrollTrackDemo() {
  return (
    <div className="grid w-full max-w-5xl gap-8 md:grid-cols-2">
      <Example title="Reading bar pinned under a header">
        <ReadingBar />
      </Example>
      <Example title="Any path, with a marker riding the tip">
        <Wave />
      </Example>
      <Example title="A route down the side, marker facing its way">
        <Route />
      </Example>
      <Example title="Tracking one section">
        <Section />
      </Example>
      <Example title="Chapters, one segment each">
        <Chapters />
      </Example>
      <Example title="Vertical, from y1 to y2">
        <Range />
      </Example>
    </div>
  )
}
