"use client"

import { Row } from "@/components/standard/row"
import { Skeleton } from "@/components/standard/skeleton"
import { Stack } from "@/components/standard/stack"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersSkeletonDemo() {
  return (
    <>
      <RendersDemoCard>
        <Row className="w-full">
          <Skeleton className="size-10 rounded-full" />
          <Stack className="flex-1">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-full" />
          </Stack>
        </Row>
      </RendersDemoCard>
      <RendersDemoCard label="block">
        <Skeleton className="h-16 w-full" />
      </RendersDemoCard>
    </>
  )
}
