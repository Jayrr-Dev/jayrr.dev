"use client"

import { Button } from "@/components/standard/button"
import { PageHeader } from "@/components/standard/page-header"
import { RefreshButton } from "@/components/standard/refresh-button"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersPageHeaderDemo() {
  return (
    <>
      <RendersDemoCard className="w-full max-w-xl">
        <PageHeader
          title="Timesheets"
          info="Hours for the open period."
          backLabel="Back"
        >
          <RefreshButton />
        </PageHeader>
      </RendersDemoCard>
      <RendersDemoCard label="with action" className="w-full max-w-xl">
        <PageHeader title="Jobs">
          <Button size="sm">New</Button>
        </PageHeader>
      </RendersDemoCard>
    </>
  )
}
