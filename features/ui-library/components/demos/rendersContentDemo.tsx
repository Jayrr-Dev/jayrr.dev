"use client"

import { Caption } from "@/components/standard/caption"
import { Code } from "@/components/standard/code"
import { Heading } from "@/components/standard/heading"
import { Paragraph } from "@/components/standard/paragraph"
import { Kbd, KbdGroup } from "@/components/ui/kbd"

import { RendersDemoCard } from "./rendersDemoCard"

const longHeading =
  "The king's joke tax, and why the treasury stayed empty long after every jester had left town"

const longParagraph =
  "The king thought long and hard, and finally came up with a brilliant plan: he would tax the jokes in the kingdom. Jokesters paid a gold coin per joke, so people stopped telling them, the laughter faded, and the treasury stayed as empty as before."

const blockSnippet = `import { Code } from "@/components/standard/code"

export function Example() {
  return <Code variant="block" copyable>npx shadcn@latest add https://example.com/r/code.json --overwrite</Code>
}`

export function RendersContentDemo({
  pieceName,
}: {
  pieceName: string
}) {
  if (pieceName === "Heading") {
    return (
      <>
        <RendersDemoCard>
          <Heading level={1}>Taxing Laughter</Heading>
        </RendersDemoCard>
        <RendersDemoCard>
          <Heading level={2}>The King&apos;s Plan</Heading>
        </RendersDemoCard>
        <RendersDemoCard>
          <Heading level={3}>The Joke Tax</Heading>
        </RendersDemoCard>
        <RendersDemoCard label="tone muted">
          <Heading level={3} tone="muted">
            The Joke Tax
          </Heading>
        </RendersDemoCard>
        <RendersDemoCard label="lineClamp 2">
          <Heading level={3} lineClamp={2}>
            {longHeading}
          </Heading>
        </RendersDemoCard>
        <RendersDemoCard label="truncate">
          <Heading level={3} truncate className="w-full">
            {longHeading}
          </Heading>
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Paragraph") {
    return (
      <>
        <RendersDemoCard>
          <Paragraph size="lead">
            A far-off land ran out of money, so the king taxed the jokes.
          </Paragraph>
        </RendersDemoCard>
        <RendersDemoCard>
          <Paragraph>
            The king thought long and hard, and finally came up with a
            brilliant plan.
          </Paragraph>
        </RendersDemoCard>
        <RendersDemoCard>
          <Paragraph size="muted">
            People stopped telling jokes. The treasury stayed empty.
          </Paragraph>
        </RendersDemoCard>
        <RendersDemoCard label="size sm">
          <Paragraph size="sm">Sep 22, 2026 · 8.0 h</Paragraph>
        </RendersDemoCard>
        <RendersDemoCard label="tone muted">
          <Paragraph tone="muted">
            The jesters packed up and left for the next kingdom over.
          </Paragraph>
        </RendersDemoCard>
        <RendersDemoCard label="lineClamp 2">
          <Paragraph lineClamp={2}>{longParagraph}</Paragraph>
        </RendersDemoCard>
        <RendersDemoCard label="truncate">
          <Paragraph truncate className="w-full">
            {longParagraph}
          </Paragraph>
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Caption") {
    return (
      <>
        <RendersDemoCard>
          <Caption>Figure 1. The joke tax in one line.</Caption>
        </RendersDemoCard>
        <RendersDemoCard>
          <Caption tone="uppercase">Posted yesterday</Caption>
        </RendersDemoCard>
        <RendersDemoCard label="tone muted">
          <Caption tone="muted">Last edited 3 minutes ago</Caption>
        </RendersDemoCard>
        <RendersDemoCard label="tone danger">
          <Caption tone="danger">That joke is already taxed.</Caption>
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Code") {
    return (
      <>
        <RendersDemoCard>
          <Code>npx shadcn add button</Code>
        </RendersDemoCard>
        <RendersDemoCard>
          <KbdGroup>
            <Kbd>Ctrl</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </RendersDemoCard>
        <RendersDemoCard label="Code block">
          <Code variant="block">{blockSnippet}</Code>
        </RendersDemoCard>
        <RendersDemoCard label="Code block copyable">
          <Code variant="block" copyable>
            {blockSnippet}
          </Code>
        </RendersDemoCard>
      </>
    )
  }

  return null
}
