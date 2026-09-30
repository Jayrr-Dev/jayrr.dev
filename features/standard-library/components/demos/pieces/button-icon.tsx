"use client"

import { SearchIcon, StarIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/standard/button"
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
      <RendersDemoCard label="shape circle">
        <ButtonIcon label="Star" tone="outline" shape="circle">
          <StarIcon className="size-4" />
        </ButtonIcon>
      </RendersDemoCard>
      <RendersDemoCard label="tone quiet">
        <ButtonIcon label="Search" tone="quiet">
          <SearchIcon className="size-4" />
        </ButtonIcon>
      </RendersDemoCard>
      <RendersDemoCard label="loading">
        <ButtonIcon label="Saving" tone="outline" loading>
          <StarIcon className="size-4" />
        </ButtonIcon>
      </RendersDemoCard>
      <RendersDemoCard label="Button iconOnly">
        <Button iconOnly tone="outline" aria-label="Search">
          <SearchIcon className="size-4" />
        </Button>
      </RendersDemoCard>
    </>
  )
}
