"use client"

import * as React from "react"
import { defineBasicExtension, type BasicExtension } from "prosekit/basic"
import { createEditor, union, type NodeJSON } from "prosekit/core"
import { definePlaceholder } from "prosekit/extensions/placeholder"
import { ProseKit, useEditor } from "prosekit/react"
import { cn } from "cn"

import {
  EDITOR_FRAME_CLASS,
  EditorContent,
  EditorShell,
  useIsClient,
  useProseKitChange,
  useProseKitEditable,
  type ProseKitValue,
} from "@/components/standard/prosekit/editor-frame"
import { InlineFormatMenu } from "@/components/standard/prosekit/format"

export type InlineEditorValue = ProseKitValue

type InlineEditorProps = {
  className?: string
  contentClassName?: string
  placeholder?: string
  /** Initial document as HTML or ProseKit JSON. Read once on mount. */
  defaultContent?: string | NodeJSON
  onChange?: (value: InlineEditorValue) => void
  editable?: boolean
  /** `default` draws the field border; `ghost` edits in place with none. */
  tone?: "default" | "ghost"
  "aria-label"?: string
}

const GHOST_CLASS =
  "rounded-md border-transparent bg-transparent focus-within:ring-0 hover:bg-muted/40 dark:bg-transparent"

function EditorSync({
  onChange,
  editable,
}: {
  onChange?: (value: InlineEditorValue) => void
  editable: boolean
}) {
  const editor = useEditor<BasicExtension>()
  useProseKitChange(editor, onChange)
  useProseKitEditable(editor, editable)
  return null
}

/**
 * Rich text with no fixed toolbar: select text and a format menu with a link
 * field floats over it. Markdown shortcuts (#, -, >, **bold**) still work.
 */
function InlineEditor(props: InlineEditorProps) {
  const isClient = useIsClient()
  if (!isClient) {
    return (
      <EditorShell
        slot="inline-editor"
        className={cn(props.tone === "ghost" && GHOST_CLASS, props.className)}
        contentClassName={cn("min-h-24", props.contentClassName)}
      />
    )
  }
  return <InlineEditorClient {...props} />
}

function InlineEditorClient({
  className,
  contentClassName,
  placeholder = "Write something, then select text to format it…",
  defaultContent,
  onChange,
  editable = true,
  tone = "default",
  "aria-label": ariaLabel = "Rich text editor",
}: InlineEditorProps) {
  const [editor] = React.useState(() =>
    createEditor({
      extension: union(
        defineBasicExtension(),
        definePlaceholder({ placeholder, strategy: "doc" })
      ),
      defaultContent,
    })
  )

  return (
    <ProseKit editor={editor}>
      <div
        data-slot="inline-editor"
        data-editable={editable}
        data-tone={tone}
        className={cn(
          EDITOR_FRAME_CLASS,
          tone === "ghost" && GHOST_CLASS,
          className
        )}
      >
        <EditorContent
          editor={editor}
          aria-label={ariaLabel}
          className={cn("min-h-24", contentClassName)}
        />
        {editable ? <InlineFormatMenu /> : null}
        <EditorSync onChange={onChange} editable={editable} />
      </div>
    </ProseKit>
  )
}

export { InlineEditor }
