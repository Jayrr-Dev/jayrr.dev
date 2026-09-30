"use client"

import { useState, type ComponentProps } from "react"

import { RefreshCwIcon } from "lucide-react"

import { Button } from "@/components/standard/button"
import {
  RefreshButton,
  type RefreshIcon,
} from "@/components/standard/refresh-button"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const REFRESH_SPIN_MS = 1000

const ICONS: RefreshIcon[] = [
  "refresh-cw",
  "refresh-ccw",
  "refresh-ccw-dot",
  "rotate-cw",
  "rotate-ccw",
]

const SIZES = ["xs", "sm", "default", "lg"] as const

const SPEEDS = ["slow", "default", "fast"] as const

/** Spins for a beat on click, like a real refresh. */
function RendersClickToRefresh(
  props: Omit<ComponentProps<typeof RefreshButton>, "refreshing" | "onClick">
) {
  const [refreshing, setRefreshing] = useState(false)

  function handleClick() {
    if (refreshing || props.disabled) {
      return
    }
    setRefreshing(true)
    window.setTimeout(() => {
      setRefreshing(false)
    }, REFRESH_SPIN_MS)
  }

  return (
    <RefreshButton {...props} refreshing={refreshing} onClick={handleClick} />
  )
}

export function RendersRefreshButtonDemo() {
  return (
    <>
      <RendersDemoCard>
        <RendersClickToRefresh />
      </RendersDemoCard>
      <RendersDemoCard label="icon only">
        <RendersClickToRefresh iconOnly />
      </RendersDemoCard>
      <RendersDemoCard label="disabled">
        <RendersClickToRefresh disabled />
      </RendersDemoCard>
      <RendersDemoCard label="icons">
        <div className="flex flex-wrap gap-2">
          {ICONS.map((icon) => (
            <RendersClickToRefresh
              key={icon}
              icon={icon}
              iconOnly
              aria-label={`Refresh (${icon})`}
            />
          ))}
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="sizes">
        <div className="flex flex-wrap items-center gap-2">
          {SIZES.map((size) => (
            <RendersClickToRefresh key={size} size={size} />
          ))}
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="speeds">
        <div className="flex flex-wrap gap-2">
          {SPEEDS.map((speed) => (
            <RefreshButton key={speed} refreshing speed={speed}>
              {speed[0].toUpperCase() + speed.slice(1)}
            </RefreshButton>
          ))}
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="refreshing">
        <RefreshButton refreshing />
      </RendersDemoCard>
      <RendersDemoCard label="Button loading spin-icon">
        <Button
          tone="outline"
          size="sm"
          loading="spin-icon"
          leading={<RefreshCwIcon aria-hidden className="size-3.5" />}
        >
          Syncing
        </Button>
      </RendersDemoCard>
    </>
  )
}
