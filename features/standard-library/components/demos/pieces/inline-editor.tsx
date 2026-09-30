"use client"

import { InlineEditor } from "@/components/standard/inline-editor"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const SAMPLE_NOTE = `<p>Select any of this text and a <strong>format menu</strong> appears above it. Use the link button to add a <a href="https://prosekit.dev">link</a>.</p>`

export function RendersInlineEditorDemo() {
  return (
    <>
      <RendersDemoCard label="Default">
        <InlineEditor defaultContent={SAMPLE_NOTE} />
      </RendersDemoCard>
      <RendersDemoCard label="Ghost">
        <InlineEditor
          tone="ghost"
          defaultContent="<h3>Untitled note</h3><p>Click to edit in place.</p>"
        />
      </RendersDemoCard>
      <RendersDemoCard label="Empty">
        <InlineEditor />
      </RendersDemoCard>
    </>
  )
}
