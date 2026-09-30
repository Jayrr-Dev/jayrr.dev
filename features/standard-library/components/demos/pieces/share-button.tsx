"use client"

import { useState } from "react"

import { ShareButton, type ShareMethod } from "@/components/standard/share-button"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

import { RendersExportMenuCard } from "../shared/rendersExportMenuCard"

function RendersShareResult() {
  const [result, setResult] = useState<string | null>(null)

  function handleShare(method: ShareMethod) {
    setResult(
      method === "native" ? "Shared from the share sheet" : "Copied the link"
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <ShareButton
        tone="default"
        title="jayrr.dev"
        text="Components from the Standard library"
        url="https://jayrr.dev"
        onShare={handleShare}
        onShareError={() => setResult("Could not share")}
      />
      <span className="font-mono text-xs text-muted-foreground">
        {result ?? "navigator.share, or copy as a fallback"}
      </span>
    </div>
  )
}

export function RendersShareButtonDemo() {
  return (
    <>
      <RendersDemoCard label="share this page">
        <ShareButton />
      </RendersDemoCard>
      <RendersDemoCard label="custom data · onShare">
        <RendersShareResult />
      </RendersDemoCard>
      <RendersDemoCard label="icon only">
        <div className="flex gap-2">
          <ShareButton iconOnly />
          <ShareButton iconOnly shape="circle" tone="quiet" />
          <ShareButton iconOnly shape="circle" tone="ghost" size="sm" />
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="sizes">
        <div className="flex flex-wrap items-center gap-2">
          <ShareButton size="xs" />
          <ShareButton size="sm" />
          <ShareButton />
          <ShareButton size="lg" shape="pill">
            Share article
          </ShareButton>
        </div>
      </RendersDemoCard>
      <RendersExportMenuCard />
    </>
  )
}
