"use client"

import { useState } from "react"

import {
  CharacterChat,
  type CharacterChatLine,
  type CharacterChatVariant,
} from "@/components/standard/character-chat"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"
import { cn } from "@/lib/utils"

/** A flat-shaded bust, standing in for character art. */
function RendersBust({
  hair,
  skin = "#f2d3b8",
  shirt,
  flip = false,
}: {
  hair: string
  skin?: string
  shirt: string
  flip?: boolean
}) {
  return (
    <svg
      viewBox="0 0 100 130"
      className="block h-auto w-full drop-shadow-[0_4px_6px_rgb(0_0_0/0.35)]"
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      <path d="M8 130c2-26 18-38 42-38s40 12 42 38Z" fill={shirt} />
      <path d="M42 80h16v16c-3 4-13 4-16 0Z" fill={skin} />
      <path
        d="M22 52c0-24 12-38 28-38s30 12 30 36c0 12-2 22-4 30H26c-3-8-4-18-4-28Z"
        fill={hair}
      />
      <ellipse cx="50" cy="56" rx="20" ry="24" fill={skin} />
      <path d="M29 48c6-16 18-22 34-18 6 2 10 8 12 16-10-6-26-10-46 2Z" fill={hair} />
      <circle cx="42" cy="58" r="2.4" fill="#2b2320" />
      <circle cx="58" cy="58" r="2.4" fill="#2b2320" />
      <path
        d="M45 69c3 2 7 2 10 0"
        stroke="#9a5a4c"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

const mira = <RendersBust hair="#3b2a4a" shirt="#6b4f8a" />
const clint = <RendersBust hair="#1f1b1a" skin="#d9a98a" shirt="#b0506a" flip />

const scene: CharacterChatLine[] = [
  {
    text: "The café was empty except for the two of them and a radio playing to no one.",
  },
  {
    speaker: "Mira",
    portrait: mira,
    color: "#c9a7f0",
    text: "You came. I honestly thought you'd bail… *again*.",
  },
  {
    speaker: "Clint",
    portrait: clint,
    side: "right",
    color: "#f08ca0",
    text: "Why would I go somewhere else and drink coffee on a couch when I could drink better coffee at home, on my own couch?",
  },
  {
    speaker: "Mira",
    portrait: mira,
    color: "#c9a7f0",
    text: "Because I asked. *sigh* Sit down.",
  },
]

const variants: CharacterChatVariant[] = [
  "default",
  "classic",
  "soft",
  "tab",
  "frame",
  "minimal",
]

function RendersScene({ variant }: { variant: CharacterChatVariant }) {
  const [index, setIndex] = useState(0)
  const [finished, setFinished] = useState(false)

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="relative w-full overflow-hidden rounded-lg bg-[linear-gradient(160deg,#3d4a6b,#1b2033_55%,#2b1f2e)] px-3 pt-16 pb-3">
        <CharacterChat
          key={variant}
          variant={variant}
          lines={scene}
          index={index}
          onIndexChange={(next) => {
            setIndex(next)
            setFinished(false)
          }}
          onComplete={() => setFinished(true)}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {finished
            ? "End of scene."
            : `Line ${index + 1} of ${scene.length}. Click the box or press Enter.`}
        </span>
        <button
          type="button"
          onClick={() => {
            setIndex(0)
            setFinished(false)
          }}
          className="rounded-md border border-border px-2 py-1 font-mono hover:text-foreground"
        >
          restart
        </button>
      </div>
    </div>
  )
}

function RendersLiveDemo() {
  const [variant, setVariant] = useState<CharacterChatVariant>("default")

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap gap-1.5">
        {variants.map((entry) => (
          <button
            key={entry}
            type="button"
            aria-pressed={entry === variant}
            onClick={() => setVariant(entry)}
            className={cn(
              "rounded-md border border-border px-2 py-1 font-mono text-xs transition-colors",
              entry === variant
                ? "bg-foreground text-background"
                : "bg-background text-muted-foreground hover:text-foreground"
            )}
          >
            {entry}
          </button>
        ))}
      </div>
      <RendersScene variant={variant} />
    </div>
  )
}

export function RendersStandardCharacterChatDemo() {
  return (
    <div data-fill className="flex w-full flex-col gap-3">
      <RendersDemoCard fill label="a scene · click to advance">
        <RendersLiveDemo />
      </RendersDemoCard>
      <RendersDemoCard fill label="variants">
        <div className="grid w-full gap-6 rounded-lg bg-[linear-gradient(160deg,#58627d,#262b3d)] p-4 pt-6">
          {variants.map((variant) => (
            <CharacterChat
              key={variant}
              variant={variant}
              size="sm"
              speed={0}
              lines={[
                {
                  speaker: variant === "classic" ? "Narrator" : "Mira",
                  text:
                    variant === "classic"
                      ? "I have a feeling he unironically quotes film villains."
                      : `This is the ${variant} box. *Click* me to see the next line mark.`,
                },
              ]}
            />
          ))}
        </div>
      </RendersDemoCard>
      <RendersDemoCard fill label="thinking">
        <CharacterChat
          thinking
          lines={[{ speaker: "Mira", portrait: mira, text: "" }]}
        />
      </RendersDemoCard>
    </div>
  )
}
