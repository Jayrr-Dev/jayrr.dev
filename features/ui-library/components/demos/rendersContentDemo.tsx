"use client"

import { Kbd, KbdGroup } from "@/components/ui/kbd"

import { RendersDemoCard } from "./rendersDemoCard"

export function RendersContentDemo({
  pieceName,
}: {
  pieceName: string
}) {
  if (pieceName === "Heading") {
    return (
      <>
        <RendersDemoCard>
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
            Taxing Laughter
          </h1>
        </RendersDemoCard>
        <RendersDemoCard>
          <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">
            The King&apos;s Plan
          </h2>
        </RendersDemoCard>
        <RendersDemoCard>
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
            The Joke Tax
          </h3>
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Paragraph") {
    return (
      <>
        <RendersDemoCard>
          <p className="text-xl text-muted-foreground">
            A far-off land ran out of money, so the king taxed the jokes.
          </p>
        </RendersDemoCard>
        <RendersDemoCard>
          <p className="leading-7">
            The king thought long and hard, and finally came up with a
            brilliant plan.
          </p>
        </RendersDemoCard>
        <RendersDemoCard>
          <p className="text-sm text-muted-foreground">
            People stopped telling jokes. The treasury stayed empty.
          </p>
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Caption") {
    return (
      <>
        <RendersDemoCard>
          <p className="text-sm text-muted-foreground">
            Figure 1. The joke tax in one line.
          </p>
        </RendersDemoCard>
        <RendersDemoCard>
          <p className="text-xs tracking-wide text-muted-foreground uppercase">
            Posted yesterday
          </p>
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Code") {
    return (
      <>
        <RendersDemoCard>
          <code className="relative rounded bg-muted px-2 py-1 font-mono text-sm">
            npx shadcn add button
          </code>
        </RendersDemoCard>
        <RendersDemoCard>
          <KbdGroup>
            <Kbd>Ctrl</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </RendersDemoCard>
      </>
    )
  }

  return null
}
