"use client"

import { useState, type ReactNode } from "react"

import { Button } from "@/components/standard/button"
import { Card } from "@/components/standard/card"
import { Reveal, revealEnters } from "@/components/standard/reveal"

function Example({
  title,
  className,
  children,
}: {
  title: string
  className?: string
  children: ReactNode
}) {
  return (
    <figure className={`flex min-w-0 flex-col gap-2 ${className ?? ""}`}>
      <figcaption className="text-xs text-muted-foreground">{title}</figcaption>
      {children}
    </figure>
  )
}

function ScrollPad({ children }: { children: ReactNode }) {
  return <p className="px-4 py-20 text-center text-sm text-muted-foreground">{children}</p>
}

/** Every entrance side by side; Replay remounts them. */
function Entrances() {
  const [run, setRun] = useState(0)

  return (
    <div className="flex flex-col gap-3">
      <div key={run} className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {revealEnters.map((enter, index) => (
          <Reveal key={enter} enter={enter} delay={index * 60}>
            <div className="grid h-20 place-items-center rounded-lg border bg-muted/40 text-xs font-medium">
              {enter}
            </div>
          </Reveal>
        ))}
      </div>
      <Button size="sm" tone="outline" className="self-start" onClick={() => setRun(run + 1)}>
        Replay
      </Button>
    </div>
  )
}

const features = [
  { title: "Fast", body: "No animation library, just CSS transitions." },
  { title: "Any content", body: "Wrap a heading, an image or a whole section." },
  { title: "Staggered", body: "Direct children arrive one after another." },
  { title: "Accessible", body: "Reduced motion shows everything at once." },
]

/** A landing-page section: heading fades up, cards cascade in. */
function LandingSection() {
  return (
    <div className="h-96 overflow-y-auto rounded-xl border">
      <ScrollPad>Scroll down</ScrollPad>
      <section className="flex flex-col gap-6 px-6 pb-16">
        <Reveal>
          <h3 className="text-2xl font-semibold tracking-tight">Things fade in as you get to them</h3>
          <p className="mt-1 text-sm text-muted-foreground">The default: `rise`, once.</p>
        </Reveal>
        <Reveal stagger={100} delay={150} className="grid gap-3 sm:grid-cols-2">
          {features.map((feature) => (
            <Card key={feature.title} title={feature.title}>
              <p className="text-sm text-muted-foreground">{feature.body}</p>
            </Card>
          ))}
        </Reveal>
      </section>
    </div>
  )
}

/** `once={false}` hides rows again as they leave, so they replay both ways. */
function Replaying() {
  return (
    <div className="h-96 overflow-y-auto rounded-xl border p-3">
      <div className="flex flex-col gap-2">
        {Array.from({ length: 14 }, (_, index) => (
          <Reveal
            key={index}
            once={false}
            enter={index % 2 ? "slide-end" : "slide-start"}
            distance={48}
            threshold={0.6}
          >
            <div className="rounded-lg border bg-muted/40 px-4 py-6 text-sm">Row {index + 1}</div>
          </Reveal>
        ))}
      </div>
    </div>
  )
}

export function RendersRevealDemo() {
  return (
    <div className="grid w-full max-w-5xl gap-8 md:grid-cols-2">
      <Example title="Entrances" className="md:col-span-2">
        <Entrances />
      </Example>
      <Example title="Landing section with a staggered grid">
        <LandingSection />
      </Example>
      <Example title="Replays each time with once={false}">
        <Replaying />
      </Example>
    </div>
  )
}
