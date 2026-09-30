"use client"

import { RefreshCwIcon, SearchIcon, StarIcon } from "lucide-react"

import {
  CaptionButton,
  CaptionsArray,
} from "@/components/standard/caption-button"
import { Toggle } from "@/components/standard/toggle"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersCaptionButtonDemo() {
  return (
    <>
      <RendersDemoCard>
        <CaptionButton label="Favorite">
          <StarIcon className="size-4" />
        </CaptionButton>
      </RendersDemoCard>
      <RendersDemoCard label="pressed">
        <CaptionButton label="Favorite" defaultPressed>
          <StarIcon className="size-4" />
        </CaptionButton>
      </RendersDemoCard>
      <RendersDemoCard label="shape square">
        <CaptionButton label="Search" shape="square">
          <SearchIcon className="size-4" />
        </CaptionButton>
      </RendersDemoCard>
      <RendersDemoCard label="size sm">
        <CaptionButton label="Refresh" size="sm">
          <RefreshCwIcon className="size-3" />
        </CaptionButton>
      </RendersDemoCard>
      <RendersDemoCard label="size lg">
        <CaptionButton label="Star" size="lg">
          <StarIcon className="size-5" />
        </CaptionButton>
      </RendersDemoCard>
      <RendersDemoCard label="Toggle iconOnly shape circle">
        <Toggle iconOnly shape="circle" aria-label="Favorite">
          <StarIcon className="size-4" />
        </Toggle>
      </RendersDemoCard>
      <RendersDemoCard label="Toggle iconOnly shape square">
        <Toggle iconOnly shape="square" aria-label="Search" defaultPressed>
          <SearchIcon className="size-4" />
        </Toggle>
      </RendersDemoCard>
      <RendersDemoCard label="captions array">
        <CaptionsArray>
          <CaptionButton label="Star">
            <StarIcon className="size-4" />
          </CaptionButton>
          <CaptionButton label="Search">
            <SearchIcon className="size-4" />
          </CaptionButton>
          <CaptionButton label="Refresh">
            <RefreshCwIcon className="size-4" />
          </CaptionButton>
        </CaptionsArray>
      </RendersDemoCard>
      <RendersDemoCard label="captions array · shape square">
        <CaptionsArray>
          <CaptionButton label="Star" shape="square">
            <StarIcon className="size-4" />
          </CaptionButton>
          <CaptionButton label="Search" shape="square">
            <SearchIcon className="size-4" />
          </CaptionButton>
        </CaptionsArray>
      </RendersDemoCard>
    </>
  )
}
