"use client"

import { SearchIcon, StarIcon, Trash2Icon } from "lucide-react"

import { ButtonIcon } from "@/components/standard/button-icon"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersButtonIconDemo() {
  return (
    <>
      <RendersDemoCard>
        <ButtonIcon label="Star">
          <StarIcon className="size-4" />
        </ButtonIcon>
      </RendersDemoCard>
      <RendersDemoCard label="tone outline">
        <ButtonIcon label="Search" tone="outline">
          <SearchIcon className="size-4" />
        </ButtonIcon>
      </RendersDemoCard>
      <RendersDemoCard label="tone ghost">
        <ButtonIcon label="Search" tone="ghost">
          <SearchIcon className="size-4" />
        </ButtonIcon>
      </RendersDemoCard>
      <RendersDemoCard label="tone danger">
        <ButtonIcon label="Delete" tone="danger">
          <Trash2Icon className="size-4" />
        </ButtonIcon>
      </RendersDemoCard>
    </>
  )
}
