"use client"

import { useRef } from "react"

import { PrintButton } from "@/components/standard/print-button"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

import { RendersExportMenuCard } from "../shared/rendersExportMenuCard"

function RendersPrintReceiptCard() {
  const receipt = useRef<HTMLDivElement>(null)

  return (
    <RendersDemoCard label="iconed text · prints one element">
      <div className="flex flex-wrap items-center gap-3">
        <div
          ref={receipt}
          className="rounded-md border border-border bg-background px-3 py-2 font-mono text-xs"
        >
          Receipt #1042 · 3 items · $128.50
        </div>
        <PrintButton target={receipt} title="Receipt 1042">
          Print receipt
        </PrintButton>
      </div>
    </RendersDemoCard>
  )
}

export function RendersPrintButtonDemo() {
  return (
    <>
      <RendersDemoCard label="icon">
        <PrintButton display="icon" />
      </RendersDemoCard>
      <RendersDemoCard label="iconed text">
        <PrintButton />
      </RendersDemoCard>
      <RendersDemoCard label="text">
        <PrintButton display="text" />
      </RendersDemoCard>
      <RendersPrintReceiptCard />
      <RendersExportMenuCard />
    </>
  )
}
