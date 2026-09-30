"use client"

import { DownloadButton } from "@/components/standard/download-button"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

import { RendersExportMenuCard } from "../shared/rendersExportMenuCard"

function buildsNotes() {
  return new Blob(["Notes from the Standard library demo.\n"], {
    type: "text/plain",
  })
}

export function RendersDownloadButtonDemo() {
  return (
    <>
      <RendersDemoCard label="icon">
        <DownloadButton
          display="icon"
          href="/fx/sample-logo.svg"
          fileName="logo.svg"
        />
      </RendersDemoCard>
      <RendersDemoCard label="iconed text">
        <DownloadButton href="/fx/sample-logo.svg" fileName="logo.svg" />
      </RendersDemoCard>
      <RendersDemoCard label="text · built on click">
        <DownloadButton display="text" file={buildsNotes} fileName="notes.txt">
          Download notes
        </DownloadButton>
      </RendersDemoCard>
      <RendersExportMenuCard />
    </>
  )
}
