"use client"

import { MarkdownEditor } from "@/components/standard/markdown-editor"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const SAMPLE_README = `# Release notes

Version **2.4** ships the new *scheduling* view.

- [x] Drag to reschedule
- [ ] Recurring jobs

> Upgrade guide: run \`npm run migrate\` first.`

export function RendersMarkdownEditorDemo() {
  return (
    <>
      <RendersDemoCard label="Rich text">
        <MarkdownEditor defaultValue={SAMPLE_README} />
      </RendersDemoCard>
      <RendersDemoCard label="Side by side">
        <MarkdownEditor defaultValue={SAMPLE_README} defaultView="split" />
      </RendersDemoCard>
    </>
  )
}
