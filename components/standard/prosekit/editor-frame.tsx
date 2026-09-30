"use client"

import "prosekit/basic/style.css"

import * as React from "react"
import type { Node as ProseMirrorNode } from "prosekit/pm/model"
import type { Editor, NodeJSON } from "prosekit/core"
import { defineReadonly } from "prosekit/extensions/readonly"
import { useDocChange, useExtension } from "prosekit/react"
import { cn } from "cn"

export type ProseKitValue = {
  json: NodeJSON
  html: string
  text: string
}

/** The same bordered field as LexicalEditor and Textarea. */
export const EDITOR_FRAME_CLASS =
  "relative flex w-full flex-col rounded-lg border border-input bg-transparent text-sm focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30"

// Positioners only place their popup; the popup draws the surface.
export const POSITIONER_CLASS = "z-50 block h-min w-min overflow-visible"

export const POPUP_CLASS =
  "box-border flex origin-(--transform-origin) flex-col rounded-lg bg-popover p-1 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 transition transition-discrete duration-100 data-[state=closed]:scale-95 data-[state=closed]:opacity-0 starting:scale-95 starting:opacity-0 motion-reduce:transition-none"

export const POPUP_ITEM_CLASS =
  "flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm whitespace-nowrap outline-hidden select-none data-highlighted:bg-muted data-[danger]:text-destructive [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground"

/** Mentions and hard breaks count as text; other atoms (images, rules) don't. */
function leafText(node: ProseMirrorNode) {
  if (node.type.name === "mention") {
    return String(node.attrs.value ?? "")
  }
  return node.type.name === "hardBreak" ? "\n" : ""
}

export function readProseKitValue(editor: Editor): ProseKitValue {
  const doc = editor.state.doc
  return {
    json: editor.getDocJSON(),
    html: editor.getDocHTML(),
    text: doc.textBetween(0, doc.content.size, "\n\n", leafText),
  }
}

/** Calls `onChange` with the document after every edit. */
export function useProseKitChange(
  editor: Editor,
  onChange: ((value: ProseKitValue) => void) | undefined
) {
  const onChangeRef = React.useRef(onChange)
  React.useEffect(() => {
    onChangeRef.current = onChange
  })

  const handleChange = React.useCallback(() => {
    onChangeRef.current?.(readProseKitValue(editor))
  }, [editor])

  useDocChange(handleChange, { editor })
}

/** Makes the document read-only while `editable` is false. */
export function useProseKitEditable(editor: Editor, editable: boolean) {
  const readonly = React.useMemo(
    () => (editable ? null : defineReadonly()),
    [editable]
  )
  useExtension(readonly, { editor })
}

const subscribeNever = () => () => {}

/** ProseKit parses HTML with the DOM, so editors are only created in the browser. */
export function useIsClient() {
  return React.useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false
  )
}

/** What SSR renders in an editor's place: the same frame, toolbar row and height. */
export function EditorShell({
  slot,
  className,
  contentClassName,
  toolbar,
}: {
  slot: string
  className?: string
  contentClassName?: string
  toolbar?: boolean
}) {
  return (
    <div
      data-slot={slot}
      aria-busy="true"
      className={cn(EDITOR_FRAME_CLASS, className)}
    >
      {toolbar ? (
        <div className="h-10 rounded-t-lg border-b border-border bg-muted/30" />
      ) : null}
      <div className={cn("min-h-40 px-3 py-2", contentClassName)} />
    </div>
  )
}

/**
 * The element ProseKit mounts into. ProseMirror adds its own classes to it, so
 * keep `className` steady: a new value makes React overwrite them.
 */
export function EditorContent({
  editor,
  className,
  ...props
}: React.ComponentProps<"div"> & { editor: Editor }) {
  const mount = React.useCallback(
    (element: HTMLDivElement | null) => editor.mount(element),
    [editor]
  )

  return (
    <div
      ref={mount}
      data-slot="editor-content"
      className={cn(
        "typeset typeset-editor min-h-40 px-3 py-2 outline-none",
        className
      )}
      {...props}
    />
  )
}
