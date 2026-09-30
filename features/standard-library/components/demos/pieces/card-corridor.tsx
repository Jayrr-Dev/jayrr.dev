"use client"

import type { ReactNode } from "react"
import { ArrowRightIcon } from "lucide-react"

import { Button } from "@/components/standard/button"
import { CardCorridor } from "@/components/standard/card-corridor"

function Example({ title, children }: { title: string; children: ReactNode }) {
  return (
    <figure className="flex min-w-0 flex-col gap-2">
      <figcaption className="text-xs text-muted-foreground">{title}</figcaption>
      {children}
    </figure>
  )
}

function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-muted/40">
      {children}
    </div>
  )
}

/** Abstract renders drawn with gradients, so the demo needs no images. */
const ART = [
  "bg-radial-[at_30%_30%] from-orange-200 via-orange-500 to-rose-900",
  "bg-linear-to-br from-slate-100 via-slate-300 to-slate-500",
  "bg-conic-[from_120deg] from-fuchsia-500 via-violet-600 to-sky-400",
  "bg-radial-[at_70%_20%] from-pink-100 via-pink-300 to-rose-400",
  "bg-linear-to-b from-amber-300 via-orange-500 to-red-700",
  "bg-radial-[at_50%_80%] from-sky-200 via-blue-500 to-indigo-950",
  "bg-conic-[from_200deg] from-rose-300 via-orange-400 to-amber-200",
  "bg-linear-to-tr from-stone-900 via-rose-900 to-rose-300",
  "bg-radial-[at_40%_40%] from-cyan-100 via-teal-400 to-slate-900",
  "bg-linear-to-br from-violet-200 via-pink-300 to-orange-300",
  "bg-conic-[from_30deg] from-zinc-200 via-zinc-500 to-zinc-100",
  "bg-radial-[at_60%_30%] from-yellow-200 via-orange-600 to-blue-900",
].map((art) => <div key={art} className={`size-full ${art}`} />)

function Hero() {
  return (
    <div className="dark overflow-hidden rounded-xl bg-background text-foreground">
      <CardCorridor items={ART} className="h-[30rem]">
        <div className="flex h-full flex-col items-center justify-between px-4 py-10 text-center">
          <h2 className="max-w-md font-serif text-4xl leading-tight tracking-tight">
            The picture in your head, rendered before lunch.
          </h2>
          <div className="flex max-w-xs flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Describe the shot, steer it with references, and export every size
              you need.
            </p>
            <Button size="sm">
              Start creating
              <ArrowRightIcon />
            </Button>
          </div>
        </div>
      </CardCorridor>
    </div>
  )
}

export function RendersCardCorridorDemo() {
  return (
    <div className="grid w-full max-w-5xl gap-8">
      <Example title="Hero: cards come out of the middle">
        <Hero />
      </Example>
      <div className="grid gap-8 md:grid-cols-2">
        <Example title="direction=in · pauses on hover">
          <Frame>
            <CardCorridor
              items={ART}
              direction="in"
              pauseOnHover
              className="h-64"
            />
          </Frame>
        </Example>
        <Example title="Flatter cards, square, fast">
          <Frame>
            <CardCorridor
              items={ART}
              angle={40}
              spread={0.4}
              duration={16}
              count={20}
              cardClassName="aspect-square w-[12cqw]"
              className="h-64"
            />
          </Frame>
        </Example>
      </div>
    </div>
  )
}
