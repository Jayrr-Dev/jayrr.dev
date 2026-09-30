"use client"

import {
  BoldIcon,
  ItalicIcon,
  PinIcon,
  RefreshCwIcon,
  SearchIcon,
  StarIcon,
  UnderlineIcon,
} from "lucide-react"

import { Toggle } from "@/components/standard/toggle"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersToggleDemo() {
  return (
    <>
      <RendersDemoCard>
        <Toggle>Show hidden</Toggle>
      </RendersDemoCard>
      <RendersDemoCard label="defaultPressed">
        <Toggle defaultPressed>Show hidden</Toggle>
      </RendersDemoCard>
      <RendersDemoCard label="disabled">
        <Toggle disabled>Locked</Toggle>
      </RendersDemoCard>
      <RendersDemoCard label="iconOnly">
        <div className="flex flex-wrap items-center gap-1">
          <Toggle iconOnly aria-label="Bold" defaultPressed>
            <BoldIcon className="size-4" />
          </Toggle>
          <Toggle iconOnly aria-label="Italic">
            <ItalicIcon className="size-4" />
          </Toggle>
          <Toggle iconOnly aria-label="Underline">
            <UnderlineIcon className="size-4" />
          </Toggle>
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="iconOnly shape circle">
        <Toggle iconOnly shape="circle" aria-label="Favorite">
          <StarIcon className="size-4" />
        </Toggle>
      </RendersDemoCard>
      <RendersDemoCard label="iconOnly shape square">
        <Toggle iconOnly shape="square" aria-label="Pin">
          <PinIcon className="size-4" />
        </Toggle>
      </RendersDemoCard>
      <RendersDemoCard label="iconOnly · size sm · default · lg">
        <div className="flex flex-wrap items-center gap-1">
          <Toggle iconOnly size="sm" aria-label="Refresh">
            <RefreshCwIcon className="size-3" />
          </Toggle>
          <Toggle iconOnly aria-label="Favorite" defaultPressed>
            <StarIcon className="size-4" />
          </Toggle>
          <Toggle iconOnly size="lg" aria-label="Search">
            <SearchIcon className="size-5" />
          </Toggle>
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="size sm">
        <Toggle size="sm">Small</Toggle>
      </RendersDemoCard>
      <RendersDemoCard label="size lg">
        <Toggle size="lg">Large</Toggle>
      </RendersDemoCard>
      <RendersDemoCard label="tone ghost">
        <div className="flex flex-wrap items-center gap-1">
          <Toggle tone="ghost" iconOnly aria-label="Bold" defaultPressed>
            <BoldIcon className="size-4" />
          </Toggle>
          <Toggle tone="ghost" iconOnly aria-label="Italic">
            <ItalicIcon className="size-4" />
          </Toggle>
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="tone outline">
        <Toggle tone="outline">Wrap lines</Toggle>
      </RendersDemoCard>
    </>
  )
}
