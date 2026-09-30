"use client"

import * as React from "react"
import { defineBasicExtension, type BasicExtension } from "prosekit/basic"
import { createEditor, union, type NodeJSON } from "prosekit/core"
import { definePlaceholder } from "prosekit/extensions/placeholder"
import { TextSelection } from "prosekit/pm/state"
import { ProseKit, useEditor, useEditorDerivedValue } from "prosekit/react"
import {
  IndentDecreaseIcon,
  IndentIncreaseIcon,
  MinusIcon,
  TableIcon,
} from "lucide-react"
import { cn } from "cn"

import {
  BlockHandle,
  DropIndicator,
  TableHandle,
} from "@/components/standard/prosekit/block-handles"
import {
  EDITOR_FRAME_CLASS,
  EditorContent,
  EditorShell,
  useIsClient,
  useProseKitChange,
  useProseKitEditable,
  type ProseKitValue,
} from "@/components/standard/prosekit/editor-frame"
import {
  BLOCK_OPTIONS,
  FormatToolbar,
  InlineFormatMenu,
  applyBlockType,
  type BasicEditor,
} from "@/components/standard/prosekit/format"
import {
  SuggestionMenu,
  suggestionTrigger,
  type SuggestionItem,
} from "@/components/standard/prosekit/suggestion-menu"
import {
  ToolbarButton,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/standard/toolbar"

export type BlockEditorValue = ProseKitValue

const SLASH = suggestionTrigger("/")

/** Inserts a 3×3 table with a header row and puts the cursor in its first cell. */
function insertTable(editor: BasicEditor) {
  const start = editor.state.selection.from
  editor.commands.insertTable({ row: 3, col: 3, header: true })

  const { state } = editor
  let cell = -1
  state.doc.nodesBetween(
    Math.max(0, start - 1),
    state.doc.content.size,
    (node, pos) => {
      if (cell >= 0) {
        return false
      }
      const role = node.type.spec.tableRole
      if (role === "cell" || role === "header_cell") {
        cell = pos
        return false
      }
      return true
    }
  )
  if (cell >= 0) {
    const selection = TextSelection.near(state.doc.resolve(cell + 1))
    editor.view.dispatch(state.tr.setSelection(selection))
  }
}

function slashItems(editor: BasicEditor): SuggestionItem[] {
  const blocks: SuggestionItem[] = BLOCK_OPTIONS.map((option) => ({
    value: option.label,
    label: option.label,
    leading: option.icon,
    hint: option.hint,
    onSelect: () => applyBlockType(editor, option.value),
  }))
  return [
    ...blocks,
    {
      value: "Table",
      label: "Table",
      leading: <TableIcon />,
      onSelect: () => insertTable(editor),
    },
    {
      value: "Divider",
      label: "Divider",
      leading: <MinusIcon />,
      hint: "---",
      onSelect: () => editor.commands.insertHorizontalRule(),
    },
  ]
}

function SlashMenu() {
  const editor = useEditor<BasicExtension>()
  const items = React.useMemo(() => slashItems(editor), [editor])
  return <SuggestionMenu trigger={SLASH} items={items} />
}

function readInsertState(editor: BasicEditor) {
  return {
    canIndent: editor.commands.indentList.canExec(),
    canDedent: editor.commands.dedentList.canExec(),
  }
}

function InsertGroups({ editable }: { editable: boolean }) {
  const editor = useEditor<BasicExtension>()
  const state = useEditorDerivedValue(readInsertState)

  function run(command: () => void) {
    command()
    editor.focus()
  }

  return (
    <>
      <ToolbarSeparator />
      <ToolbarGroup aria-label="List indent">
        <ToolbarButton
          label="Outdent"
          hint="Outdent (Shift+Tab)"
          disabled={!editable || !state.canDedent}
          onClick={() => run(() => editor.commands.dedentList())}
        >
          <IndentDecreaseIcon />
        </ToolbarButton>
        <ToolbarButton
          label="Indent"
          hint="Indent (Tab)"
          disabled={!editable || !state.canIndent}
          onClick={() => run(() => editor.commands.indentList())}
        >
          <IndentIncreaseIcon />
        </ToolbarButton>
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup aria-label="Insert">
        <ToolbarButton
          label="Insert table"
          hint="Insert table"
          disabled={!editable}
          onClick={() => run(() => insertTable(editor))}
        >
          <TableIcon />
        </ToolbarButton>
        <ToolbarButton
          label="Insert divider"
          hint="Insert divider"
          disabled={!editable}
          onClick={() => run(() => editor.commands.insertHorizontalRule())}
        >
          <MinusIcon />
        </ToolbarButton>
      </ToolbarGroup>
    </>
  )
}

type BlockEditorProps = {
  className?: string
  contentClassName?: string
  placeholder?: string
  /** Initial document as HTML or ProseKit JSON. Read once on mount. */
  defaultContent?: string | NodeJSON
  onChange?: (value: BlockEditorValue) => void
  editable?: boolean
  toolbar?: boolean
  "aria-label"?: string
}

// The left gutter holds the block handle.
const CONTENT_CLASS = "min-h-56 py-4 pr-4 pl-14"

function EditorSync({
  onChange,
  editable,
}: {
  onChange?: (value: BlockEditorValue) => void
  editable: boolean
}) {
  const editor = useEditor<BasicExtension>()
  useProseKitChange(editor, onChange)
  useProseKitEditable(editor, editable)
  return null
}

/**
 * Notion-style document editor on ProseKit: a Standard Toolbar, a "/" menu,
 * a format menu over selections, drag handles to reorder blocks, task and
 * toggle lists, tables and code blocks.
 */
function BlockEditor(props: BlockEditorProps) {
  const isClient = useIsClient()
  if (!isClient) {
    return (
      <EditorShell
        slot="block-editor"
        className={props.className}
        contentClassName={cn(CONTENT_CLASS, props.contentClassName)}
        toolbar={props.toolbar ?? true}
      />
    )
  }
  return <BlockEditorClient {...props} />
}

function BlockEditorClient({
  className,
  contentClassName,
  placeholder = "Type / for commands…",
  defaultContent,
  onChange,
  editable = true,
  toolbar = true,
  "aria-label": ariaLabel = "Document editor",
}: BlockEditorProps) {
  const [editor] = React.useState(() =>
    createEditor({
      extension: union(
        defineBasicExtension(),
        definePlaceholder({ placeholder, strategy: "block" })
      ),
      defaultContent,
    })
  )

  return (
    <ProseKit editor={editor}>
      <div
        data-slot="block-editor"
        data-editable={editable}
        className={cn(EDITOR_FRAME_CLASS, className)}
      >
        {toolbar ? (
          <FormatToolbar editable={editable}>
            <InsertGroups editable={editable} />
          </FormatToolbar>
        ) : null}
        <EditorContent
          editor={editor}
          aria-label={ariaLabel}
          className={cn(CONTENT_CLASS, contentClassName)}
        />
        {editable ? (
          <>
            <SlashMenu />
            <InlineFormatMenu />
            <BlockHandle />
            <TableHandle />
            <DropIndicator />
          </>
        ) : null}
        <EditorSync onChange={onChange} editable={editable} />
      </div>
    </ProseKit>
  )
}

export { BlockEditor }
