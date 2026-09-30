"use client"

import { ArrowLeftIcon, ChevronLeftIcon } from "lucide-react"

import { Button } from "@/components/standard/button"
import { ButtonBack } from "@/components/standard/button-link"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersButtonBackDemo() {
  return (
    <>
      <RendersDemoCard label="text">
        <ButtonBack />
      </RendersDemoCard>
      <RendersDemoCard label="icon">
        <ButtonBack variant="icon" />
      </RendersDemoCard>
      <RendersDemoCard label="icon + text">
        <ButtonBack variant="icon-text" />
      </RendersDemoCard>
      <RendersDemoCard label="inline">
        <div className="flex flex-wrap items-center gap-2">
          <ButtonBack />
          <ButtonBack variant="icon" />
          <ButtonBack variant="icon-text" />
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="custom href">
        <ButtonBack href="#gallery" variant="icon-text">
          Gallery
        </ButtonBack>
      </RendersDemoCard>
      <RendersDemoCard label="Button href leading">
        <Button
          href="#back"
          tone="outline"
          leading={<ChevronLeftIcon aria-hidden className="size-4" />}
          className="gap-1 pl-2"
        >
          Back
        </Button>
      </RendersDemoCard>
      <RendersDemoCard label="Button href · tone ghost">
        <Button
          href="#back"
          tone="ghost"
          leading={<ArrowLeftIcon aria-hidden className="size-4" />}
        >
          All projects
        </Button>
      </RendersDemoCard>
    </>
  )
}
