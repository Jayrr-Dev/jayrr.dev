"use client"

import * as React from "react"
import {
  ArrowUpIcon,
  CheckIcon,
  CopyIcon,
  FileIcon,
  MessageCircleIcon,
  PaperclipIcon,
  RefreshCwIcon,
  XIcon,
} from "lucide-react"
import { cn } from "cn"

import { Avatar } from "@/components/standard/avatar"
import { Button } from "@/components/standard/button"
import { Caption } from "@/components/standard/caption"
import { Chip, ChipGroup } from "@/components/standard/chip"
import { Fab } from "@/components/standard/fab"
import { Heading } from "@/components/standard/heading"
import { Textarea } from "@/components/standard/textarea"
import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Marker, MarkerContent } from "@/components/ui/marker"
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"

type ChatRole = "user" | "assistant" | "system"

type ChatAttachment = {
  name: string
  /** Shown under the name, e.g. "2.4 MB" or "PDF". */
  description?: React.ReactNode
  /** Image URL. Images show as a thumbnail; anything else as a file icon. */
  src?: string
  state?: "uploading" | "processing" | "error" | "done"
}

type ChatMessage = {
  id: string
  role: ChatRole
  content: React.ReactNode
  /** Name above the bubble. Leave it out for a one-on-one assistant chat. */
  author?: string
  avatar?: string
  /** Small text under the bubble, e.g. a time or "Delivered". */
  footer?: React.ReactNode
  attachments?: ChatAttachment[]
  /** Draws the bubble in the danger style. */
  error?: boolean
  /** Plain text for the Copy action when `content` is not a string. */
  text?: string
  /** Drops the bubble so the reply reads as full-width text, e.g. an agent transcript. */
  plain?: boolean
}

