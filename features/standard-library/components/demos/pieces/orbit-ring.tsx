"use client"

import { useState } from "react"

import { Button } from "@/components/standard/button"
import {
  OrbitRing,
  type OrbitItem,
  type OrbitPlacement,
  type OrbitScore,
} from "@/components/standard/orbit-ring"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const STATEMENTS: OrbitItem[] = [
  "I notice what could be improved almost everywhere I look",
  "I feel best when I am helping someone close to me",
  "Getting things done matters more to me than how I feel about them",
  "I often feel different from the people around me",
  "I need time alone to think before I act",
  "I like to know the risks before I commit to anything",
  "I keep my options open in case something better comes along",
  "I say what I think, even when it starts an argument",
  "I go along with others to keep the peace",
].map((label, index) => ({ id: `s${index}`, label }))

/** Seven steps, disagree to agree. The middle one sits at the bottom. */
const AGREE_SCALE: OrbitScore[] = [
  {
    id: "1",
    label: "Strongly disagree",
    color: "#c07661",
    hoverColor: "#de425b",
  },
  { id: "2", label: "Disagree", color: "#d49e8f", hoverColor: "#e67f83" },
  {
    id: "3",
    label: "Slightly disagree",
    color: "#e4c7be",
    hoverColor: "#f0b8b8",
  },
  { id: "4", label: "Neutral", color: "#f1f1f1", hoverColor: "#cfd8e6" },
  { id: "5", label: "Slightly agree", color: "#d1dacd", hoverColor: "#aecdc2" },
  { id: "6", label: "Agree", color: "#b2c4aa", hoverColor: "#6aaa96" },
  { id: "7", label: "Strongly agree", color: "#93ae88", hoverColor: "#00876c" },
]

const FOODS: OrbitItem[] = [
  "Olives",
  "Coriander",
  "Durian",
  "Blue cheese",
  "Anchovies",
  "Liquorice",
  "Kimchi",
  "Marmite",
  "Oysters",
  "Wasabi",
].map((label) => ({ id: label, label }))

const TASTE: OrbitScore[] = [
  { id: "hate", label: "Hate" },
  { id: "dislike", label: "Dislike" },
  { id: "fine", label: "Fine" },
  { id: "like", label: "Like" },
  { id: "love", label: "Love" },
]

const TASKS: OrbitItem[] = [
  "Fix login bug",
  "Write release notes",
  "Update deps",
  "Plan Q3",
  "Review PR",
  "Reply to support",
].map((label) => ({ id: label, label }))

/** Theme tone tokens, so the slices follow the installed theme. */
const PRIORITY: OrbitScore[] = [
  { id: "later", label: "Later", color: "var(--info)" },
  { id: "soon", label: "Soon", color: "var(--warning)" },
  { id: "now", label: "Now", color: "var(--destructive)" },
]

function RendersNote({ text }: { text: string }) {
  return <span className="text-sm text-muted-foreground">{text}</span>
}

/** Remounts the ring so a finished set can be sorted again. */
function RendersAgain({ onClick }: { onClick: () => void }) {
  return (
    <Button tone="outline" size="sm" onClick={onClick}>
      Start over
    </Button>
  )
}

function RendersPersonalityTest() {
  const [round, setRound] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number | null>>({})

  function record({ itemId, scoreId }: OrbitPlacement) {
    const value = Number(scoreId)
    setAnswers((current) => ({
      ...current,
      [itemId]: Number.isNaN(value) ? null : value,
    }))
  }

  const answered = Object.values(answers).filter((v) => v !== null).length
  const flagged = Object.values(answers).filter((v) => v === null).length

  return (
    <RendersDemoCard label="personality test · 7-step scale, auto fit" fill>
      <div className="flex w-full flex-col items-center gap-3">
        <RendersNote text="Drag each statement onto how much you agree" />
        <OrbitRing
          className="w-full"
          key={round}
          items={STATEMENTS}
          scores={AGREE_SCALE}
          maxVisible="auto"
          wrapLabels
          onPlace={record}
          onReturn={(itemId) =>
            setAnswers((current) => ({ ...current, [itemId]: null }))
          }
        />
        <RendersNote
          text={`${answered} answered · ${flagged} skipped or flagged`}
        />
        <RendersAgain
          onClick={() => {
            setRound((r) => r + 1)
            setAnswers({})
          }}
        />
      </div>
    </RendersDemoCard>
  )
}

function RendersWordSort() {
  const [round, setRound] = useState(0)

  return (
    <RendersDemoCard label="word sort · plain scale, results listed" fill>
      <div className="flex w-full flex-col items-center gap-3">
        <OrbitRing
          className="w-full"
          key={round}
          items={FOODS}
          scores={TASTE}
          maxVisible={5}
          showResults
          sound={false}
        />
        <RendersAgain onClick={() => setRound((r) => r + 1)} />
      </div>
    </RendersDemoCard>
  )
}

function RendersTriage() {
  const [round, setRound] = useState(0)
  const [summary, setSummary] = useState("Sort the backlog")

  return (
    <RendersDemoCard label="triage · theme colors, no action ring" fill>
      <div className="flex w-full flex-col items-center gap-3">
        <OrbitRing
          className="w-full"
          key={round}
          items={TASKS}
          scores={PRIORITY}
          actions={[]}
          maxVisible="auto"
          greyUntilHover={false}
          showCounter={false}
          maxWidth={480}
          onComplete={(placements) =>
            setSummary(
              `${placements.filter((p) => p.scoreId === "now").length} to do now`
            )
          }
        />
        <RendersNote text={summary} />
        <RendersAgain
          onClick={() => {
            setRound((r) => r + 1)
            setSummary("Sort the backlog")
          }}
        />
      </div>
    </RendersDemoCard>
  )
}

export function RendersOrbitRingDemo() {
  return (
    <>
      <RendersPersonalityTest />
      <RendersWordSort />
      <RendersTriage />
    </>
  )
}
