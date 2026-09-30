"use client"

import { Textarea } from "@/components/standard/textarea"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"
import type { CompletionSource } from "@/hooks/use-inline-completion"

const PHRASES = [
  "Thanks for reaching out, I'll get back to you by end of day.",
  "Thanks for the update, looks good to me.",
  "Let me know if you have any questions.",
  "Looking forward to hearing from you.",
]

/** Finishes a known phrase from the start of the current line. */
const completePhrase: CompletionSource = (value) => {
  const lineStart = value.lastIndexOf("\n") + 1
  const line = value.slice(lineStart).toLowerCase()
  if (line.length < 3) {
    return null
  }
  const phrase = PHRASES.find(
    (option) =>
      option.toLowerCase().startsWith(line) && option.length > line.length
  )
  return phrase ? value.slice(0, lineStart) + phrase : null
}

export function RendersTextareaDemo() {
  return (
    <>
      <RendersDemoCard label="Textarea">
        <Textarea aria-label="Notes" placeholder="Notes" />
      </RendersDemoCard>
      <RendersDemoCard label="completion (Tab to accept)">
        <Textarea
          aria-label="Reply"
          placeholder="Try typing Thanks…"
          completion={completePhrase}
        />
      </RendersDemoCard>
      <RendersDemoCard label="invalid">
        <Textarea aria-label="Notes" placeholder="Notes" invalid />
      </RendersDemoCard>
    </>
  )
}
