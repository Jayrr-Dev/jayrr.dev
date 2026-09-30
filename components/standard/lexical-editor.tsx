"use client"

import * as React from "react"
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
  type EditorThemeClasses,
  type ElementFormatType,
  type TextFormatType,
} from "lexical"
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  BOLD_ITALIC_STAR,
  BOLD_STAR,
  HEADING,
  INLINE_CODE,
  ITALIC_STAR,
  ITALIC_UNDERSCORE,
  ORDERED_LIST,
  QUOTE,
  STRIKETHROUGH,
  UNORDERED_LIST,
  type Transformer,
} from "@lexical/markdown"
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListItemNode,
  ListNode,
} from "@lexical/list"
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
  HeadingNode,
  QuoteNode,
} from "@lexical/rich-text"
import { $setBlocksType } from "@lexical/selection"
import {
  $findMatchingParent,
  $getNearestNodeOfType,
  mergeRegister,
} from "@lexical/utils"
import { LexicalComposer } from "@lexical/react/LexicalComposer"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { ContentEditable } from "@lexical/react/LexicalContentEditable"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { ListPlugin } from "@lexical/react/LexicalListPlugin"
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin"
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import { useLexicalEditable } from "@lexical/react/useLexicalEditable"
import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  CodeIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ItalicIcon,
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

import { Select, type SelectOption } from "@/components/standard/select"
import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarSeparator,
  ToolbarToggle,
} from "@/components/standard/toolbar"

export type LexicalEditorValue = {
  json: string
  markdown: string
  text: string
}

type BlockType =
  "paragraph" | "h1" | "h2" | "h3" | "quote" | "bullet" | "number"

const TRANSFORMERS: Transformer[] = [
  HEADING,
  QUOTE,
  UNORDERED_LIST,
  ORDERED_LIST,
  BOLD_ITALIC_STAR,
  BOLD_STAR,
  ITALIC_STAR,
  ITALIC_UNDERSCORE,
  STRIKETHROUGH,
  INLINE_CODE,
]

const THEME: EditorThemeClasses = {
  paragraph: "my-1",
  heading: {
    h1: "mt-3 mb-2 text-2xl font-semibold tracking-tight first:mt-0",
    h2: "mt-3 mb-2 text-xl font-semibold tracking-tight first:mt-0",
    h3: "mt-2 mb-1 text-lg font-semibold first:mt-0",
  },
  quote: "my-2 border-l-2 border-border pl-3 text-muted-foreground",
  list: {
    ul: "my-1 list-disc pl-6",
    ol: "my-1 list-decimal pl-6",
    listitem: "my-0.5",
    nested: { listitem: "list-none" },
  },
  text: {
    bold: "font-semibold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
    underlineStrikethrough: "[text-decoration:underline_line-through]",
    code: "rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]",
  },
}

const BLOCK_OPTIONS: (SelectOption & { value: BlockType })[] = [
  { value: "paragraph", label: "Normal", icon: <PilcrowIcon /> },
  { value: "h1", label: "Heading 1", icon: <Heading1Icon /> },
  { value: "h2", label: "Heading 2", icon: <Heading2Icon /> },
  { value: "h3", label: "Heading 3", icon: <Heading3Icon /> },
  { value: "bullet", label: "Bulleted list", icon: <ListIcon /> },
  { value: "number", label: "Numbered list", icon: <ListOrderedIcon /> },
  { value: "quote", label: "Quote", icon: <QuoteIcon /> },
]

const TEXT_FORMATS: {
  format: TextFormatType
  label: string
  hint: string
  icon: React.ReactNode
}[] = [
  { format: "bold", label: "Bold", hint: "Bold (Ctrl+B)", icon: <BoldIcon /> },
  {
    format: "italic",
    label: "Italic",
    hint: "Italic (Ctrl+I)",
    icon: <ItalicIcon />,
  },
  {
    format: "underline",
    label: "Underline",
    hint: "Underline (Ctrl+U)",
    icon: <UnderlineIcon />,
  },
  {
    format: "strikethrough",
    label: "Strikethrough",
    hint: "Strikethrough",
    icon: <StrikethroughIcon />,
  },
  {
    format: "code",
    label: "Inline code",
    hint: "Inline code",
    icon: <CodeIcon />,
  },
]

