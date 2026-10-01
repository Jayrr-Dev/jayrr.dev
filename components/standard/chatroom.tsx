"use client"

import * as React from "react"
import { ArrowDownIcon, SendHorizontalIcon } from "lucide-react"
import { cn } from "cn"

import { Avatar, AvatarGroup } from "@/components/standard/avatar"
import { Button } from "@/components/standard/button"

/**
 * Group chat room: a header with the members, a scrolling message log and a
 * composer. Three layouts share one data shape:
 *
 * - `bubbles`: messenger style, your messages on the right.
 * - `channel`: team-chat style, every message left-aligned under a name row.
 * - `terminal`: an IRC log in monospace with coloured nicks.
 *
 * @example
 * <Chatroom users={users} currentUserId="me" defaultMessages={messages} />
 * <Chatroom variant="channel" title="#launch" messages={messages} onSend={send} />
 */

type ChatroomVariant = "bubbles" | "channel" | "terminal"

type ChatroomUser = {
  id: string
  name: string
  /** Image URL. Initials show without one. */
  avatar?: string
  /** Name colour in `channel` and `terminal`, any CSS colour. */
  color?: string
  status?: "online" | "away" | "busy" | "offline"
}

type ChatroomMessage = {
  id: string
  userId: string
  text: string
  time: Date | string | number
  /** `system` lines (joins, topic changes) sit centred without a sender. */
  kind?: "message" | "system"
}

/** Messages from one sender closer together than this share a group. */
const GROUP_GAP_MS = 5 * 60 * 1000

/** How close to the bottom still counts as "following" the conversation. */
const STICK_THRESHOLD_PX = 48

const timeFormat = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
})

const clockFormat = new Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
})

const dayFormat = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "short",
  day: "numeric",
})

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("")
}

/** A steady colour per name, for users without their own. */
function nameColor(user: ChatroomUser | undefined, name: string) {
  if (user?.color) return user.color
  let hash = 0
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) % 360
  return `oklch(0.72 0.14 ${hash})`
}

function dayLabel(date: Date) {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (date.toDateString() === today.toDateString()) return "Today"
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday"
  return dayFormat.format(date)
}

type ChatroomRow = {
  message: ChatroomMessage
  date: Date
  user: ChatroomUser | undefined
  own: boolean
  /** First message of a new day: draw a divider above it. */
  newDay: boolean
  /** First and last message of a run from one sender. */
  startsGroup: boolean
  endsGroup: boolean
}

function buildsRows(
  messages: ChatroomMessage[],
  users: Map<string, ChatroomUser>,
  currentUserId: string | undefined
): ChatroomRow[] {
  const dates = messages.map((message) => new Date(message.time))

  const joins = (a: number, b: number) => {
    const first = messages[a]
    const second = messages[b]
    if (!first || !second) return false
    if (first.kind === "system" || second.kind === "system") return false
    if (first.userId !== second.userId) return false
    if (dates[a].toDateString() !== dates[b].toDateString()) return false
    return Math.abs(dates[b].getTime() - dates[a].getTime()) < GROUP_GAP_MS
  }

  return messages.map((message, index) => ({
    message,
    date: dates[index],
    user: users.get(message.userId),
    own: message.userId === currentUserId,
    newDay:
      index === 0 ||
      dates[index].toDateString() !== dates[index - 1].toDateString(),
    startsGroup: !joins(index - 1, index),
    endsGroup: !joins(index, index + 1),
  }))
}

function ChatroomDayDivider({
  date,
  variant,
}: {
  date: Date
  variant: ChatroomVariant
}) {
  if (variant === "terminal") {
    return (
      <div className="py-1 text-neutral-500" suppressHydrationWarning>
        --- Day changed {dayFormat.format(date)} ---
      </div>
    )
  }

  if (variant === "channel") {
    return (
      <div className="flex items-center gap-3 py-2 text-xs font-medium text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        <span suppressHydrationWarning>{dayLabel(date)}</span>
        <span className="h-px flex-1 bg-border" />
      </div>
    )
  }

  return (
    <div className="flex justify-center py-2">
      <span
        className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground"
        suppressHydrationWarning
      >
        {dayLabel(date)}
      </span>
    </div>
  )
}

