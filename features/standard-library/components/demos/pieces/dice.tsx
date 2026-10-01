"use client"

import { useState } from "react"

import { Button } from "@/components/standard/button"
import { Dice, type DieSpec } from "@/components/standard/dice"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const ROLLS_PER_TURN = 3

/** A coloured set from the theme's tone and chart tokens. */
const GEM_SET: DieSpec[] = [
  { sides: 4, color: "var(--success)", ink: "var(--success-foreground)" },
  { sides: 6, color: "var(--info)", ink: "var(--info-foreground)" },
  { sides: 8, color: "var(--warning)", ink: "var(--warning-foreground)" },
  { sides: 10, color: "var(--destructive)", ink: "white" },
  { sides: 12, color: "var(--chart-2)", ink: "var(--background)" },
  { sides: 20, color: "var(--foreground)", ink: "var(--background)" },
  { sides: 100, color: "var(--chart-1)", ink: "var(--background)" },
]

function RendersNote({ text }: { text: string }) {
  return <span className="text-sm text-muted-foreground">{text}</span>
}

function RendersBoardGameDice() {
  const [note, setNote] = useState("Roll to move")

  return (
    <RendersDemoCard label="two dice · board game">
      <div className="flex w-full flex-col items-center gap-2">
        <Dice
          count={2}
          defaultValues={[3, 4]}
          onRoll={(values, total) =>
            setNote(
              values[0] === values[1]
                ? `Doubles! Move ${total} and roll again`
                : `Move ${total} spaces`
            )
          }
        />
        <RendersNote text={note} />
      </div>
    </RendersDemoCard>
  )
}

/** Five dice, three rolls a turn, click a die to keep it. */
function RendersYahtzeeDice() {
  const [values, setValues] = useState([1, 2, 3, 4, 5])
  const [held, setHeld] = useState<number[]>([])
  const [rollsLeft, setRollsLeft] = useState(ROLLS_PER_TURN)
  const counts = values.reduce<Record<number, number>>(
    (tally, value) => ({ ...tally, [value]: (tally[value] ?? 0) + 1 }),
    {}
  )
  const most = Math.max(...Object.values(counts))
  const sorted = [...new Set(values)].sort((a, b) => a - b).join("")
  const hand =
    most === 5
      ? "Five of a kind!"
      : sorted === "12345" || sorted === "23456"
        ? "Large straight"
        : /1234|2345|3456/.test(sorted)
          ? "Small straight"
          : most === 4
            ? "Four of a kind"
            : most === 3 && Object.keys(counts).length === 2
              ? "Full house"
              : most === 3
                ? "Three of a kind"
                : "Chance"

  return (
    <RendersDemoCard label="holdable · five dice, three rolls">
      <div className="flex w-full flex-col items-center gap-2">
        <Dice
          values={values}
          onValuesChange={setValues}
          held={held}
          onHeldChange={setHeld}
          holdable
          size="sm"
          disabled={rollsLeft === 0}
          rollLabel={`Roll (${rollsLeft} left)`}
          onRoll={() => setRollsLeft((left) => left - 1)}
        />
        <RendersNote text={hand} />
        <Button
          tone="ghost"
          size="sm"
          onClick={() => {
            setHeld([])
            setRollsLeft(ROLLS_PER_TURN)
          }}
        >
          New turn
        </Button>
      </div>
    </RendersDemoCard>
  )
}

function RendersSingleDie() {
  return (
    <RendersDemoCard label="one die · size lg">
      <Dice size="lg" defaultValues={[6]} />
    </RendersDemoCard>
  )
}

function RendersInverseDice() {
  return (
    <RendersDemoCard label="tone inverse · click a die to roll">
      <Dice
        count={3}
        tone="inverse"
        rollButton="none"
        defaultValues={[2, 5, 1]}
      />
    </RendersDemoCard>
  )
}

function RendersManyDice() {
  const [history, setHistory] = useState<number[]>([])

  return (
    <RendersDemoCard label="ten dice · size sm">
      <div className="flex w-full flex-col items-center gap-2">
        <Dice
          count={10}
          size="sm"
          rollLabel="Roll 10d6"
          onRoll={(_, total) =>
            setHistory((current) => [total, ...current].slice(0, 6))
          }
        />
        <RendersNote
          text={
            history.length > 0
              ? `Last totals: ${history.join(", ")}`
              : "Ten dice, one total"
          }
        />
      </div>
    </RendersDemoCard>
  )
}

