"use client"

import { useEffect, useRef, useState } from "react"

import {
  Chatroom,
  type ChatroomMessage,
  type ChatroomUser,
  type ChatroomVariant,
} from "@/components/standard/chatroom"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

/** A time `minutes` before the page loaded, so the log always ends "now". */
function ago(minutes: number) {
  return new Date(Date.now() - minutes * 60 * 1000)
}

const DAY = 24 * 60

const DESIGN_USERS: ChatroomUser[] = [
  { id: "me", name: "You", status: "online" },
  { id: "mara", name: "Mara Quinn", status: "online" },
  { id: "theo", name: "Theo Park", status: "away" },
]

const DESIGN_MESSAGES: ChatroomMessage[] = [
  { id: "d1", userId: "mara", text: "Pushed the new onboarding flow to staging 🎉", time: ago(DAY + 60) },
  { id: "d2", userId: "mara", text: "Step 3 still feels long though", time: ago(DAY + 59) },
  { id: "d3", userId: "theo", text: "Could we fold the avatar upload into step 2?", time: ago(DAY + 53) },
  { id: "d4", userId: "me", text: "Yes — and make it skippable.", time: ago(DAY + 50) },
  { id: "d5", userId: "me", text: "I'll mock it up this morning.", time: ago(40) },
  { id: "d6", userId: "mara", text: "Perfect. Ping me when it's up and I'll review before standup.", time: ago(38) },
]

const LAUNCH_USERS: ChatroomUser[] = [
  { id: "me", name: "You", color: "#38bdf8", status: "online" },
  { id: "ana", name: "Ana Ruiz", color: "#f472b6", status: "online" },
  { id: "kofi", name: "Kofi Mensah", color: "#a78bfa", status: "online" },
  { id: "lena", name: "Lena Fischer", color: "#34d399", status: "busy" },
  { id: "sam", name: "Sam Ito", color: "#fbbf24", status: "offline" },
]

const LAUNCH_MESSAGES: ChatroomMessage[] = [
  { id: "l1", userId: "kofi", kind: "system", text: "Kofi Mensah joined #launch", time: ago(95) },
  { id: "l2", userId: "ana", text: "Morning! Launch checklist is pinned. Two blockers left.", time: ago(84) },
  { id: "l3", userId: "ana", text: "1. Pricing page copy\n2. Status page DNS", time: ago(84) },
  { id: "l4", userId: "lena", text: "DNS is propagating now, should be green within the hour.", time: ago(70) },
  { id: "l5", userId: "kofi", text: "Copy is in review, Sam has the final pass.", time: ago(63) },
  { id: "l6", userId: "ana", text: "🙌 then we're on track for 2pm.", time: ago(62) },
]

const IRC_USERS: ChatroomUser[] = [
  { id: "me", name: "guest42" },
  { id: "jayrr", name: "jayrr" },
  { id: "nullptr", name: "nullptr" },
  { id: "ferris", name: "ferris" },
]

const IRC_MESSAGES: ChatroomMessage[] = [
  { id: "i1", userId: "nullptr", kind: "system", text: "Topic for #jayrr: components, shaders & bad puns", time: ago(9) },
  { id: "i2", userId: "ferris", text: "anyone tried the new flip-dots block?", time: ago(8) },
  { id: "i3", userId: "jayrr", text: "the snake pattern plays itself, it's hypnotic", time: ago(7) },
  { id: "i4", userId: "nullptr", text: "i left it running for an hour. no regrets", time: ago(5) },
  { id: "i5", userId: "me", kind: "system", text: "guest42 has joined #jayrr", time: ago(4) },
]

const REPLIES = [
  "Makes sense to me.",
  "Good call 👍",
  "Let me check and get back to you.",
  "Ha, agreed.",
  "Can you share a link?",
  "On it.",
]

/**
 * A controlled room where, after you send, another member types for a
 * moment and answers.
 */
function RendersLiveRoom({
  variant,
  users,
  initial,
  title,
  description,
  className,
}: {
  variant: ChatroomVariant
  users: ChatroomUser[]
  initial: ChatroomMessage[]
  title: string
  description?: string
  className?: string
}) {
  const [messages, setMessages] = useState(initial)
  const [typing, setTyping] = useState<string[]>([])
  const timers = useRef<number[]>([])
  const count = useRef(0)

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((timer) => window.clearTimeout(timer))
  }, [])

  const send = (text: string) => {
    count.current += 1
    const n = count.current
    setMessages((current) => [
      ...current,
      { id: `sent-${n}`, userId: "me", text, time: new Date() },
    ])

    const others = users.filter((user) => user.id !== "me" && user.status !== "offline")
    const replier = others[n % others.length]
    if (!replier) return

    timers.current.push(
      window.setTimeout(() => setTyping([replier.id]), 500),
      window.setTimeout(() => {
        setTyping([])
        setMessages((current) => [
          ...current,
          {
            id: `reply-${n}`,
            userId: replier.id,
            text: REPLIES[n % REPLIES.length],
            time: new Date(),
          },
        ])
      }, 2000)
    )
  }

  return (
    <Chatroom
      variant={variant}
      users={users}
      currentUserId="me"
      messages={messages}
      onSend={send}
      typing={typing}
      title={title}
      description={description}
      className={className}
    />
  )
}

export function RendersChatroomDemo() {
  return (
    <div data-fill className="flex w-full flex-col gap-3">
      <RendersDemoCard fill label="bubbles · messenger style">
        <RendersLiveRoom
          variant="bubbles"
          users={DESIGN_USERS}
          initial={DESIGN_MESSAGES}
          title="Design crit"
        />
      </RendersDemoCard>
      <RendersDemoCard fill label="channel · team chat">
        <RendersLiveRoom
          variant="channel"
          users={LAUNCH_USERS}
          initial={LAUNCH_MESSAGES}
          title="#launch"
        />
      </RendersDemoCard>
      <RendersDemoCard fill label="terminal · irc log">
        <RendersLiveRoom
          variant="terminal"
          users={IRC_USERS}
          initial={IRC_MESSAGES}
          title="#jayrr"
          description="components, shaders & bad puns"
          className="h-80"
        />
      </RendersDemoCard>
    </div>
  )
}
