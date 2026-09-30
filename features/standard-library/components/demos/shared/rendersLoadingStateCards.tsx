"use client"

import { LoadingState, Spinner } from "@/components/standard/loading-state"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

/**
 * Loading cards shared by Loading State and Spinner. Hook-free: call it as a
 * function so the gallery receives the individual cards.
 */
export function RendersLoadingStateCards() {
  return (
    <>
      <RendersDemoCard>
        <LoadingState label="Loading jobs" />
      </RendersDemoCard>
      <RendersDemoCard label="spinner only">
        <Spinner />
      </RendersDemoCard>
    </>
  )
}
