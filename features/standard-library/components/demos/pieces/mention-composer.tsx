"use client"

import * as React from "react"
import { PaperclipIcon } from "lucide-react"

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

function SentMessages() {
  const [sent, setSent] = React.useState<MentionComposerValue[]>([])

  return (
    <div className="flex flex-col gap-2">
      {sent.length > 0 ? (
        <ul className="flex flex-col gap-1 text-sm">
          {sent.map((message, index) => (
            <li key={index} className="rounded-md bg-muted px-3 py-2">
              <p className="whitespace-pre-wrap">{message.text}</p>
              {message.mentions.length > 0 ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Mentions:{" "}
                  {message.mentions.map((mention) => mention.value).join(", ")}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
      <MentionComposer
        users={USERS}
        tags={TAGS}
        onSubmit={(value) => setSent((previous) => [...previous, value])}
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
      <RendersDemoCard label="Send with mentions">
        <SentMessages />
      </RendersDemoCard>
      <RendersDemoCard label="Disabled">
        <MentionComposer users={USERS} disabled />
      </RendersDemoCard>
    </>
  )
}
