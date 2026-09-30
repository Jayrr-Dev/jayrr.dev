"use client"

import * as React from "react"
import { cn } from "cn"

import { Avatar } from "@/components/standard/avatar"
import { Button } from "@/components/standard/button"
import { Caption } from "@/components/standard/caption"
import { Heading } from "@/components/standard/heading"
import { Link } from "@/components/standard/link"
import { Select } from "@/components/standard/select"
import { Textarea } from "@/components/standard/textarea"
import { useControllableState } from "@/hooks/use-controllable-state"

type CommentsSort = "newest" | "oldest"

type CommentEntry = {
  id: string
  author: string
  /** Avatar image. Initials from `author` show without one. */
  avatar?: string
  body: React.ReactNode
  /** Sorts the list; shown as "3h ago" style text unless `dateLabel` is set. */
  date: Date | string | number
  dateLabel?: React.ReactNode
}

type CommentsProps = Omit<React.ComponentProps<"section">, "onSubmit"> & {
  /** Heading above the box. */
  label?: React.ReactNode
  comments?: CommentEntry[]
  sort?: CommentsSort
  defaultSort?: CommentsSort
  onSortChange?: (sort: CommentsSort) => void
  /** Signed-in visitors can write and post; others see Login and Subscribe. */
  signedIn?: boolean
  placeholder?: string
  /** Called with the trimmed text. The box clears once it resolves. */
  onSubmit?: (body: string) => void | Promise<void>
  onLogin?: () => void
  loginHref?: string
  subscribeHref?: string
  /** Shown instead of the list when there are no comments. */
  empty?: React.ReactNode
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
]

function toTime(date: CommentEntry["date"]) {
  return new Date(date).getTime()
}

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("")
}

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" })
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31_536_000],
  ["month", 2_592_000],
  ["week", 604_800],
  ["day", 86_400],
  ["hour", 3_600],
  ["minute", 60],
]

function timeAgo(date: CommentEntry["date"]) {
  const seconds = (toTime(date) - Date.now()) / 1000
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) {
      return relative.format(Math.round(seconds / size), unit)
    }
  }
  return "just now"
}

/**
 * A comment section: a heading with a sort select, a reply box with its
 * submit button inside, a login prompt for signed-out visitors, and the list.
 */
function Comments({
  className,
  label = "Reply",
  comments = [],
  sort,
  defaultSort = "newest",
  onSortChange,
  signedIn = false,
  placeholder = "Add your comment...",
  onSubmit,
  onLogin,
  loginHref = "#",
  subscribeHref = "#",
  empty,
  ...props
}: CommentsProps) {
  const [order, setOrder] = useControllableState({
    value: sort,
    defaultValue: defaultSort,
    onChange: onSortChange,
  })
  const [draft, setDraft] = React.useState("")
  const [posting, setPosting] = React.useState(false)
  const headingId = React.useId()

  const sorted = React.useMemo(
    () =>
      [...comments].sort((a, b) =>
        order === "newest"
          ? toTime(b.date) - toTime(a.date)
          : toTime(a.date) - toTime(b.date)
      ),
    [comments, order]
  )

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!signedIn) {
      onLogin?.()
      return
    }
    const body = draft.trim()
    if (!body) {
      return
    }
    setPosting(true)
    try {
      await onSubmit?.(body)
      setDraft("")
    } finally {
      setPosting(false)
    }
  }

  return (
    <section
      data-slot="comments"
      aria-labelledby={headingId}
      className={cn("flex w-full flex-col gap-3", className)}
      {...props}
    >
      <div className="flex items-center justify-between gap-3">
        <Heading id={headingId} level={3} className="text-xl font-bold">
          {label}
        </Heading>
        <Select
          aria-label="Sort comments"
          size="default"
          options={SORT_OPTIONS}
          value={order}
          onValueChange={(next) => setOrder(next as CommentsSort)}
          className="w-auto"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <form onSubmit={submit} className="relative">
          <Textarea
            aria-label={typeof label === "string" ? label : "Comment"}
            placeholder={placeholder}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                event.currentTarget.form?.requestSubmit()
              }
            }}
            readOnly={!signedIn}
            onFocus={() => {
              if (!signedIn) onLogin?.()
            }}
            className="min-h-28 resize-none pb-12"
          />
          <Button
            type="submit"
            size="sm"
            loading={posting}
            disabled={signedIn && !draft.trim()}
            className="absolute right-2.5 bottom-2.5"
          >
            {signedIn ? "Post" : "Login"}
          </Button>
        </form>
        {signedIn ? null : (
          <Caption>
            <Link
              href={loginHref}
              onClick={(event) => {
                if (onLogin) {
                  event.preventDefault()
                  onLogin()
                }
              }}
              className="font-normal text-muted-foreground underline"
            >
              Login
            </Link>{" "}
            or{" "}
            <Link
              href={subscribeHref}
              className="font-normal text-muted-foreground underline"
            >
              Subscribe
            </Link>{" "}
            to participate.
          </Caption>
        )}
      </div>

      {sorted.length ? (
        <ul data-slot="comments-list" className="flex flex-col gap-4 pt-2">
          {sorted.map((comment) => (
            <li key={comment.id} className="flex gap-3">
              <Avatar
                size="sm"
                src={comment.avatar}
                alt={comment.author}
                fallback={initialsOf(comment.author)}
              />
              <div className="flex min-w-0 flex-col gap-0.5">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold">
                    {comment.author}
                  </span>
                  <time
                    dateTime={new Date(comment.date).toISOString()}
                    className="text-xs text-muted-foreground"
                    suppressHydrationWarning
                  >
                    {comment.dateLabel ?? timeAgo(comment.date)}
                  </time>
                </div>
                <div className="text-sm break-words">{comment.body}</div>
              </div>
            </li>
          ))}
        </ul>
      ) : empty ? (
        <Caption className="pt-2">{empty}</Caption>
      ) : null}
    </section>
  )
}

export { Comments }
export type { CommentEntry, CommentsProps, CommentsSort }
