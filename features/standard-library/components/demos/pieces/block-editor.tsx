"use client"

import { BlockEditor } from "@/components/standard/block-editor"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const SAMPLE_PLAN = `
<h2>Kitchen remodel plan</h2>
<p>Demo starts <strong>Monday</strong>. Hover a block for the drag handle, or type <code>/</code> for more blocks.</p>
<ul>
  <li data-list-kind="task" data-list-checked=""><p>Order cabinets</p></li>
  <li data-list-kind="task"><p>Book the plumber for rough-in</p></li>
  <li data-list-kind="task"><p>Pick backsplash tile</p></li>
</ul>
<blockquote><p>Keep the dining room clear. It's the staging area.</p></blockquote>
<table>
  <tbody>
    <tr><th><p>Phase</p></th><th><p>Crew</p></th><th><p>Days</p></th></tr>
    <tr><td><p>Demolition</p></td><td><p>General</p></td><td><p>2</p></td></tr>
    <tr><td><p>Rough-in</p></td><td><p>Plumbing, electrical</p></td><td><p>4</p></td></tr>
  </tbody>
</table>
`

export function RendersBlockEditorDemo() {
  return (
    <>
      <RendersDemoCard label="With content">
        <BlockEditor defaultContent={SAMPLE_PLAN} />
      </RendersDemoCard>
      <RendersDemoCard label="Empty">
        <BlockEditor />
      </RendersDemoCard>
      <RendersDemoCard label="Read only">
        <BlockEditor
          defaultContent={SAMPLE_PLAN}
          editable={false}
          toolbar={false}
          contentClassName="min-h-0"
        />
      </RendersDemoCard>
    </>
  )
}
