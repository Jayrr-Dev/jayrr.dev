"use client"

import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

import { RendersDemoCard } from "./rendersDemoCard"

export function RendersMediaDemo({
  pieceName,
}: {
  pieceName: string
}) {
  if (pieceName === "Image") {
    return (
      <RendersDemoCard>
        <div className="w-full">
          <AspectRatio
            ratio={16 / 9}
            className="overflow-hidden rounded-lg bg-muted"
          >
            <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
              16:9
            </div>
          </AspectRatio>
        </div>
      </RendersDemoCard>
    )
  }

  if (pieceName === "Avatar") {
    return (
      <>
        <RendersDemoCard>
          <Avatar>
            <AvatarFallback>JR</AvatarFallback>
          </Avatar>
        </RendersDemoCard>
        <RendersDemoCard>
          <Avatar className="size-12">
            <AvatarFallback>AL</AvatarFallback>
          </Avatar>
        </RendersDemoCard>
      </>
    )
  }

  return null
}