const ALIGNMENTS: {
  format: ElementFormatType
  label: string
  icon: React.ReactNode
}[] = [
  { format: "left", label: "Align left", icon: <AlignLeftIcon /> },
  { format: "center", label: "Align center", icon: <AlignCenterIcon /> },
  { format: "right", label: "Align right", icon: <AlignRightIcon /> },
  { format: "justify", label: "Justify", icon: <AlignJustifyIcon /> },
]

type ToolbarState = {
  blockType: BlockType
  alignment: ElementFormatType
  formats: Set<TextFormatType>
}

const EMPTY_STATE: ToolbarState = {
  blockType: "paragraph",
  alignment: "left",
  formats: new Set(),
}

function $readToolbarState(): ToolbarState | null {
  const selection = $getSelection()
  if (!$isRangeSelection(selection)) {
    return null
  }

  const anchor = selection.anchor.getNode()
  const topLevel =
    anchor.getKey() === "root"
      ? anchor
      : ($findMatchingParent(anchor, (node) => {
          const parent = node.getParent()
          return parent !== null && $isRootOrShadowRoot(parent)
        }) ?? anchor.getTopLevelElementOrThrow())

  let blockType: BlockType = "paragraph"
  if ($isListNode(topLevel)) {
    const list = $getNearestNodeOfType(anchor, ListNode) ?? topLevel
    blockType = list.getListType() === "number" ? "number" : "bullet"
  } else if ($isHeadingNode(topLevel)) {
    const tag = topLevel.getTag()
    blockType = tag === "h1" || tag === "h2" ? tag : "h3"
  } else if ($isQuoteNode(topLevel)) {
    blockType = "quote"
  }

  const block = $isElementNode(anchor)
    ? anchor
    : $findMatchingParent(
        anchor,
        (node) => $isElementNode(node) && !node.isInline()
      )
  const alignment =
    block && $isElementNode(block) ? block.getFormatType() || "left" : "left"

  const formats = new Set<TextFormatType>(
    TEXT_FORMATS.map((item) => item.format).filter((format) =>
      selection.hasFormat(format)
    )
  )

  return { blockType, alignment, formats }
}

function EditorToolbar() {
  const [editor] = useLexicalComposerContext()
  const editable = useLexicalEditable()
  const [state, setState] = React.useState<ToolbarState>(EMPTY_STATE)
  const [canUndo, setCanUndo] = React.useState(false)
  const [canRedo, setCanRedo] = React.useState(false)

  React.useEffect(() => {
    function sync() {
      const next = $readToolbarState()
      if (next) {
        setState(next)
      }
    }

    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(sync)
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          sync()
          return false
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload)
          return false
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload)
          return false
        },
        COMMAND_PRIORITY_LOW
      )
    )
  }, [editor])

  function formatBlock(next: string) {
    const type = next as BlockType
    if (type === state.blockType) {
      editor.focus()
      return
    }

    if (type === "bullet") {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
    } else if (type === "number") {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
    } else {
      editor.update(() => {
        const selection = $getSelection()
        $setBlocksType(selection, () => {
          if (type === "quote") {
            return $createQuoteNode()
          }
          if (type === "paragraph") {
            return $createParagraphNode()
          }
          return $createHeadingNode(type)
        })
      })
    }
    editor.focus()
  }

  return (
    <Toolbar aria-label="Formatting">
      <Select
        appearance="toolbar"
        size="default"
        aria-label="Block type"
        placeholder="Block type"
        options={BLOCK_OPTIONS}
        value={state.blockType}
        onValueChange={formatBlock}
        disabled={!editable}
      />
      <ToolbarSeparator />
      <ToolbarGroup aria-label="History">
        <ToolbarButton
          label="Undo"
          hint="Undo (Ctrl+Z)"
          disabled={!editable || !canUndo}
          onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        >
          <Undo2Icon />
        </ToolbarButton>
        <ToolbarButton
          label="Redo"
          hint="Redo (Ctrl+Y)"
          disabled={!editable || !canRedo}
          onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        >
          <Redo2Icon />
        </ToolbarButton>
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup aria-label="Text format">
        {TEXT_FORMATS.map((item) => (
          <ToolbarToggle
            key={item.format}
            label={item.label}
            hint={item.hint}
            disabled={!editable}
            pressed={state.formats.has(item.format)}
            onPressedChange={() =>
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, item.format)
            }
          >
            {item.icon}
          </ToolbarToggle>
        ))}
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup aria-label="Alignment">
        {ALIGNMENTS.map((item) => (
          <ToolbarToggle
            key={item.format}
            label={item.label}
            hint={item.label}
            disabled={!editable}
            pressed={state.alignment === item.format}
            onPressedChange={() =>
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, item.format)
            }
          >
            {item.icon}
          </ToolbarToggle>
        ))}
      </ToolbarGroup>
    </Toolbar>
  )
}

