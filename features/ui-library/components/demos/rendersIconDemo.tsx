"use client"

import { CircleCheckIcon, CircleIcon, StarIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"

import { RendersDemoCard } from "./rendersDemoCard"

export function RendersIconDemo({
  pieceName,
}: {
  pieceName: string
}) {
  if (pieceName === "Symbol") {
    return (
      <>
        <RendersDemoCard>
          <StarIcon />
        </RendersDemoCard>
        <RendersDemoCard>
          <CircleIcon />
        </RendersDemoCard>
        <RendersDemoCard>
          <CircleCheckIcon />
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Status") {
    return (
      <>
        <RendersDemoCard>
          <Badge>Ready</Badge>
        </RendersDemoCard>
        <RendersDemoCard>
          <Badge variant="secondary">Draft</Badge>
        </RendersDemoCard>
        <RendersDemoCard>
          <span className="inline-flex items-center gap-2 text-sm">
            <Spinner />
            Working
          </span>
        </RendersDemoCard>
      </>
    )
  }

  return null
}
