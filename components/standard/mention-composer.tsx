"use client"

import * as React from "react"
import { defineBasicExtension, type BasicExtension } from "prosekit/basic"
import {
  Priority,
  createEditor,
  union,
  type Editor,
  type Union,
} from "prosekit/core"
import {
  defineMention,
  type MentionAttrs,
  type MentionExtension,
} from "prosekit/extensions/mention"
import { definePlaceholder } from "prosekit/extensions/placeholder"
import {
  ProseKit,
  useEditor,
  useEditorDerivedValue,
  useKeymap,
} from "prosekit/react"
import { HashIcon, SendHorizontalIcon } from "lucide-react"
import { cn } from "cn"

import { Avatar } from "@/components/standard/avatar"
import { Button } from "@/components/standard/button"
import {
  EDITOR_FRAME_CLASS,
  EditorContent,
  EditorShell,
  readProseKitValue,
  useIsClient,
  useProseKitChange,
  type ProseKitValue,
} from "@/components/standard/prosekit/editor-frame"
import {
  SuggestionMenu,
  suggestionTrigger,
  type SuggestionItem,
} from "@/components/standard/prosekit/suggestion-menu"

export type MentionUser = { id: string; name: string; avatar?: string }
export type MentionTag = { id: string; label: string }
export type { MentionAttrs }

export type MentionComposerValue = ProseKitValue & {
  /** Every @user and #tag in the message, in order. */
  mentions: MentionAttrs[]
}

type ComposerEditor = Editor<Union<[BasicExtension, MentionExtension]>>

type MentionComposerProps = {
  users?: MentionUser[]
  tags?: MentionTag[]
  placeholder?: string
  /** Called on Enter or the send button. Shift+Enter adds a line break. */
  onSubmit?: (value: MentionComposerValue) => void
  onChange?: (value: MentionComposerValue) => void
  /** Empty the composer after a submit. */
  clearOnSubmit?: boolean
  disabled?: boolean
  /** Before the text, e.g. an attach button. */
  leading?: React.ReactNode
  /** Beside the send button, e.g. an emoji picker. */
  trailing?: React.ReactNode
  className?: string
  "aria-label"?: string
}

const USER_TRIGGER = suggestionTrigger("@")
const TAG_TRIGGER = suggestionTrigger("#")
const EMPTY_DOC = { type: "doc", content: [{ type: "paragraph" }] }

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
}

function readComposerValue(editor: ComposerEditor): MentionComposerValue {
  const mentions: MentionAttrs[] = []
  editor.state.doc.descendants((node) => {
    if (node.type.name === "mention") {
      mentions.push(node.attrs as MentionAttrs)
    }
  })
  const value = readProseKitValue(editor)
  // A picked mention leaves a trailing space behind it.
  return { ...value, text: value.text.trim(), mentions }
}

/** No text and no mentions; line breaks alone don't count. */
function readIsEmpty(editor: ComposerEditor) {
  let empty = true
  editor.state.doc.descendants((node) => {
    if (node.isText ? node.text?.trim() : node.type.name === "mention") {
      empty = false
    }
    return empty
  })
  return empty
}

function MentionMenus({
  users,
  tags,
  onOpenChange,
}: {
  users: MentionUser[]
  tags: MentionTag[]
  onOpenChange: (menu: "user" | "tag", open: boolean) => void
}) {
  const editor = useEditor<Union<[BasicExtension, MentionExtension]>>()

  const userItems = React.useMemo<SuggestionItem[]>(
    () =>
      users.map((user) => ({
        value: user.name,
        label: user.name,
        leading: (
          <Avatar
            size="xs"
            src={user.avatar}
            alt=""
            fallback={initials(user.name)}
          />
        ),
        onSelect: () => {
          editor.commands.insertMention({
            id: user.id,
            value: `@${user.name}`,
            kind: "user",
          })
          editor.commands.insertText({ text: " " })
        },
      })),
    [editor, users]
  )

  const tagItems = React.useMemo<SuggestionItem[]>(
    () =>
      tags.map((tag) => ({
        value: tag.label,
        label: tag.label,
        leading: <HashIcon />,
        onSelect: () => {
          editor.commands.insertMention({
            id: tag.id,
            value: `#${tag.label}`,
            kind: "tag",
          })
          editor.commands.insertText({ text: " " })
        },
      })),
    [editor, tags]
  )

  return (
    <>
      {users.length > 0 ? (
        <SuggestionMenu
          trigger={USER_TRIGGER}
          items={userItems}
          emptyLabel="No people found"
          onOpenChange={(open) => onOpenChange("user", open)}
        />
      ) : null}
      {tags.length > 0 ? (
        <SuggestionMenu
          trigger={TAG_TRIGGER}
          items={tagItems}
          emptyLabel="No tags found"
          onOpenChange={(open) => onOpenChange("tag", open)}
        />
      ) : null}
    </>
  )
}

