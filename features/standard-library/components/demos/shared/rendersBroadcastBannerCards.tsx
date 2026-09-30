"use client"

import { BroadcastBanner } from "@/components/standard/broadcast-banner"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

/**
 * Banner cards shared by Broadcast Banner and Broadcast Banner Container.
 * Hook-free: call it as a function so the gallery receives the cards.
 */
export function RendersBroadcastBannerCards() {
  return (
    <>
      <RendersDemoCard className="w-full max-w-xl">
        <BroadcastBanner title="Office closed Friday">
          Submit hours by Thursday.
        </BroadcastBanner>
      </RendersDemoCard>
      <RendersDemoCard label="short" className="w-full max-w-xl">
        <BroadcastBanner title="New rate card">
          Starts next period.
        </BroadcastBanner>
      </RendersDemoCard>
    </>
  )
}
