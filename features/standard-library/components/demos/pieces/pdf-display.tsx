"use client"

import { PdfDisplay } from "@/components/standard/pdf-display"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const sample = "/samples/sample-document.pdf"

export function RendersPdfDisplayDemo() {
  return (
    <>
      <RendersDemoCard className="w-full max-w-2xl">
        <PdfDisplay src={sample} title="Display primitives" height={520} />
      </RendersDemoCard>
      <RendersDemoCard
        label="page 2 · page-fit · no viewer toolbar"
        className="w-full max-w-2xl"
      >
        <PdfDisplay
          src={sample}
          page={2}
          zoom="page-fit"
          viewerToolbar={false}
          height={360}
        />
      </RendersDemoCard>
      <RendersDemoCard
        label="header false · scrollbar false"
        className="w-full max-w-2xl"
      >
        <PdfDisplay
          src={sample}
          header={false}
          scrollbar={false}
          viewerToolbar={false}
          height={360}
        />
      </RendersDemoCard>
    </>
  )
}
