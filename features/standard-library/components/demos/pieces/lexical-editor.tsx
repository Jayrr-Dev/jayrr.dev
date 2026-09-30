"use client"

import { LexicalEditor } from "@/components/standard/lexical-editor"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const SAMPLE_NOTES = `## Site walk notes

Crew arrived **on time**. Main floor framing is *complete*; waiting on the \`east wall\` inspection.

- Order extra drywall
- Confirm electrician for Friday

> Keep the loading dock clear after 3pm.`

export function RendersLexicalEditorDemo() {
  return (
    <>
      <RendersDemoCard label="Empty">
        <LexicalEditor />
      </RendersDemoCard>
      <RendersDemoCard label="With content">
        <LexicalEditor defaultValue={SAMPLE_NOTES} />
      </RendersDemoCard>
      <RendersDemoCard label="Read only">
        <LexicalEditor
          defaultValue={SAMPLE_NOTES}
          editable={false}
          toolbar={false}
          contentClassName="min-h-0"
        />
      </RendersDemoCard>
    </>
  )
}