function SendButton({
  disabled,
  onSubmit,
}: {
  disabled: boolean
  onSubmit: () => void
}) {
  const empty = useEditorDerivedValue(readIsEmpty)
  return (
    <Button
      iconOnly
      size="sm"
      aria-label="Send"
      disabled={disabled || empty}
      onClick={onSubmit}
    >
      <SendHorizontalIcon />
    </Button>
  )
}

/**
 * A chat-style message box: type @ to mention a person and # to add a tag,
 * Enter to send, Shift+Enter for a new line. Mentions come back as data in
 * `onSubmit`, so they can notify people or link tags.
 */
function MentionComposer(props: MentionComposerProps) {
  const isClient = useIsClient()
  if (!isClient) {
    return (
      <EditorShell
        slot="mention-composer"
        className={cn("p-1", props.className)}
        contentClassName="min-h-7 py-1"
      />
    )
  }
  return <MentionComposerClient {...props} />
}

function MentionComposerClient({
  users = [],
  tags = [],
  placeholder = "Write a message… @ to mention, # to tag",
  onSubmit,
  onChange,
  clearOnSubmit = true,
  disabled = false,
  leading,
  trailing,
  className,
  "aria-label": ariaLabel = "Message",
}: MentionComposerProps) {
  const openMenus = React.useRef(new Set<string>())

  const [editor] = React.useState<ComposerEditor>(() =>
    createEditor({
      extension: union(
        defineBasicExtension(),
        defineMention(),
        definePlaceholder({ placeholder, strategy: "doc" })
      ),
    })
  )

  const submit = React.useCallback(() => {
    // Enter picks a suggestion while a menu is open.
    if (disabled || openMenus.current.size > 0 || readIsEmpty(editor)) {
      return false
    }
    onSubmit?.(readComposerValue(editor))
    if (clearOnSubmit) {
      editor.setContent(EMPTY_DOC)
    }
    editor.focus()
    return true
  }, [clearOnSubmit, disabled, editor, onSubmit])

  // Above the base keymap, so Enter sends instead of splitting the paragraph.
  const keymap = React.useMemo(() => ({ Enter: submit }), [submit])
  useKeymap(keymap, { editor, priority: Priority.high })

  const handleChange = React.useCallback(
    () => onChange?.(readComposerValue(editor)),
    [editor, onChange]
  )
  useProseKitChange(editor, onChange ? handleChange : undefined)

  return (
    <ProseKit editor={editor}>
      <div
        data-slot="mention-composer"
        data-disabled={disabled}
        className={cn(
          EDITOR_FRAME_CLASS,
          "flex-row items-end gap-1 p-1",
          disabled && "pointer-events-none opacity-50",
          className
        )}
      >
        {leading ? (
          <div className="flex shrink-0 items-center">{leading}</div>
        ) : null}
        <EditorContent
          editor={editor}
          aria-label={ariaLabel}
          className="max-h-48 min-h-0 min-w-0 flex-1 overflow-y-auto px-2 py-1"
        />
        <div className="flex shrink-0 items-center gap-1">
          {trailing}
          <SendButton disabled={disabled} onSubmit={() => submit()} />
        </div>
        <MentionMenus
          users={users}
          tags={tags}
          onOpenChange={(menu, open) => {
            if (open) {
              openMenus.current.add(menu)
            } else {
              openMenus.current.delete(menu)
            }
          }}
        />
      </div>
    </ProseKit>
  )
}

export { MentionComposer }
