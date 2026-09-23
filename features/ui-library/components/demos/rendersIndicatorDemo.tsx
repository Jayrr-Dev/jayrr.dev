"use client"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"

import { RendersDemoCard } from "./rendersDemoCard"

export function RendersIndicatorDemo({
  pieceName,
}: {
  pieceName: string
}) {
  if (pieceName === "Badge") {
    return (
      <>
        <RendersDemoCard>
          <Badge>Default</Badge>
        </RendersDemoCard>
        <RendersDemoCard>
          <Badge variant="secondary">Secondary</Badge>
        </RendersDemoCard>
        <RendersDemoCard>
          <Badge variant="outline">Outline</Badge>
        </RendersDemoCard>
        <RendersDemoCard>
          <Badge variant="destructive">Destructive</Badge>
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Progress") {
    return (
      <>
        <RendersDemoCard>
          <Progress value={25} className="w-full" />
        </RendersDemoCard>
        <RendersDemoCard>
          <Progress value={70} className="w-full" />
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Skeleton") {
    return (
      <RendersDemoCard>
        <div className="flex w-full items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      </RendersDemoCard>
    )
  }

  return null
}