function EditablePlugin({ editable }: { editable: boolean }) {
  const [editor] = useLexicalComposerContext()

  React.useEffect(() => {
    editor.setEditable(editable)
  }, [editor, editable])

  return null
}

const subscribeNever = () => () => {}

/** Lexical only builds its editor state in the browser, so SSR renders a same-size shell. */
function useIsClient() {
  return React.useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false
  )
}

function LexicalEditor({
  className,
  contentClassName,
  placeholder = "Enter some text...",
  defaultValue,
  defaultState,
  onChange,
  editable = true,
  toolbar = true,
  namespace = "LexicalEditor",
  "aria-label": ariaLabel = "Rich text editor",
}: {
  className?: string
  contentClassName?: string
  placeholder?: string
  /** Initial content as Markdown. Ignored when `defaultState` is set. */
  defaultValue?: string
  /** Initial content as a serialized Lexical editor state (JSON string). */
  defaultState?: string
  onChange?: (value: LexicalEditorValue) => void
  editable?: boolean
  toolbar?: boolean
  namespace?: string
  "aria-label"?: string
}) {
  const [initialConfig] = React.useState(() => ({
    namespace,
    theme: THEME,
    editable,
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode],
    editorState:
      defaultState ??
      (defaultValue
        ? () => $convertFromMarkdownString(defaultValue, TRANSFORMERS)
        : undefined),
    onError(error: Error) {
      console.error(error)
    },
  }))
  const isClient = useIsClient()
  const frameClassName = cn(
    "flex w-full flex-col overflow-hidden rounded-lg border border-input bg-transparent text-sm focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30",
    className
  )

  if (!isClient) {
    return (
      <div
        data-slot="lexical-editor"
        data-editable={editable}
        aria-busy="true"
        className={frameClassName}
      >
        {toolbar ? <Toolbar aria-label="Formatting" className="h-10" /> : null}
        <div className={cn("min-h-40 px-3 py-2", contentClassName)} />
      </div>
    )
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div
        data-slot="lexical-editor"
        data-editable={editable}
        className={frameClassName}
      >
        {toolbar ? <EditorToolbar /> : null}
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                aria-label={ariaLabel}
                aria-placeholder={placeholder}
                placeholder={
                  <div className="pointer-events-none absolute top-3 left-3 text-muted-foreground select-none">
                    {placeholder}
                  </div>
                }
                className={cn(
                  "min-h-40 px-3 py-2 leading-relaxed outline-none",
                  contentClassName
                )}
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <ListPlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        <EditablePlugin editable={editable} />
        {onChange ? (
          <OnChangePlugin
            ignoreSelectionChange
            onChange={(editorState) => {
              editorState.read(() => {
                onChange({
                  json: JSON.stringify(editorState.toJSON()),
                  markdown: $convertToMarkdownString(TRANSFORMERS),
                  text: $getRoot().getTextContent(),
                })
              })
            }}
          />
        ) : null}
      </div>
    </LexicalComposer>
  )
}

export { LexicalEditor }
