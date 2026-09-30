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
      <RendersDemoCard label="shape">
        <Stack direction="row" align="center" gap="lg" className="w-full">
          <Skeleton shape="circle" />
          <Skeleton shape="text" className="w-24" />
          <Skeleton shape="rect" className="h-12 w-24" />
        </Stack>
      </RendersDemoCard>
      <RendersDemoCard label="lines 3">
        <Skeleton lines={3} />
      </RendersDemoCard>
    </>
  )
}
