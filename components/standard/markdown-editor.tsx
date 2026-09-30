"use client"

import * as React from "react"
import { defineBasicExtension, type BasicExtension } from "prosekit/basic"
import { createEditor, union, type Editor } from "prosekit/core"
import { definePlaceholder } from "prosekit/extensions/placeholder"
import { ProseKit, useDocChange } from "prosekit/react"
import { Columns2Icon, FileCodeIcon, TypeIcon } from "lucide-react"
import { cn } from "cn"

import { useControllableState } from "@/hooks/use-controllable-state"
import {
  EDITOR_FRAME_CLASS,
  EditorContent,
  EditorShell,
  useIsClient,
  useProseKitEditable,
} from "@/components/standard/prosekit/editor-frame"
import {
  FormatToolbar,
  InlineFormatMenu,
  type BlockType,
  type MarkKey,
} from "@/components/standard/prosekit/format"
import {
  htmlFromMarkdown,
  markdownFromHtml,
} from "@/components/standard/prosekit/markdown"
import { ToolbarGroup, ToolbarToggle } from "@/components/standard/toolbar"

export type MarkdownEditorView = "rich" | "split" | "source"

type MarkdownEditorProps = {
  /** The document as Markdown. Pass it to control the editor. */
  value?: string
  defaultValue?: string
  onValueChange?: (markdown: string) => void
  /** Rich text, Markdown source, or both side by side. */
  view?: MarkdownEditorView
  defaultView?: MarkdownEditorView
  onViewChange?: (view: MarkdownEditorView) => void
  placeholder?: string
  editable?: boolean
  className?: string
  contentClassName?: string
  "aria-label"?: string
}

// Everything here round-trips through Markdown: no underline, no toggle lists.
const BLOCK_TYPES: BlockType[] = [
  "paragraph",
  "h1",
  "h2",
  "h3",
  "bullet",
  "ordered",
  "task",
  "quote",
  "code",
]
const MARKS: MarkKey[] = ["bold", "italic", "strike", "code"]

const VIEWS: {
  value: MarkdownEditorView
  label: string
  icon: React.ReactNode
}[] = [
  { value: "rich", label: "Rich text", icon: <TypeIcon /> },
  { value: "split", label: "Side by side", icon: <Columns2Icon /> },
  { value: "source", label: "Markdown source", icon: <FileCodeIcon /> },
]

const CONTENT_CLASS = "min-h-56"

/**
 * Rich text editing over a Markdown document: format with the toolbar or
 * Markdown shortcuts, or switch to the source and edit the Markdown directly.
 * `onValueChange` always receives Markdown.
 */
function MarkdownEditor(props: MarkdownEditorProps) {
  const isClient = useIsClient()
  if (!isClient) {
    return (
      <EditorShell
        slot="markdown-editor"
        className={props.className}
        contentClassName={cn(CONTENT_CLASS, props.contentClassName)}
        toolbar
      />
    )
  }
  return <MarkdownEditorClient {...props} />
}

function MarkdownEditorClient({
  value,
  defaultValue = "",
  onValueChange,
  view: viewProp,
  defaultView = "rich",
  onViewChange,
  placeholder = "Write Markdown, or format with the toolbar…",
  editable = true,
  className,
  contentClassName,
  "aria-label": ariaLabel = "Markdown editor",
}: MarkdownEditorProps) {
  const [markdown, setMarkdown] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const [view, setView] = useControllableState({
    value: viewProp,
    defaultValue: defaultView,
    onChange: onViewChange,
  })

  const [editor] = React.useState(() =>
    createEditor({
      extension: union(
        defineBasicExtension(),
        definePlaceholder({ placeholder, strategy: "doc" })
      ),
      defaultContent: htmlFromMarkdown(markdown),
    })
  )

  // The Markdown the editor last produced or was given. Anything else in
  // `markdown` came from outside (the source view or a controlling parent)
  // and gets loaded into the editor.
  const synced = React.useRef(markdown)
  const loading = React.useRef(false)

  function load(next: string) {
    synced.current = next
    loading.current = true
    editor.setContent(htmlFromMarkdown(next))
    loading.current = false
  }

  React.useEffect(() => {
    if (markdown !== synced.current) {
      load(markdown)
    }
  })

  const setMarkdownRef = React.useRef(setMarkdown)
  React.useEffect(() => {
    setMarkdownRef.current = setMarkdown
  })

  const handleDocChange = React.useCallback(() => {
    if (loading.current) {
      return
    }
    const next = markdownFromHtml(editor.getDocHTML())
    synced.current = next
    setMarkdownRef.current(next)
  }, [editor])
  useDocChange(handleDocChange, { editor })

  const showRich = view !== "source"
  const showSource = view !== "rich"

  return (
    <ProseKit editor={editor}>
      <div
        data-slot="markdown-editor"
        data-editable={editable}
        data-view={view}
        className={cn(EDITOR_FRAME_CLASS, className)}
      >
        <FormatToolbar
          blockTypes={BLOCK_TYPES}
          marks={MARKS}
          editable={editable && showRich}
          trailing={
            <ToolbarGroup aria-label="View">
              {VIEWS.map((item) => (
                <ToolbarToggle
                  key={item.value}
                  label={item.label}
                  hint={item.label}
                  pressed={view === item.value}
                  onPressedChange={() => setView(item.value)}
                >
                  {item.icon}
                </ToolbarToggle>
              ))}
            </ToolbarGroup>
          }
        />
        <div
          className={cn(
            "grid min-h-0 flex-1",
            view === "split" && "md:grid-cols-2"
          )}
        >
          <div className={cn("min-w-0", !showRich && "hidden")}>
            <EditorContent
              editor={editor}
              aria-label={ariaLabel}
              className={cn(CONTENT_CLASS, contentClassName)}
            />
          </div>
          {showSource ? (
            <SourceView
              value={markdown}
              editable={editable}
              split={view === "split"}
              className={contentClassName}
              onChange={setMarkdown}
            />
          ) : null}
        </div>
        {editable && showRich ? <InlineFormatMenu marks={MARKS} /> : null}
        <EditableSync editor={editor} editable={editable} />
      </div>
    </ProseKit>
  )
}

function EditableSync({
  editor,
  editable,
}: {
  editor: Editor<BasicExtension>
  editable: boolean
}) {
  useProseKitEditable(editor, editable)
  return null
}

function SourceView({
  value,
  editable,
  split,
  className,
  onChange,
}: {
  value: string
  editable: boolean
  split: boolean
  className?: string
  onChange: (value: string) => void
}) {
  return (
    <textarea
      aria-label="Markdown source"
      spellCheck={false}
      readOnly={!editable}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={cn(
        "min-h-56 w-full resize-none bg-transparent px-3 py-2 font-mono text-xs leading-relaxed outline-none",
        split && "border-t border-border md:border-t-0 md:border-l",
        className
      )}
    />
  )
}

export { MarkdownEditor }
