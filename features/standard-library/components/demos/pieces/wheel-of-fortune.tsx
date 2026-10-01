"use client"

import { useState } from "react"

import { Button } from "@/components/standard/button"
import { Switch } from "@/components/standard/switch"
import {
  WheelOfFortune,
  type WheelSegment,
} from "@/components/standard/wheel-of-fortune"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const PRIZES: WheelSegment[] = [
  { label: "10% off", description: "Use code SPIN10 at checkout." },
  { label: "Free ship", description: "Free shipping on your next order." },
  { label: "Try again", description: "So close. Give it another spin." },
  { label: "20% off", description: "Use code SPIN20 at checkout." },
  { label: "Mystery", description: "A surprise ships with your order." },
  { label: "Try again", description: "So close. Give it another spin." },
  { label: "5% off", description: "Use code SPIN5 at checkout." },
  { label: "Jackpot", description: "Your next order is on us." },
]

const FLING: WheelSegment[] = [
  { label: "Coffee", description: "Grab a coffee on the house." },
  { label: "Sticker", description: "A sticker pack is on its way." },
  { label: "Tote", description: "A canvas tote, yours to keep." },
  { label: "Nothing", description: "Not this time. Fling again." },
  { label: "Mug", description: "A mug for the coffee." },
  { label: "Hoodie", description: "The good hoodie. Nice fling." },
]

/** Theme chart and tone tokens, so the colours follow the installed theme. */
const COLORED: WheelSegment[] = [
  { label: "Pizza", color: "var(--chart-1)", textColor: "var(--background)" },
  { label: "Sushi", color: "var(--info)", textColor: "var(--info-foreground)" },
  {
    label: "Tacos",
    color: "var(--warning)",
    textColor: "var(--warning-foreground)",
  },
  {
    label: "Salad",
    color: "var(--success)",
    textColor: "var(--success-foreground)",
  },
  {
    label: "Ramen",
    color: "var(--destructive)",
    textColor: "var(--background)",
  },
  { label: "Burgers", color: "var(--chart-3)", textColor: "var(--foreground)" },
]

const DAILY: WheelSegment[] = [
  { label: "50 coins", description: "Added to your balance." },
  { label: "2× XP", description: "Double XP for the next hour." },
  { label: "100 coins", description: "Added to your balance." },
  { label: "Skin", description: "A new skin is in your locker." },
  { label: "10 coins", description: "Added to your balance." },
  { label: "Chest", description: "Open it from your inventory." },
]

const TEAM = ["Ada", "Alan", "Grace", "Linus", "Margaret", "Tim"]

const WEIGHTED: WheelSegment[] = [
  { label: "Jackpot", weight: 1 },
  { label: "Try again", weight: 6 },
  { label: "Small prize", weight: 3 },
  { label: "Try again", weight: 6 },
]

function RendersResult({ text }: { text: string }) {
  return (
    <span className="text-sm text-muted-foreground" aria-hidden>
      {text}
    </span>
  )
}

function RendersPrizeWheel() {
  return (
    <RendersDemoCard label="prize wheel · prize window">
      <div className="flex w-full flex-col items-center gap-3">
        <WheelOfFortune segments={PRIZES} />
      </div>
    </RendersDemoCard>
  )
}

function RendersDragWheel() {
  const [spins, setSpins] = useState(0)

  return (
    <RendersDemoCard label="variant drag · no button, fling only">
      <div className="flex w-full flex-col items-center gap-3">
        <WheelOfFortune
          variant="drag"
          spinButton="none"
          segments={FLING}
          resultEyebrow="You won a"
          onSpinEnd={() => setSpins((count) => count + 1)}
        />
        <RendersResult
          text={
            spins === 0
              ? "Grab the wheel and fling it, harder spins longer"
              : `${spins} ${spins === 1 ? "spin" : "spins"} so far`
          }
        />
      </div>
    </RendersDemoCard>
  )
}

