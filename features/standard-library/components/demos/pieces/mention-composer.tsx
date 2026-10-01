"use client"

import * as React from "react"
import { PaperclipIcon } from "lucide-react"

import { Avatar } from "@/components/standard/avatar"
import { Button } from "@/components/standard/button"
import {
  MentionComposer,
  type MentionComposerValue,
  type MentionTag,
  type MentionUser,
} from "@/components/standard/mention-composer"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const USERS: MentionUser[] = [
  { id: "1", name: "Ana Lopez" },
  { id: "2", name: "Ben Carter" },
  { id: "3", name: "Chloe Nguyen" },
  { id: "4", name: "Dev Patel" },
]

const TAGS: MentionTag[] = [
  { id: "urgent", label: "urgent" },
  { id: "framing", label: "framing" },
  { id: "inspection", label: "inspection" },
]

type Message = {
  author: string
  text: string
  mentions: string[]
}

const SEED: Message[] = [
  {
    author: "Ana Lopez",
    text: "@Ben Carter can you confirm the #inspection is still Thursday?",
    mentions: ["@Ben Carter", "#inspection"],
  },
  {
    author: "Ben Carter",
    text: "Yes, 9am. Looping in @Dev Patel for the #framing walkthrough.",
    mentions: ["@Dev Patel", "#framing"],
  },
]

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join("")
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/** The message text with each @person and #tag picked out. */
function MessageText({ text, mentions }: Omit<Message, "author">) {
  if (mentions.length === 0) {
    return <>{text}</>
  }
  const pattern = new RegExp(
    `(${[...new Set(mentions)].map(escapeRegExp).join("|")})`
  )
  return (
    <>
      {text.split(pattern).map((part, index) =>
        index % 2 === 1 ? (
          <span
            key={index}
            className="rounded-sm bg-primary/10 px-1 font-medium text-primary"
          >
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  )
}

function Thread() {
  const [messages, setMessages] = React.useState<Message[]>(SEED)
  const listRef = React.useRef<HTMLUListElement>(null)

  React.useEffect(() => {
    const list = listRef.current
    if (list) {
      list.scrollTop = list.scrollHeight
    }
  }, [messages])

  const send = (value: MentionComposerValue) =>
    setMessages((previous) => [
      ...previous,
      {
        author: "You",
        text: value.text,
        mentions: value.mentions.map((mention) => String(mention.value)),
      },
    ])

  return (
    <div className="flex w-full flex-col gap-3">
      <ul
        ref={listRef}
        className="flex max-h-56 flex-col gap-3 overflow-y-auto text-sm"
      >
        {messages.map((message, index) => (
          <li key={index} className="flex gap-2">
            <Avatar size="xs" alt="" fallback={initials(message.author)} />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground">
                {message.author}
              </p>
              <p className="break-words whitespace-pre-wrap">
                <MessageText text={message.text} mentions={message.mentions} />
              </p>
            </div>
          </li>
        ))}
      </ul>
      <MentionComposer
        users={USERS}
        tags={TAGS}
        onSubmit={send}
        leading={
          <Button iconOnly size="sm" tone="ghost" aria-label="Attach file">
            <PaperclipIcon />
          </Button>
        }
      />
    </div>
  )
}

export function RendersMentionComposerDemo() {
  return (
    <>
      <RendersDemoCard label="Thread">
        <Thread />
      </RendersDemoCard>
      <RendersDemoCard label="Disabled">
        <MentionComposer
          users={USERS}
          placeholder="You can't post in this channel"
          disabled
          leading={
            <Button iconOnly size="sm" tone="ghost" aria-label="Attach file">
              <PaperclipIcon />
            </Button>
          }
        />
      </RendersDemoCard>
    </>
  )
}
