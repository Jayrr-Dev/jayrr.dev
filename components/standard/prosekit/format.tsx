"use client"

import * as React from "react"
import type { BasicExtension } from "prosekit/basic"
import type { Editor } from "prosekit/core"
import { useEditor, useEditorDerivedValue } from "prosekit/react"
import {
  InlinePopoverPopup,
  InlinePopoverPositioner,
  InlinePopoverRoot,
} from "prosekit/react/inline-popover"
import {
  BoldIcon,
  CodeIcon,
  CodeXmlIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ItalicIcon,
  LinkIcon,
  ListChecksIcon,
  ListCollapseIcon,
  ListIcon,
  ListOrderedIcon,
  PilcrowIcon,
  QuoteIcon,
  Redo2Icon,
  StrikethroughIcon,
  UnderlineIcon,
  Undo2Icon,
} from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/standard/button"
import {
  POPUP_CLASS,
  POSITIONER_CLASS,
} from "@/components/standard/prosekit/editor-frame"
import { Select, type SelectOption } from "@/components/standard/select"
import { TextField } from "@/components/standard/text-field"
import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarSeparator,
  ToolbarToggle,
} from "@/components/standard/toolbar"

export type BasicEditor = Editor<BasicExtension>

export type BlockType =
  | "paragraph"
  | "h1"
  | "h2"
  | "h3"
  | "bullet"
  | "ordered"
  | "task"
  | "toggle"
  | "quote"
  | "code"

type ListKind = "bullet" | "ordered" | "task" | "toggle"

const LIST_KINDS: ListKind[] = ["bullet", "ordered", "task", "toggle"]
const HEADING_LEVELS = { h1: 1, h2: 2, h3: 3 } as const

function isListKind(type: BlockType): type is ListKind {
  return (LIST_KINDS as BlockType[]).includes(type)
}

export const BLOCK_OPTIONS: (SelectOption & {
  value: BlockType
  hint: string
})[] = [
  { value: "paragraph", label: "Text", hint: "", icon: <PilcrowIcon /> },
  { value: "h1", label: "Heading 1", hint: "#", icon: <Heading1Icon /> },
  { value: "h2", label: "Heading 2", hint: "##", icon: <Heading2Icon /> },
  { value: "h3", label: "Heading 3", hint: "###", icon: <Heading3Icon /> },
  { value: "bullet", label: "Bulleted list", hint: "-", icon: <ListIcon /> },
  {
    value: "ordered",
    label: "Numbered list",
    hint: "1.",
    icon: <ListOrderedIcon />,
  },
  { value: "task", label: "Task list", hint: "[]", icon: <ListChecksIcon /> },
  {
    value: "toggle",
    label: "Toggle list",
    hint: ">>",
    icon: <ListCollapseIcon />,
  },
  { value: "quote", label: "Quote", hint: ">", icon: <QuoteIcon /> },
  { value: "code", label: "Code block", hint: "```", icon: <CodeXmlIcon /> },
]

export function readBlockType(editor: BasicEditor): BlockType {
  const { nodes } = editor
  if (nodes.codeBlock.isActive()) {
    return "code"
  }
  for (const [type, level] of Object.entries(HEADING_LEVELS)) {
    if (nodes.heading.isActive({ level })) {
      return type as BlockType
    }
  }
  const kind = LIST_KINDS.find((item) => nodes.list.isActive({ kind: item }))
  if (kind) {
    return kind
  }
  return nodes.blockquote.isActive() ? "quote" : "paragraph"
}

/** Turns the blocks in the selection into `next`, unwrapping lists and quotes first. */
export function applyBlockType(editor: BasicEditor, next: BlockType) {
  const current = readBlockType(editor)
  const { commands } = editor
  if (current === next) {
    return
  }
  if (isListKind(current)) {
    commands.unwrapList()
  } else if (current === "quote") {
    commands.toggleBlockquote()
  }

  if (next === "code") {
    commands.setCodeBlock()
    return
  }
  if (next === "h1" || next === "h2" || next === "h3") {
    commands.setHeading({ level: HEADING_LEVELS[next] })
    return
  }
  commands.setParagraph()
  if (isListKind(next)) {
    commands.wrapInList({ kind: next })
  } else if (next === "quote") {
    commands.setBlockquote()
  }
}