function ChatroomSystemLine({
  row,
  variant,
}: {
  row: ChatroomRow
  variant: ChatroomVariant
}) {
  if (variant === "terminal") {
    return (
      <div className="flex gap-2 text-neutral-500">
        <span className="shrink-0" suppressHydrationWarning>
          [{clockFormat.format(row.date)}]
        </span>
        <span className="shrink-0">-!-</span>
        <span className="min-w-0 break-words">{row.message.text}</span>
      </div>
    )
  }

  return (
    <div className="py-1 text-center text-xs text-muted-foreground">
      {row.message.text}
    </div>
  )
}

function ChatroomBubbleRow({
  row,
  showNames,
}: {
  row: ChatroomRow
  showNames: boolean
}) {
  const { message, user, own, startsGroup, endsGroup } = row
  const name = user?.name ?? message.userId

  return (
    <div
      data-slot="chatroom-message"
      data-own={own || undefined}
      className={cn(
        "flex items-end gap-2",
        own && "flex-row-reverse",
        startsGroup ? "mt-3" : "mt-0.5"
      )}
    >
      {own ? null : endsGroup ? (
        <Avatar
          size="sm"
          src={user?.avatar}
          alt={name}
          fallback={initialsOf(name)}
        />
      ) : (
        <span aria-hidden className="w-8 shrink-0" />
      )}
      <div
        className={cn(
          "flex max-w-[78%] min-w-0 flex-col gap-1",
          own ? "items-end" : "items-start"
        )}
      >
        {showNames && !own && startsGroup ? (
          <span className="px-3 text-xs font-medium text-muted-foreground">
            {name}
          </span>
        ) : null}
        <div
          className={cn(
            "rounded-2xl px-3 py-1.5 text-sm leading-relaxed break-words whitespace-pre-wrap",
            own
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground",
            own && !startsGroup && "rounded-tr-md",
            own && !endsGroup && "rounded-br-md",
            !own && !startsGroup && "rounded-tl-md",
            !own && !endsGroup && "rounded-bl-md"
          )}
        >
          {message.text}
        </div>
        {endsGroup ? (
          <time
            dateTime={row.date.toISOString()}
            className="px-3 text-[11px] text-muted-foreground"
            suppressHydrationWarning
          >
            {timeFormat.format(row.date)}
          </time>
        ) : null}
      </div>
    </div>
  )
}

