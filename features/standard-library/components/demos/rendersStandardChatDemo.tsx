"use client"

import { useEffect, useRef, useState } from "react"
import {
  ChevronDownIcon,
  PlusIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "lucide-react"

import { Button } from "@/components/standard/button"
import { Avatar } from "@/components/standard/avatar"
import { Chat, SideChat, type ChatMessage } from "@/components/standard/chat"
import { Gradient } from "@/components/standard/gradient"
import { MicButton } from "@/components/standard/mic-button"
import { Select } from "@/components/standard/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const replies = [
  "Scroll jumps usually come from the container following every streamed token. Anchor the new user turn to the top of the view instead, and let the reply grow underneath it.",
  "Keep the scroll position when you prepend older messages, and only auto-follow when the reader is already at the bottom. Otherwise show a jump-to-latest button.",
  "Short answer: yes. Measure once per frame, not once per token, and the thread stops shaking.",
]

const thread: ChatMessage[] = [
  { id: "d", role: "system", content: "Today" },
  {
    id: "t1",
    role: "assistant",
    author: "Maya Chen",
    content: "Did anyone look at the flip-dot board on mobile?",
    footer: "9:41",
  },
  {
    id: "t2",
    role: "assistant",
    author: "Theo Ortiz",
    content: "Yes, it pauses off screen now. Screenshots attached.",
    attachments: [
      { name: "flip-dots-mobile.png", description: "412 KB" },
      { name: "notes.pdf", description: "PDF · 88 KB" },
    ],
    footer: "9:43",
  },
  {
    id: "t3",
    role: "user",
    content: "Nice, merging it this afternoon.",
    footer: "9:44",
  },
]

const MODEL_OPTIONS = [
  { value: "quick", label: "Quick" },
  { value: "balanced", label: "Balanced" },
  { value: "deep", label: "Deep" },
]

const EFFORT_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
]