export type MarkKey = "bold" | "italic" | "underline" | "strike" | "code"

const MARKS: {
  key: MarkKey
  label: string
  hint: string
  icon: React.ReactNode
  toggle: (editor: BasicEditor) => void
}[] = [
  {
    key: "bold",
    label: "Bold",
    hint: "Bold (Ctrl+B)",
    icon: <BoldIcon />,
    toggle: (editor) => editor.commands.toggleBold(),
  },
  {
    key: "italic",
    label: "Italic",
    hint: "Italic (Ctrl+I)",
    icon: <ItalicIcon />,
    toggle: (editor) => editor.commands.toggleItalic(),
  },
  {
    key: "underline",
    label: "Underline",
    hint: "Underline (Ctrl+U)",
    icon: <UnderlineIcon />,
    toggle: (editor) => editor.commands.toggleUnderline(),
  },
  {
    key: "strike",
    label: "Strikethrough",
    hint: "Strikethrough (Ctrl+Shift+S)",
    icon: <StrikethroughIcon />,
    toggle: (editor) => editor.commands.toggleStrike(),
  },
  {
    key: "code",
    label: "Inline code",
    hint: "Inline code (Ctrl+E)",
    icon: <CodeIcon />,
    toggle: (editor) => editor.commands.toggleCode(),
  },
]

function pickMarks(keys: MarkKey[] | undefined) {
  return keys ? MARKS.filter((mark) => keys.includes(mark.key)) : MARKS
}

function readLinkHref(editor: BasicEditor): string | undefined {
  const { $from, empty } = editor.state.selection
  const marks = empty ? $from.marks() : ($from.nodeAfter?.marks ?? [])
  const link = marks.find((mark) => mark.type.name === "link")
  return link ? String(link.attrs.href) : undefined
}

// Derived from the editor on every state change; keep it outside components.
function readFormatState(editor: BasicEditor) {
  const marks = {} as Record<MarkKey, boolean>
  for (const mark of MARKS) {
    marks[mark.key] = editor.marks[mark.key].isActive()
  }
  return {
    blockType: readBlockType(editor),
    marks,
    canUndo: editor.commands.undo.canExec(),
    canRedo: editor.commands.redo.canExec(),
    canLink: editor.commands.addLink.canExec({ href: "" }),
    href: readLinkHref(editor),
  }
}

function useFormatState() {
  return useEditorDerivedValue(readFormatState)
}

/**
 * Block type, history and text formats on the Standard Toolbar. `children`
 * adds groups after them (insert buttons, list indent).
 */
export function FormatToolbar({
  blockTypes,
  marks,
  editable = true,
  trailing,
  children,
}: {
  /** Which block types the Select offers. Defaults to all of them. */
  blockTypes?: BlockType[]
  /** Which text formats get a toggle. Defaults to all of them. */
  marks?: MarkKey[]
  editable?: boolean
  /** Pushed to the end of the bar, e.g. a view toggle. */
  trailing?: React.ReactNode
  children?: React.ReactNode
}) {
  const editor = useEditor<BasicExtension>()
  const state = useFormatState()
  const options = blockTypes
    ? BLOCK_OPTIONS.filter((option) => blockTypes.includes(option.value))
    : BLOCK_OPTIONS

  function run(command: () => void) {
    command()
    editor.focus()
  }

  return (
    <Toolbar aria-label="Formatting" className="rounded-t-lg">
      <Select
        appearance="toolbar"
        size="default"
        aria-label="Block type"
        placeholder="Block type"
        options={options}
        value={state.blockType}
        onValueChange={(next) =>
          run(() => applyBlockType(editor, next as BlockType))
        }
        disabled={!editable}
      />
      <ToolbarSeparator />
      <ToolbarGroup aria-label="History">
        <ToolbarButton
          label="Undo"
          hint="Undo (Ctrl+Z)"
          disabled={!editable || !state.canUndo}
          onClick={() => run(() => editor.commands.undo())}
        >
          <Undo2Icon />
        </ToolbarButton>
        <ToolbarButton
          label="Redo"
          hint="Redo (Ctrl+Shift+Z)"
          disabled={!editable || !state.canRedo}
          onClick={() => run(() => editor.commands.redo())}
        >
          <Redo2Icon />
        </ToolbarButton>
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup aria-label="Text format">
        {pickMarks(marks).map((mark) => (
          <ToolbarToggle
            key={mark.key}
            label={mark.label}
            hint={mark.hint}
            disabled={!editable}
            pressed={state.marks[mark.key]}
            onPressedChange={() => run(() => mark.toggle(editor))}
          >
            {mark.icon}
          </ToolbarToggle>
        ))}
      </ToolbarGroup>
      {children}
      {trailing ? (
        <div className="ml-auto flex items-center">{trailing}</div>
      ) : null}
    </Toolbar>
  )
}

