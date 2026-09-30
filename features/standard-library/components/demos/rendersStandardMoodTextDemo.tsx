"use client"

import { useState } from "react"

import {
  MoodText,
  moodTextMoods,
  moodTextPresets,
  type MoodTextMood,
  type MoodTextPreset,
} from "@/components/standard/mood-text"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"
import { cn } from "@/lib/utils"

const moods = Object.keys(moodTextMoods) as MoodTextMood[]
const presets = Object.keys(moodTextPresets) as MoodTextPreset[]

const lines: Record<MoodTextMood, string> = {
  joy: "The cards whisper what the heart already knows.",
  happy: "What a lovely morning to draw a card.",
  excited: "The Star came up again, three times running!",
  surprise: "Wait, the Tower was hiding under the deck?",
  fear: "Something is waiting behind the next card.",
  anxious: "I keep shuffling, but the same card returns.",
  timid: "Maybe we could read just one more?",
  sadness: "The candle burned down before the reading ended.",
  hurt: "You promised the cards would never lie to me.",
  anger: "Do not ask me that question again.",
  annoyed: "Fine, shuffle the deck one more time.",
  disgust: "The tea leaves have gone sour and grey.",
  confusion: "Is the Moon upright, or am I?",
  normal: "Draw a card and tell me what you see.",
}

// One word per line takes the mood's signature preset.
const keywords: Record<MoodTextMood, string> = {
  joy: "heart",
  happy: "lovely",
  excited: "three times",
  surprise: "Tower",
  fear: "waiting",
  anxious: "same card",
  timid: "one more",
  sadness: "burned down",
  hurt: "never",
  anger: "again",
  annoyed: "one more",
  disgust: "sour",
  confusion: "upright",
  normal: "card",
}

function RendersMoodPicker() {
  const [mood, setMood] = useState<MoodTextMood>("joy")

  return (
    <div className="flex w-full flex-col gap-4">
      <p className="min-h-16 text-xl leading-relaxed">
        <MoodText key={mood} mood={mood} highlights={[keywords[mood]]}>
          {lines[mood]}
        </MoodText>
      </p>
      <div className="flex flex-wrap gap-1.5">
        {moods.map((entry) => (
          <button
            key={entry}
            type="button"
            aria-pressed={entry === mood}
            onClick={() => setMood(entry)}
            className={cn(
              "rounded-md border border-border px-2 py-1 font-mono text-xs transition-colors",
              entry === mood
                ? "bg-foreground text-background"
                : "bg-background text-muted-foreground hover:text-foreground"
            )}
          >
            {entry}
          </button>
        ))}
      </div>
      <p className="font-mono text-xs text-muted-foreground">
        base {moodTextMoods[mood].base.join(" + ") || "none"} · signature{" "}
        {moodTextMoods[mood].signature}
      </p>
    </div>
  )
}

export function RendersStandardMoodTextDemo() {
  return (
    <div data-fill className="flex w-full flex-col gap-3">
      <RendersDemoCard fill label="mood · signature highlight">
        <RendersMoodPicker />
      </RendersDemoCard>
      <RendersDemoCard fill label="highlights · presets and raw tokens">
        <p className="text-lg leading-relaxed">
          <MoodText
            highlights={[
              { phrase: "Moon", effect: "goldWave" },
              { phrase: "tremble", effect: "chill" },
              { phrase: "sink", effect: ["cascade", "sea", "italic"] },
              { phrase: "secret", effect: "phantom" },
            ]}
          >
            Under the Moon the tables tremble, the candles sink, and one
            secret waits for a hover.
          </MoodText>
        </p>
      </RendersDemoCard>
      <RendersDemoCard fill label={`presets · ${presets.length}`}>
        <div className="grid w-full grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 md:grid-cols-4">
          {presets.map((preset) => (
            <div key={preset} className="flex flex-col gap-0.5">
              <span className="text-base">
                <MoodText effects={preset}>{preset}</MoodText>
              </span>
              <span className="font-mono text-2xs text-muted-foreground">
                {moodTextPresets[preset].join(" + ")}
              </span>
            </div>
          ))}
        </div>
      </RendersDemoCard>
    </div>
  )
}