type ChatProps = Omit<React.ComponentProps<"div">, "onSubmit"> & {
  messages: ChatMessage[]
  /** Title in the header bar. Leave it out to hide the bar. */
  label?: React.ReactNode
  /** Content at the end of the header bar, e.g. a New chat button. */
  trailing?: React.ReactNode
  /** Layers painted behind the conversation, e.g. a Gradient or Noise. */
  background?: React.ReactNode
  /** Shown in the middle while there are no messages. */
  empty?: React.ReactNode
  /** Shows a shimmering status line under the last message. */
  pending?: boolean | React.ReactNode
  /** Called with the trimmed text and picked files. The box clears after. */
  onSend?: (text: string, files: File[]) => void | Promise<void>
  placeholder?: string
  disabled?: boolean
  /** Adds a paperclip button that picks files to send with the message. */
  attachments?: boolean
  accept?: string
  /** Note under the composer. */
  hint?: React.ReactNode
  /** Avatars beside other people's messages. */
  showAvatars?: boolean
  /** Prompts shown as chips while there are no messages; a click sends one. */
  suggestions?: string[]
  /** Chips above the composer once the conversation has started; a click sends one. */
  followUps?: string[]
  /** Controls in the composer bar before the Send button, e.g. a model picker or mic. */
  tools?: React.ReactNode
  /** Copy button under assistant replies. On by default. */
  copyable?: boolean
  /** Adds a Regenerate button under the last assistant reply. */
  onRegenerate?: (message: ChatMessage) => void
  /** Bubble style for replies from others. `speech` draws a tailed speech bubble. */
  replyBubble?: "muted" | "tinted" | "outline" | "speech"
}

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("")
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`
}

function RendersAttachment({
  file,
  onRemove,
}: {
  file: ChatAttachment
  onRemove?: () => void
}) {
  return (
    <Attachment size="sm" state={file.state ?? "done"} className="max-w-60">
      <AttachmentMedia variant={file.src ? "image" : "icon"}>
        {file.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={file.src} alt="" />
        ) : (
          <FileIcon />
        )}
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>{file.name}</AttachmentTitle>
        {file.description ? (
          <AttachmentDescription>{file.description}</AttachmentDescription>
        ) : null}
      </AttachmentContent>
      {onRemove ? (
        <Button
          type="button"
          tone="ghost"
          size="xs"
          iconOnly
          aria-label={`Remove ${file.name}`}
          onClick={onRemove}
          className="ms-auto"
        >
          <XIcon />
        </Button>
      ) : null}
    </Attachment>
  )
}

function RendersCopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 1500)
    return () => window.clearTimeout(timer)
  }, [copied])

  return (
    <Button
      type="button"
      tone="ghost"
      size="xs"
      iconOnly
      aria-label={copied ? "Copied" : "Copy"}
      onClick={() => {
        void navigator.clipboard?.writeText(text).then(() => setCopied(true))
      }}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </Button>
  )
}

function RendersMessage({
  message,
  showAvatars,
  copyable,
  onRegenerate,
  replyBubble,
}: {
  message: ChatMessage
  showAvatars: boolean
  copyable: boolean
  onRegenerate?: () => void
  replyBubble: NonNullable<ChatProps["replyBubble"]>
}) {
  if (message.role === "system") {
    return (
      <Marker variant="separator" className="text-xs">
        <MarkerContent>{message.content}</MarkerContent>
      </Marker>
    )
  }

  const mine = message.role === "user"
  const copyText =
    message.text ??
    (typeof message.content === "string" ? message.content : undefined)
  const showCopy = !mine && copyable && Boolean(copyText)
  const author = message.author ?? (mine ? "You" : "Assistant")

  return (
    <Message align={mine ? "end" : "start"}>
      {showAvatars && !mine ? (
        <MessageAvatar>
          <Avatar
            size="sm"
            src={message.avatar}
            alt={author}
            fallback={initialsOf(author)}
          />
        </MessageAvatar>
      ) : null}
      <MessageContent>
        {message.author ? (
          <MessageHeader>{message.author}</MessageHeader>
        ) : null}
        {message.attachments?.length ? (
          <div className="flex flex-wrap gap-2">
            {message.attachments.map((file, index) => (
              <RendersAttachment key={`${file.name}-${index}`} file={file} />
            ))}
          </div>
        ) : null}
        {message.content != null && message.content !== "" ? (
          <Bubble
            align={mine ? "end" : "start"}
            variant={
              message.error
                ? "destructive"
                : mine
                  ? "default"
                  : message.plain
                    ? "ghost"
                    : replyBubble
            }
          >
            <BubbleContent className="whitespace-pre-wrap">
              {message.content}
            </BubbleContent>
          </Bubble>
        ) : null}
        {message.footer || showCopy || onRegenerate ? (
          <MessageFooter className="gap-1">
            {showCopy ? <RendersCopyButton text={copyText!} /> : null}
            {onRegenerate ? (
              <Button
                type="button"
                tone="ghost"
                size="xs"
                iconOnly
                aria-label="Regenerate"
                onClick={onRegenerate}
              >
                <RefreshCwIcon />
              </Button>
            ) : null}
            {message.footer ? <span>{message.footer}</span> : null}
          </MessageFooter>
        ) : null}
      </MessageContent>
    </Message>
  )
}

/**
 * A chat window: an optional header bar, a conversation that keeps each new
 * turn in view while replies stream in, a shimmering status line, and a
 * composer with file attachments. Built on Message Scroller, Message, Bubble,
 * Attachment and Marker; the app owns the messages and the sending.
 */
function Chat({
  className,
  messages,
  label,
  trailing,
  background,
  empty = "How can I help you today?",
  pending = false,
  onSend,
  placeholder = "Send a message...",
  disabled = false,
  attachments = false,
  accept,
  hint,
  showAvatars = false,
  suggestions,
  followUps,
  tools,
  copyable = true,
  onRegenerate,
  replyBubble = "muted",
  ...props
}: ChatProps) {
  const [draft, setDraft] = React.useState("")
  const [files, setFiles] = React.useState<File[]>([])
  const [sending, setSending] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const busy = sending || Boolean(pending)
  const canSend =
    !disabled && !busy && (draft.trim() !== "" || files.length > 0)

  const previews = React.useMemo(
    () =>
      files.map((file) => ({
        name: file.name,
        description: formatSize(file.size),
        src: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined,
      })),
    [files]
  )
  React.useEffect(
    () => () => {
      previews.forEach((file) => file.src && URL.revokeObjectURL(file.src))
    },
    [previews]
  )

  const lastReplyId = messages.findLast(
    (message) => message.role === "assistant"
  )?.id

  async function send(event?: React.FormEvent, text = draft.trim()) {
    event?.preventDefault()
    if (disabled || busy || (text === "" && files.length === 0)) return
    setSending(true)
    try {
      await onSend?.(text, files)
      setDraft("")
      setFiles([])
    } finally {
      setSending(false)
      textareaRef.current?.focus()
    }
  }

  return (
    <div
      data-slot="chat"
      className={cn(
        "relative isolate flex h-full min-h-0 w-full flex-col overflow-hidden rounded-xl border bg-background",
        className
      )}
      {...props}
    >
      {background}
      {label || trailing ? (
        <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b px-4">
          <Heading level={3} className="text-sm font-semibold" truncate>
            {label}
          </Heading>
          {trailing}
        </div>
      ) : null}

      <MessageScrollerProvider autoScroll defaultScrollPosition="end">
        <MessageScroller className="flex-1">
          <MessageScrollerViewport aria-label="Conversation">
            <MessageScrollerContent className="gap-4 p-4">
              {messages.length === 0 && !pending ? (
                <div className="m-auto flex max-w-sm flex-col items-center gap-4 text-center">
                  <div className="text-lg font-semibold text-balance">
                    {empty}
                  </div>
                  {suggestions?.length ? (
                    <ChipGroup className="justify-center">
                      {suggestions.map((suggestion) => (
                        <Chip
                          key={suggestion}
                          size="sm"
                          disabled={disabled || busy}
                          onClick={() => void send(undefined, suggestion)}
                        >
                          {suggestion}
                        </Chip>
                      ))}
                    </ChipGroup>
                  ) : null}
                </div>
              ) : null}
              {messages.map((message) => (
                <MessageScrollerItem
                  key={message.id}
                  messageId={message.id}
                  scrollAnchor={message.role === "user"}
                >
                  <RendersMessage
                    message={message}
                    showAvatars={showAvatars}
                    copyable={copyable}
                    replyBubble={replyBubble}
                    onRegenerate={
                      onRegenerate && message.id === lastReplyId && !busy
                        ? () => onRegenerate(message)
                        : undefined
                    }
                  />
                </MessageScrollerItem>
              ))}
              {pending ? (
                <MessageScrollerItem>
                  <Marker role="status" className="text-xs">
                    <MarkerContent className="shimmer">
                      {pending === true ? "Generating response…" : pending}
                    </MarkerContent>
                  </Marker>
                </MessageScrollerItem>
              ) : null}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>

      <form onSubmit={send} className="shrink-0 p-3 pt-0">
        {followUps?.length && messages.length > 0 ? (
          <ChipGroup className="mb-2">
            {followUps.map((followUp) => (
              <Chip
                key={followUp}
                size="sm"
                disabled={disabled || busy}
                onClick={() => void send(undefined, followUp)}
              >
                {followUp}
              </Chip>
            ))}
          </ChipGroup>
        ) : null}
        <div className="flex flex-col gap-2 rounded-xl border bg-card p-2 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
          {previews.length ? (
            <div className="flex scroll-fade-x gap-2 overflow-x-auto">
              {previews.map((file, index) => (
                <RendersAttachment
                  key={`${file.name}-${index}`}
                  file={file}
                  onRemove={() =>
                    setFiles((list) => list.filter((_, at) => at !== index))
                  }
                />
              ))}
            </div>
          ) : null}
          <Textarea
            ref={textareaRef}
            aria-label="Message"
            placeholder={placeholder}
            value={draft}
            disabled={disabled}
            rows={1}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey &&
                !event.nativeEvent.isComposing
              ) {
                event.preventDefault()
                void send()
              }
            }}
            className="max-h-40 min-h-10 resize-none border-0 bg-transparent px-1.5 py-1 shadow-none focus-visible:ring-0 dark:bg-transparent"
          />
          <div className="flex items-center gap-1">
            {attachments ? (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={accept}
                  hidden
                  onChange={(event) => {
                    const picked = Array.from(event.target.files ?? [])
                    setFiles((list) => [...list, ...picked])
                    event.target.value = ""
                  }}
                />
                <Button
                  type="button"
                  tone="ghost"
                  size="sm"
                  iconOnly
                  aria-label="Attach files"
                  disabled={disabled}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <PaperclipIcon />
                </Button>
              </>
            ) : null}
            {tools ? (
              <div className="ms-auto flex items-center gap-1">{tools}</div>
            ) : null}
            <Button
              type="submit"
              size="sm"
              shape="circle"
              aria-label="Send"
              disabled={!canSend}
              loading={sending}
              className={tools ? undefined : "ms-auto"}
            >
              <ArrowUpIcon />
            </Button>
          </div>
        </div>
        {hint ? (
          <Caption className="mt-2 text-center text-xs">{hint}</Caption>
        ) : null}
      </form>
    </div>
  )
}

type SideChatProps = ChatProps & {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Accessible name for the launcher button. */
  launcherLabel?: string
  /** Launcher icon while closed. Defaults to a speech bubble. */
  launcherIcon?: React.ReactNode
  /** Count on the launcher while closed, e.g. unread replies. */
  unread?: number
  /** Corner the launcher and panel sit in. */
  side?: "end" | "start"
  /**
   * `fixed` pins to the viewport, like a support widget. `absolute` pins to the
   * nearest positioned parent, for previews inside a page.
   */
  position?: "fixed" | "absolute"
  /** Classes for the panel that holds the chat. */
  panelClassName?: string
}

/**
 * A support-style chat docked to a corner: a round launcher that opens a
 * floating Chat panel above it, with a close button in the header bar.
 * Escape closes it. Takes every Chat prop.
 */
function SideChat({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  launcherLabel = "Chat with us",
  launcherIcon = <MessageCircleIcon />,
  unread,
  side = "end",
  position = "fixed",
  panelClassName,
  className,
  trailing,
  label = "Chat",
  ...props
}: SideChatProps) {
  const [openState, setOpenState] = React.useState(defaultOpen)
  const open = openProp ?? openState
  const panelId = React.useId()

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (openProp === undefined) setOpenState(next)
      onOpenChange?.(next)
    },
    [openProp, onOpenChange]
  )

  return (
    <div
      data-slot="side-chat"
      data-state={open ? "open" : "closed"}
      className={cn(
        "pointer-events-none bottom-4 z-50 flex flex-col gap-3 *:pointer-events-auto",
        position === "fixed" ? "fixed" : "absolute",
        side === "end" ? "end-4 items-end" : "start-4 items-start",
        className
      )}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.stopPropagation()
          setOpen(false)
        }
      }}
    >
      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label={typeof label === "string" ? label : launcherLabel}
          className={cn(
            "h-[min(34rem,calc(100dvh-7rem))] w-[min(24rem,calc(100vw-2rem))] animate-in duration-200 fade-in slide-in-from-bottom-4",
            side === "end" ? "origin-bottom-right" : "origin-bottom-left",
            panelClassName
          )}
        >
          <Chat
            className="shadow-xl"
            label={label}
            trailing={
              <div className="flex items-center gap-1">
                {trailing}
                <Button
                  type="button"
                  tone="ghost"
                  size="xs"
                  iconOnly
                  aria-label="Close chat"
                  onClick={() => setOpen(false)}
                >
                  <XIcon />
                </Button>
              </div>
            }
            {...props}
          />
        </div>
      ) : null}
      <Fab
        label={open ? "Close chat" : launcherLabel}
        icon={open ? <XIcon /> : launcherIcon}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        badge={open ? undefined : unread}
        className="rounded-full shadow-lg"
        onClick={() => setOpen(!open)}
      />
    </div>
  )
}

export { Chat, SideChat }
export type {
  ChatAttachment,
  ChatMessage,
  ChatProps,
  ChatRole,
  SideChatProps,
}