// A collapsed summary of the agent's steps, opened to show each one.
function RendersWorkLog({
  summary,
  steps,
}: {
  summary: string
  steps: string[]
}) {
  return (
    <Collapsible className="flex flex-col gap-1.5">
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="group/log flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          {summary}
          <ChevronDownIcon className="size-3.5 transition-transform group-data-[state=open]/log:rotate-180" />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="flex flex-col gap-1.5 border-s ps-3 text-sm text-muted-foreground">
          {steps.map((step) => (
            <span key={step}>{step}</span>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function RendersFeedback({ time }: { time: string }) {
  const [vote, setVote] = useState<"up" | "down" | null>(null)

  return (
    <>
      <Button
        type="button"
        tone="ghost"
        size="xs"
        iconOnly
        aria-label="Good reply"
        aria-pressed={vote === "up"}
        onClick={() => setVote(vote === "up" ? null : "up")}
      >
        <ThumbsUpIcon className={vote === "up" ? "fill-current" : undefined} />
      </Button>
      <Button
        type="button"
        tone="ghost"
        size="xs"
        iconOnly
        aria-label="Bad reply"
        aria-pressed={vote === "down"}
        onClick={() => setVote(vote === "down" ? null : "down")}
      >
        <ThumbsDownIcon
          className={vote === "down" ? "fill-current" : undefined}
        />
      </Button>
      <span className="ms-1">{time}</span>
    </>
  )
}

const agentRun: ChatMessage[] = [
  { id: "a1", role: "user", content: "Can you run the dev server?" },
  {
    id: "a2",
    role: "assistant",
    plain: true,
    content: "Started on port 3000. It's watching for changes.",
  },
  { id: "a3", role: "user", content: "The screenshot tool isn't working." },
  {
    id: "a4",
    role: "assistant",
    plain: true,
    text: "Six copies of the screenshot tool were stuck. They're closed and one fresh copy is running. Press Win+Shift+S to try again.",
    content: (
      <div className="flex flex-col gap-3">
        <RendersWorkLog
          summary="Worked for 42s"
          steps={[
            "Thought for 2s",
            "Checked whether the tool is installed and running",
            "Found six stuck processes",
            "Ran 2 commands: closed them and started one copy",
          ]}
        />
        <p>
          Six copies of the screenshot tool were stuck, so none of them could
          answer. They&apos;re closed now, and one fresh copy is running.
        </p>
        <p>
          Press <strong>Win+Shift+S</strong>. The snip bar should appear. If it
          still does nothing, say so and we&apos;ll reset the app.
        </p>
      </div>
    ),
    footer: <RendersFeedback time="3h ago" />,
  },
]

// Stands in for a model: "thinks", then streams a canned reply word by word.
function useFakeAssistant({
  answers = replies,
  author,
  initial = [],
}: {
  answers?: string[]
  author?: string
  initial?: ChatMessage[]
} = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initial)
  const [pending, setPending] = useState<string | false>(false)
  const turn = useRef(0)
  const timers = useRef<number[]>([])

  useEffect(() => {
    const list = timers.current
    return () => list.forEach(window.clearTimeout)
  }, [])

  function reply(replaceId?: string) {
    const words = answers[turn.current++ % answers.length].split(" ")
    const id = replaceId ?? crypto.randomUUID()
    if (replaceId) {
      setMessages((list) => list.filter((message) => message.id !== id))
    }
    setPending("Thinking…")
    timers.current.push(
      window.setTimeout(() => {
        setPending(false)
        words.forEach((_, index) => {
          timers.current.push(
            window.setTimeout(() => {
              const content = words.slice(0, index + 1).join(" ")
              setMessages((list) => [
                ...list.filter((message) => message.id !== id),
                { id, role: "assistant", author, content },
              ])
            }, index * 40)
          )
        })
      }, 900)
    )
  }

  return {
    messages,
    pending,
    reset() {
      timers.current.forEach(window.clearTimeout)
      setMessages(initial)
      setPending(false)
    },
    send(text: string, files: File[]) {
      setMessages((list) => [
        ...list,
        {
          id: crypto.randomUUID(),
          role: "user",
          content: text,
          attachments: files.map((file) => ({
            name: file.name,
            description: `${Math.max(1, Math.round(file.size / 1024))} KB`,
          })),
        },
      ])
      reply()
    },
    regenerate: (message: ChatMessage) => reply(message.id),
  }
}

function RendersAssistantChat() {
  const chat = useFakeAssistant()

  return (
    <Chat
      className="h-120"
      label="New chat"
      trailing={
        <Button
          size="xs"
          tone="ghost"
          leading={<PlusIcon />}
          onClick={chat.reset}
        >
          New
        </Button>
      }
      messages={chat.messages}
      pending={chat.pending}
      onSend={chat.send}
      onRegenerate={chat.regenerate}
      attachments
      suggestions={[
        "Why does my chat jump while streaming?",
        "How do I load older messages?",
        "Explain scroll anchoring",
      ]}
      hint="Replies are simulated in this demo."
    />
  )
}

function RendersTeamThread() {
  const [messages, setMessages] = useState(thread)

  return (
    <Chat
      className="h-104"
      label="#design-system"
      showAvatars
      copyable={false}
      messages={messages}
      placeholder="Message #design-system"
      onSend={(text) =>
        setMessages((list) => [
          ...list,
          {
            id: crypto.randomUUID(),
            role: "user",
            content: text,
            footer: "now",
          },
        ])
      }
    />
  )
}

function RendersAgentRun() {
  const [messages, setMessages] = useState(agentRun)
  const [model, setModel] = useState("balanced")
  const [effort, setEffort] = useState("medium")

  return (
    <Chat
      className="h-136"
      messages={messages}
      placeholder="Send a follow-up"
      attachments
      followUps={["Fast-forward the branch"]}
      tools={
        <>
          <Select
            appearance="toolbar"
            aria-label="Model"
            options={MODEL_OPTIONS}
            value={model}
            onValueChange={setModel}
          />
          <Select
            appearance="toolbar"
            aria-label="Effort"
            options={EFFORT_OPTIONS}
            value={effort}
            onValueChange={setEffort}
          />
        </>
      }
      onSend={(text) =>
        setMessages((list) => [
          ...list,
          ...(list.some((message) => message.role === "system")
            ? []
            : [{ id: "new", role: "system" as const, content: "New" }]),
          { id: crypto.randomUUID(), role: "user", content: text },
        ])
      }
    />
  )
}

function RendersGreeting() {
  const chat = useFakeAssistant()
  const [model, setModel] = useState("quick")

  return (
    <Chat
      className="h-88"
      background={
        <Gradient
          kind="radial"
          at="50% 100%"
          colors={[
            "color-mix(in oklch, var(--primary) 18%, transparent)",
            "transparent 70%",
          ]}
        />
      }
      messages={chat.messages}
      pending={chat.pending}
      onSend={chat.send}
      placeholder="Ask anything"
      attachments
      empty={
        <span className="bg-linear-to-r from-primary to-foreground bg-clip-text text-3xl font-medium text-transparent">
          Hi there, what&apos;s on your mind?
        </span>
      }
      tools={
        <>
          <Select
            appearance="toolbar"
            aria-label="Model"
            options={MODEL_OPTIONS}
            value={model}
            onValueChange={setModel}
          />
          <MicButton iconOnly tone="ghost" size="sm" meter={false}>
            Dictate
          </MicButton>
        </>
      }
    />
  )
}

const supportAnswers = [
  "Happy to help! Your last order shipped this morning and should arrive Thursday. I've sent the tracking link to your email.",
  "You can switch plans any time from Settings → Billing. The change starts on your next billing date, so nothing is charged today.",
  "I'll bring in someone from the team. They usually reply within a few minutes, and you'll get an email if you step away.",
]

const supportGreeting: ChatMessage[] = [
  {
    id: "hello",
    role: "assistant",
    author: "Jev",
    content: "Hi! I'm Jev. What can I help you with today?",
  },
]

function RendersSideChat() {
  const chat = useFakeAssistant({
    answers: supportAnswers,
    author: "Jev",
    initial: supportGreeting,
  })

  return (
    <div className="relative h-160 w-full overflow-hidden rounded-xl border bg-muted/40">
      <div className="flex flex-col gap-3 p-6">
        <div className="h-6 w-40 rounded-md bg-muted" />
        <div className="h-4 w-72 max-w-full rounded-md bg-muted" />
        <div className="h-4 w-56 max-w-full rounded-md bg-muted" />
      </div>
      <SideChat
        position="absolute"
        defaultOpen
        unread={1}
        launcherLabel="Chat with support"
        label={
          <span className="flex items-center gap-2">
            <Avatar size="sm" alt="Jev" fallback="J" />
            <span className="flex flex-col leading-tight">
              <span>Jev</span>
              <span className="text-xs font-normal text-muted-foreground">
                Replies in a few minutes
              </span>
            </span>
          </span>
        }
        showAvatars
        replyBubble="speech"
        copyable={false}
        attachments
        messages={chat.messages}
        pending={chat.pending ? "Jev is typing…" : false}
        onSend={chat.send}
        placeholder="Ask Jev…"
        followUps={
          chat.messages.length === 1
            ? ["Where's my order?", "Change my plan", "Talk to a person"]
            : undefined
        }
        hint="Replies are simulated in this demo."
      />
    </div>
  )
}

export function RendersStandardChatDemo() {
  return (
    <div className="flex w-full flex-col gap-4">
      <RendersDemoCard label="AI assistant" fill>
        <RendersAssistantChat />
      </RendersDemoCard>
      <RendersDemoCard label="Team thread" fill>
        <RendersTeamThread />
      </RendersDemoCard>
      <RendersDemoCard label="Agent run · work log, feedback, follow-ups" fill>
        <RendersAgentRun />
      </RendersDemoCard>
      <RendersDemoCard label="Greeting · model picker and mic" fill>
        <RendersGreeting />
      </RendersDemoCard>
      <RendersDemoCard label="Side chat · support widget" fill>
        <RendersSideChat />
      </RendersDemoCard>
    </div>
  )
}