/**
 * Text formats and a link field that float over the selection. Clicks on the
 * bar don't take focus, so the selection stays put.
 */
export function InlineFormatMenu({ marks }: { marks?: MarkKey[] }) {
  const editor = useEditor<BasicExtension>()
  const state = useFormatState()
  const [linkOpen, setLinkOpen] = React.useState(false)
  const linkInput = React.useRef<HTMLInputElement>(null)

  // The popover shows a few frames after it renders, and a hidden input can't
  // take focus, so keep trying until it does.
  React.useEffect(() => {
    if (!linkOpen) {
      return
    }
    let timer = 0
    let tries = 0
    const focusInput = () => {
      const input = linkInput.current
      input?.focus()
      if (input && document.activeElement !== input && ++tries < 20) {
        timer = window.setTimeout(focusInput, 16)
      }
    }
    timer = window.setTimeout(focusInput, 0)
    return () => window.clearTimeout(timer)
  }, [linkOpen])

  function saveLink(href: string) {
    if (href) {
      editor.commands.addLink({ href })
    } else {
      editor.commands.removeLink()
    }
    setLinkOpen(false)
    editor.focus()
  }

  return (
    <>
      <InlinePopoverRoot
        onOpenChange={(event) => {
          if (!event.detail) {
            setLinkOpen(false)
          }
        }}
      >
        <InlinePopoverPositioner className={POSITIONER_CLASS}>
          <InlinePopoverPopup
            className={cn(POPUP_CLASS, "flex-row items-center gap-0.5")}
            onMouseDown={(event) => event.preventDefault()}
          >
            <ToolbarGroup aria-label="Text format">
              {pickMarks(marks).map((mark) => (
                <ToolbarToggle
                  key={mark.key}
                  label={mark.label}
                  pressed={state.marks[mark.key]}
                  onPressedChange={() => mark.toggle(editor)}
                >
                  {mark.icon}
                </ToolbarToggle>
              ))}
            </ToolbarGroup>
            {state.canLink ? (
              <>
                <ToolbarSeparator />
                <ToolbarToggle
                  label="Link"
                  pressed={state.href !== undefined || linkOpen}
                  onPressedChange={() => {
                    if (!linkOpen) {
                      editor.commands.expandLink()
                    }
                    setLinkOpen(!linkOpen)
                  }}
                >
                  <LinkIcon />
                </ToolbarToggle>
              </>
            ) : null}
          </InlinePopoverPopup>
        </InlinePopoverPositioner>
      </InlinePopoverRoot>

      <InlinePopoverRoot
        defaultOpen={false}
        open={linkOpen}
        onOpenChange={(event) => setLinkOpen(event.detail)}
      >
        <InlinePopoverPositioner
          placement="bottom"
          className={POSITIONER_CLASS}
        >
          <InlinePopoverPopup className={cn(POPUP_CLASS, "w-72 p-2")}>
            {linkOpen ? (
              <form
                className="flex items-center gap-1.5"
                onSubmit={(event) => {
                  event.preventDefault()
                  const input = event.currentTarget.elements.namedItem("href")
                  saveLink(
                    input instanceof HTMLInputElement ? input.value.trim() : ""
                  )
                }}
              >
                <TextField
                  name="href"
                  type="url"
                  aria-label="Link address"
                  placeholder="Paste a link…"
                  defaultValue={state.href}
                  ref={linkInput}
                  className="flex-1"
                />
                {state.href !== undefined ? (
                  <Button
                    type="button"
                    tone="ghost"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => saveLink("")}
                  >
                    Remove
                  </Button>
                ) : null}
              </form>
            ) : null}
          </InlinePopoverPopup>
        </InlinePopoverPositioner>
      </InlinePopoverRoot>
    </>
  )
}