function ChatroomChannelRow({ row }: { row: ChatroomRow }) {
  const { message, user, startsGroup } = row
  const name = user?.name ?? message.userId

  return (
    <div
      data-slot="chatroom-message"
      data-own={row.own || undefined}
      className={cn(
        "group/row flex gap-3 rounded-md px-2 py-0.5 hover:bg-muted/50",
        startsGroup && "mt-2 pt-1.5"
      )}
    >
      {startsGroup ? (
        <Avatar
          size="sm"
          shape="square"
          src={user?.avatar}
          alt={name}
          fallback={initialsOf(name)}
          className="mt-0.5"
        />
      ) : (
        <time
          dateTime={row.date.toISOString()}
          className="w-8 shrink-0 pt-0.5 text-right text-[10px] text-muted-foreground opacity-0 tabular-nums group-hover/row:opacity-100"
          suppressHydrationWarning
        >
          {clockFormat.format(row.date)}
        </time>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        {startsGroup ? (
          <div className="flex items-baseline gap-2">
            <span
              className="text-sm font-semibold"
              style={{ color: user?.color }}
            >
              {name}
            </span>
            <time
              dateTime={row.date.toISOString()}
              className="text-xs text-muted-foreground"
              suppressHydrationWarning
            >
              {timeFormat.format(row.date)}
            </time>
          </div>
        ) : null}
        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
          {message.text}
        </p>
      </div>
    </div>
  )
}

function ChatroomTerminalRow({ row }: { row: ChatroomRow }) {
  const name = row.user?.name ?? row.message.userId

  return (
    <div
      data-slot="chatroom-message"
      data-own={row.own || undefined}
      className="flex gap-2"
    >
      <span className="shrink-0 text-neutral-500" suppressHydrationWarning>
        [{clockFormat.format(row.date)}]
      </span>
      <span
        className="shrink-0 font-semibold"
        style={{ color: nameColor(row.user, name) }}
      >
        &lt;{name}&gt;
      </span>
      <span className="min-w-0 break-words whitespace-pre-wrap">
        {row.message.text}
      </span>
    </div>
  )
}

function ChatroomTyping({
  names,
  variant,
}: {
  names: string[]
  variant: ChatroomVariant
}) {
  if (!names.length) return null

  const who =
    names.length === 1
      ? `${names[0]} is`
      : names.length === 2
        ? `${names[0]} and ${names[1]} are`
        : "Several people are"

  if (variant === "terminal") {
    return (
      <div className="animate-pulse text-neutral-500">
        * {who} typing…
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 pt-2 text-xs text-muted-foreground",
        variant === "bubbles" ? "pl-10" : "pl-2"
      )}
    >
      <span className="flex items-center gap-0.5 rounded-full bg-muted px-2 py-1.5">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="size-1 animate-bounce rounded-full bg-muted-foreground"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </span>
      {who} typing
    </div>
  )
}

function ChatroomHeader({
  title,
  description,
  users,
  variant,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  users: ChatroomUser[]
  variant: ChatroomVariant
}) {
  const online = users.filter(
    (user) => user.status && user.status !== "offline"
  ).length

  if (variant === "terminal") {
    return (
      <div className="flex items-center justify-between gap-3 border-b border-neutral-800 px-3 py-2 text-neutral-400">
        <span className="truncate">
          <span className="font-semibold text-neutral-100">{title}</span>
          {description ? <> · {description}</> : null}
        </span>
        <span className="shrink-0">[{users.length} users]</span>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-semibold">{title}</span>
        <span className="truncate text-xs text-muted-foreground">
          {description ??
            `${users.length} members${online ? ` · ${online} online` : ""}`}
        </span>
      </div>
      <AvatarGroup size="xs" max={4}>
        {users.map((user) => (
          <Avatar
            key={user.id}
            src={user.avatar}
            alt={user.name}
            fallback={initialsOf(user.name)}
          />
        ))}
      </AvatarGroup>
    </div>
  )
}

function ChatroomComposer({
  variant,
  placeholder,
  nick,
  onSend,
  disabled,
}: {
  variant: ChatroomVariant
  placeholder: string
  nick?: string
  onSend: (text: string) => void
  disabled?: boolean
}) {
  const [draft, setDraft] = React.useState("")
  const canSend = draft.trim().length > 0 && !disabled

  const send = () => {
    if (!canSend) return
    onSend(draft.trim())
    setDraft("")
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      send()
    }
  }

  if (variant === "terminal") {
    return (
      <form
        className="flex items-center gap-2 border-t border-neutral-800 px-3 py-2"
        onSubmit={(event) => {
          event.preventDefault()
          send()
        }}
      >
        <span className="shrink-0 text-neutral-500">[{nick ?? "you"}]</span>
        <textarea
          rows={1}
          value={draft}
          disabled={disabled}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          aria-label={placeholder}
          placeholder={placeholder}
          className="max-h-24 min-w-0 flex-1 resize-none bg-transparent text-neutral-100 caret-emerald-400 outline-none field-sizing-content placeholder:text-neutral-600"
        />
      </form>
    )
  }

  return (
    <form
      className="flex items-end gap-2 border-t border-border p-2"
      onSubmit={(event) => {
        event.preventDefault()
        send()
      }}
    >
      <textarea
        rows={1}
        value={draft}
        disabled={disabled}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={onKeyDown}
        aria-label={placeholder}
        placeholder={placeholder}
        className={cn(
          "max-h-32 min-h-8 min-w-0 flex-1 resize-none bg-muted/60 px-3 py-1.5 text-sm leading-5 outline-none field-sizing-content placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
          variant === "bubbles" ? "rounded-2xl" : "rounded-lg"
        )}
      />
      <Button
        type="submit"
        iconOnly
        shape={variant === "bubbles" ? "circle" : "square"}
        disabled={!canSend}
        aria-label="Send message"
      >
        <SendHorizontalIcon />
      </Button>
    </form>
  )
}

type ChatroomProps = Omit<React.ComponentProps<"div">, "title"> & {
  variant?: ChatroomVariant
  users: ChatroomUser[]
  /** Whose messages count as "yours" (right side in `bubbles`). */
  currentUserId?: string
  /** Controlled log. Pair with `onSend` and append the message yourself. */
  messages?: ChatroomMessage[]
  /** Starting log when uncontrolled. Sent messages are appended for you. */
  defaultMessages?: ChatroomMessage[]
  /** Called with the trimmed draft when the composer sends. */
  onSend?: (text: string) => void
  /** Ids of the users typing right now. */
  typing?: string[]
  title?: React.ReactNode
  /** Line under the title. Defaults to the member and online count. */
  description?: React.ReactNode
  /** Hide the header row for a bare log and composer. */
  hideHeader?: boolean
  /** Hide the composer for a read-only log. */
  readOnly?: boolean
  placeholder?: string
}

function Chatroom({
  variant = "bubbles",
  users,
  currentUserId,
  messages: messagesProp,
  defaultMessages = [],
  onSend,
  typing = [],
  title = "Chat",
  description,
  hideHeader = false,
  readOnly = false,
  placeholder,
  className,
  ...props
}: ChatroomProps) {
  const [ownMessages, setOwnMessages] = React.useState(defaultMessages)
  const messages = messagesProp ?? ownMessages

  const userMap = React.useMemo(
    () => new Map(users.map((user) => [user.id, user])),
    [users]
  )
  const rows = React.useMemo(
    () => buildsRows(messages, userMap, currentUserId),
    [messages, userMap, currentUserId]
  )
  const typingNames = typing
    .filter((id) => id !== currentUserId)
    .map((id) => userMap.get(id)?.name ?? id)

  const viewportRef = React.useRef<HTMLDivElement>(null)
  const stickRef = React.useRef(true)
  // True while our own smooth scroll runs, so its in-between positions are
  // not read as the reader scrolling away.
  const autoScrollingRef = React.useRef(false)
  const seenCountRef = React.useRef(messages.length)
  const [unseen, setUnseen] = React.useState(0)
  const [atBottom, setAtBottom] = React.useState(true)

  const scrollToEnd = React.useCallback((behavior: ScrollBehavior) => {
    const viewport = viewportRef.current
    if (!viewport) return
    autoScrollingRef.current = behavior === "smooth"
    stickRef.current = true
    viewport.scrollTo({ top: viewport.scrollHeight, behavior })
  }, [])

  const releasesAutoScroll = () => {
    autoScrollingRef.current = false
  }

  // Follow new messages while the reader is at the bottom, or when they sent
  // one themselves; otherwise count them for the jump button.
  React.useLayoutEffect(() => {
    const added = messages.length - seenCountRef.current
    seenCountRef.current = messages.length
    const last = messages[messages.length - 1]

    if (stickRef.current || (added > 0 && last?.userId === currentUserId)) {
      scrollToEnd(added > 0 && added < 5 ? "smooth" : "instant")
      return
    }
    if (added > 0) setUnseen((count) => count + added)
  }, [messages, currentUserId, scrollToEnd])

  React.useLayoutEffect(() => {
    if (stickRef.current && typingNames.length) scrollToEnd("smooth")
  }, [typingNames.length, scrollToEnd])

  const onScroll = () => {
    const viewport = viewportRef.current
    if (!viewport) return
    const distance =
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight
    const bottom = distance < STICK_THRESHOLD_PX
    if (bottom) autoScrollingRef.current = false
    else if (autoScrollingRef.current) return
    stickRef.current = bottom
    setAtBottom(bottom)
    if (bottom) setUnseen(0)
  }

  const send = (text: string) => {
    onSend?.(text)
    if (messagesProp || !currentUserId) return
    setOwnMessages((current) => [
      ...current,
      {
        id: `local-${Date.now()}-${current.length}`,
        userId: currentUserId,
        text,
        time: new Date(),
      },
    ])
  }

  const terminal = variant === "terminal"
  const nick = currentUserId ? userMap.get(currentUserId)?.name : undefined

  return (
    <div
      data-slot="chatroom"
      data-variant={variant}
      className={cn(
        "flex h-96 min-h-0 w-full flex-col overflow-hidden rounded-xl border",
        terminal
          ? "border-neutral-800 bg-neutral-950 font-mono text-xs text-neutral-200"
          : "border-border bg-background text-foreground",
        className
      )}
      {...props}
    >
      {hideHeader ? null : (
        <ChatroomHeader
          title={title}
          description={description}
          users={users}
          variant={variant}
        />
      )}

      <div className="relative min-h-0 flex-1">
        <div
          ref={viewportRef}
          onScroll={onScroll}
          onWheel={releasesAutoScroll}
          onTouchStart={releasesAutoScroll}
          onPointerDown={releasesAutoScroll}
          onKeyDown={releasesAutoScroll}
          role="log"
          aria-live="polite"
          aria-label={typeof title === "string" ? `${title} messages` : "Messages"}
          tabIndex={0}
          className={cn(
            "size-full overflow-y-auto overscroll-contain outline-none",
            terminal ? "space-y-0.5 px-3 py-2 leading-5" : "px-3 py-3"
          )}
        >
          {rows.map((row) => (
            <React.Fragment key={row.message.id}>
              {row.newDay ? (
                <ChatroomDayDivider date={row.date} variant={variant} />
              ) : null}
              {row.message.kind === "system" ? (
                <ChatroomSystemLine row={row} variant={variant} />
              ) : variant === "channel" ? (
                <ChatroomChannelRow row={row} />
              ) : terminal ? (
                <ChatroomTerminalRow row={row} />
              ) : (
                <ChatroomBubbleRow row={row} showNames={users.length > 2} />
              )}
            </React.Fragment>
          ))}
          <ChatroomTyping names={typingNames} variant={variant} />
        </div>

        {atBottom ? null : (
          <Button
            type="button"
            size="sm"
            shape="pill"
            tone={unseen ? "default" : "outline"}
            leading={<ArrowDownIcon />}
            onClick={() => scrollToEnd("smooth")}
            className={cn(
              "absolute bottom-3 left-1/2 -translate-x-1/2 shadow-md",
              !unseen && "bg-background",
              terminal && !unseen && "border-neutral-700 bg-neutral-900 text-neutral-200"
            )}
          >
            {unseen ? `${unseen} new` : "Latest"}
          </Button>
        )}
      </div>

      {readOnly ? null : (
        <ChatroomComposer
          variant={variant}
          nick={nick}
          disabled={!currentUserId}
          placeholder={
            placeholder ??
            (terminal
              ? "type a message"
              : typeof title === "string"
                ? `Message ${title}`
                : "Write a message")
          }
          onSend={send}
        />
      )}
    </div>
  )
}

export {
  Chatroom,
  type ChatroomMessage,
  type ChatroomProps,
  type ChatroomUser,
  type ChatroomVariant,
}
