"use client"

import * as React from "react"
import { CheckIcon, XIcon } from "lucide-react"

import { LoadingState, Spinner } from "@/components/standard/loading-state"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const multiStates = [
  { key: "loading", label: "Syncing jobs" },
  { key: "success", label: "Jobs synced" },
  { key: "error", label: "Sync failed" },
] as const

/** Cycles a single slot through loading → success → error. */
function MultiStateSpinner() {
  const [index, setIndex] = React.useState(0)
  const state = multiStates[index]

  React.useEffect(() => {
    const id = setTimeout(
      () => setIndex((i) => (i + 1) % multiStates.length),
      state.key === "loading" ? 1800 : 1400
    )
    return () => clearTimeout(id)
  }, [state.key])

  return (
    <div
      role="status"
      aria-live="polite"
      data-state={state.key}
      className="flex items-center gap-2 text-sm text-muted-foreground"
    >
      <span
        key={state.key}
        className="flex size-4 items-center justify-center animate-in fade-in zoom-in-50 duration-200"
      >
        {state.key === "loading" && <Spinner aria-hidden />}
        {state.key === "success" && (
          <CheckIcon
            className="size-4 text-success animate-out fade-out zoom-out-50 fill-mode-forwards delay-900 duration-300"
          />
        )}
        {state.key === "error" && (
          <XIcon className="size-4 text-destructive" />
        )}
      </span>
      <span key={`${state.key}-label`} className="animate-in fade-in duration-200">
        {state.label}
      </span>
    </div>
  )
}

/** Loads, shows the check, then lets `doneDismissAfter` fade it out. */
function DoneDismissDemo() {
  const [run, setRun] = React.useState(0)
  const [done, setDone] = React.useState(false)

  React.useEffect(() => {
    const id = setTimeout(() => setDone(true), 1500)
    return () => clearTimeout(id)
  }, [run])

  return (
    <div className="flex items-center gap-4">
      <LoadingState
        key={run}
        label="Saving"
        done={done}
        doneLabel="Saved"
        doneDismissAfter={1200}
      />
      <button
        type="button"
        onClick={() => {
          setDone(false)
          setRun((r) => r + 1)
        }}
        className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        Replay
      </button>
    </div>
  )
}

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
      <RendersDemoCard label="done dismiss after">
        <DoneDismissDemo />
      </RendersDemoCard>
      <RendersDemoCard label="multi state">
        <MultiStateSpinner />
      </RendersDemoCard>
    </>
  )
}