/** A d20 check: natural 20 and natural 1 call themselves out. */
function RendersAbilityCheck() {
  const [note, setNote] = useState("Stealth check, DC 15")

  return (
    <RendersDemoCard label="d20 + modifier · ability check">
      <div className="flex w-full flex-col items-center gap-2">
        <Dice
          dice={[20]}
          modifier={5}
          size="lg"
          rollLabel="Roll Stealth"
          onRoll={([natural], total) =>
            setNote(
              natural === 20
                ? "Natural 20! Critical success"
                : natural === 1
                  ? "Natural 1. Critical fail"
                  : total >= 15
                    ? `${total}: you slip past unseen`
                    : `${total}: the guard turns around`
            )
          }
        />
        <RendersNote text={note} />
      </div>
    </RendersDemoCard>
  )
}

/** Two d20s, keep the higher (advantage) or the lower (disadvantage). */
function RendersAdvantage() {
  const [mode, setMode] = useState<"advantage" | "disadvantage">("advantage")
  const [note, setNote] = useState("Roll two, keep one")

  return (
    <RendersDemoCard label="advantage · two d20s, keep one">
      <div className="flex w-full flex-col items-center gap-2">
        <Dice
          dice={[20, 20]}
          showTotal={false}
          rollLabel={
            mode === "advantage"
              ? "Roll with advantage"
              : "Roll with disadvantage"
          }
          onRoll={(values) => {
            const kept =
              mode === "advantage" ? Math.max(...values) : Math.min(...values)
            setNote(`Keep ${kept}`)
          }}
        />
        <RendersNote text={note} />
        <Button
          tone="ghost"
          size="sm"
          onClick={() =>
            setMode((current) =>
              current === "advantage" ? "disadvantage" : "advantage"
            )
          }
        >
          Switch to {mode === "advantage" ? "disadvantage" : "advantage"}
        </Button>
      </div>
    </RendersDemoCard>
  )
}

function RendersFullSet() {
  return (
    <RendersDemoCard label="the full set · d4 to d100, theme colours">
      <Dice dice={GEM_SET} showTotal={false} rollLabel="Roll the set" />
    </RendersDemoCard>
  )
}

function RendersDamageRoll() {
  return (
    <RendersDemoCard label="mixed · 2d8 + 1d6 + 3 damage">
      <Dice dice={[8, 8, 6]} modifier={3} rollLabel="Roll damage" />
    </RendersDemoCard>
  )
}

function RendersInverseD20() {
  return (
    <RendersDemoCard label="tone inverse · click the d20">
      <Dice
        dice={[20]}
        tone="inverse"
        size="lg"
        rollButton="none"
        showKind={false}
      />
    </RendersDemoCard>
  )
}

/** Grab a die, drag it and let go: it slides, bounces and settles. */
function RendersDiceTray() {
  const [note, setNote] = useState("Throw them, or grab one and flick it")

  return (
    <RendersDemoCard label="variant tray · grab and throw" fill>
      <div className="flex w-full flex-col items-center gap-2">
        <Dice
          variant="tray"
          count={2}
          rollLabel="Throw both"
          onRoll={(values, total) =>
            setNote(
              values[0] === values[1]
                ? `Doubles! ${total}`
                : `${values.join(" + ")} = ${total}`
            )
          }
        />
        <RendersNote text={note} />
      </div>
    </RendersDemoCard>
  )
}

function RendersDungeonTray() {
  return (
    <RendersDemoCard label="tray · a D&D handful" fill>
      <Dice
        variant="tray"
        dice={GEM_SET}
        showTotal={false}
        rollLabel="Throw the set"
      />
    </RendersDemoCard>
  )
}

export function RendersDiceDemo() {
  return (
    <>
      <RendersDiceTray />
      <RendersDungeonTray />
      <RendersBoardGameDice />
      <RendersAbilityCheck />
      <RendersFullSet />
      <RendersAdvantage />
      <RendersDamageRoll />
      <RendersInverseD20 />
      <RendersYahtzeeDice />
      <RendersSingleDie />
      <RendersInverseDice />
      <RendersManyDice />
    </>
  )
}