function RendersButtonBelowWheel() {
  return (
    <RendersDemoCard label="spinButton below · daily reward">
      <WheelOfFortune
        segments={DAILY}
        spinButton="below"
        spinLabel="Claim daily spin"
        resultEyebrow="Today's reward"
      />
    </RendersDemoCard>
  )
}

function RendersColoredWheel() {
  const [result, setResult] = useState("What's for lunch?")

  return (
    <RendersDemoCard label="custom colors · theme tokens">
      <div className="flex w-full flex-col items-center gap-3">
        <WheelOfFortune
          segments={COLORED}
          duration={4}
          spinLabel="Lunch"
          onSpinStart={() => setResult("Deciding…")}
          onSpinEnd={(segment) => setResult(`Lunch is ${segment.label}`)}
        />
        <RendersResult text={result} />
      </div>
    </RendersDemoCard>
  )
}

function RendersPickerWheel() {
  const [names, setNames] = useState(TEAM)
  const [removeWinner, setRemoveWinner] = useState(true)
  const [picked, setPicked] = useState<string[]>([])

  return (
    <RendersDemoCard label="name picker · remove the winner">
      <div className="flex w-full flex-col items-center gap-3">
        <WheelOfFortune
          segments={names.map((label) => ({ label }))}
          spinLabel="Pick"
          duration={3}
          turns={4}
          onSpinEnd={(segment, index) => {
            setPicked((current) => [...current, segment.label])
            if (removeWinner) {
              setNames((current) => current.filter((_, i) => i !== index))
            }
          }}
        />
        <span className="text-sm text-muted-foreground">
          {picked.length > 0
            ? `Order: ${picked.join(", ")}`
            : "Who presents first?"}
        </span>
        <div className="flex items-center gap-3">
          <Switch
            size="sm"
            label="Remove the winner"
            checked={removeWinner}
            onCheckedChange={setRemoveWinner}
          />
          <Button
            tone="outline"
            size="sm"
            onClick={() => {
              setNames(TEAM)
              setPicked([])
            }}
          >
            Reset
          </Button>
        </div>
      </div>
    </RendersDemoCard>
  )
}

function RendersWeightedWheel() {
  const [tally, setTally] = useState<Record<string, number>>({})

  return (
    <RendersDemoCard label="weighted odds · same size slices">
      <div className="flex w-full flex-col items-center gap-3">
        <WheelOfFortune
          segments={WEIGHTED}
          resultWindow={false}
          duration={2.5}
          turns={3}
          onSpinEnd={(segment) =>
            setTally((current) => ({
              ...current,
              [segment.label]: (current[segment.label] ?? 0) + 1,
            }))
          }
        />
        <span className="text-xs text-muted-foreground">
          Odds: Jackpot 1 in 16, Small prize 3 in 16, Try again 12 in 16
        </span>
        <span className="text-sm text-muted-foreground">
          {Object.keys(tally).length > 0
            ? Object.entries(tally)
                .map(([label, count]) => `${label} ×${count}`)
                .join(" · ")
            : "Spin a few times to see the odds"}
        </span>
      </div>
    </RendersDemoCard>
  )
}

function RendersYesNoWheel() {
  const [result, setResult] = useState("Ask a yes or no question")

  return (
    <RendersDemoCard label="two slices · yes or no">
      <div className="flex w-full flex-col items-center gap-3">
        <WheelOfFortune
          segments={[{ label: "Yes" }, { label: "No" }]}
          resultWindow={false}
          className="max-w-48"
          duration={3}
          spinLabel="Ask"
          onSpinStart={() => setResult("Thinking…")}
          onSpinEnd={(segment) => setResult(segment.label)}
        />
        <RendersResult text={result} />
      </div>
    </RendersDemoCard>
  )
}

export function RendersWheelOfFortuneDemo() {
  return (
    <>
      <RendersPrizeWheel />
      <RendersDragWheel />
      <RendersButtonBelowWheel />
      <RendersColoredWheel />
      <RendersPickerWheel />
      <RendersWeightedWheel />
      <RendersYesNoWheel />
    </>
  )
}
