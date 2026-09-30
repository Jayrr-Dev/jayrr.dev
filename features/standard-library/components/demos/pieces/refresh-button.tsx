"use client"

import { useState } from "react"

import { RefreshCwIcon } from "lucide-react"

import { Button } from "@/components/standard/button"
import { RefreshButton } from "@/components/standard/refresh-button"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const REFRESH_SPIN_MS = 1000

function RendersRefreshButtonSpinDemo({
  iconOnly = false,
  disabled = false,
  label,
}: {
  iconOnly?: boolean
  disabled?: boolean
  label?: string
}) {
  const [refreshing, setRefreshing] = useState(false)

  function handleClick() {
    if (refreshing || disabled) {
      return
    }
    setRefreshing(true)
    window.setTimeout(() => {
      setRefreshing(false)
    }, REFRESH_SPIN_MS)
  }

  return (
    <RendersDemoCard label={label}>
      <RefreshButton
        iconOnly={iconOnly}
        disabled={disabled}
        refreshing={refreshing}
        onClick={handleClick}
      />
    </RendersDemoCard>
  )
}

export function RendersRefreshButtonDemo() {
  return (
    <>
      <RendersRefreshButtonSpinDemo />
      <RendersRefreshButtonSpinDemo iconOnly label="icon only" />
      <RendersRefreshButtonSpinDemo disabled label="disabled" />
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
