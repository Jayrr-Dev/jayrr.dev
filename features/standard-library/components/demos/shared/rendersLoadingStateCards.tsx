"use client"

import { LoadingState, Spinner } from "@/components/standard/loading-state"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const spinnerVariants = [
  "ring",
  "orbit",
  "dots",
  "bars",
  "pulse",
  "burst",
  "grid",
  "triangle",
] as const

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
      <RendersDemoCard label="spinner variant">
        <div className="flex flex-wrap items-center gap-4">
          {spinnerVariants.map((variant) => (
            <Spinner key={variant} variant={variant} className="size-5" />
          ))}
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="layout block" className="w-full max-w-xl">
        <div className="w-full rounded-lg border border-border">
          <LoadingState layout="block" label="Loading jobs" />
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="layout overlay" className="w-full max-w-xl">
        <div className="relative w-full rounded-lg border border-border p-3 text-sm">
          <p>Week 1 · 38h</p>
          <p>Week 2 · 41h</p>
          <p>Week 3 · 36h</p>
          <LoadingState layout="overlay" label="Refreshing" />
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="done">
        <LoadingState done doneLabel="Jobs loaded" />
      </RendersDemoCard>
    </>
  )
}
