"use client"

import { useRef } from "react"

import { CopyButton } from "@/components/standard/copy-button"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

function RendersCopyFromInput() {
  const input = useRef<HTMLInputElement>(null)

  return (
    <div className="flex items-center gap-2">
      <input
        ref={input}
        defaultValue="https://jayrr.dev/gallery"
        aria-label="Link"
        className="h-9 w-56 rounded-md border bg-transparent px-3 text-sm"
      />
      <CopyButton iconOnly label="Copy link" value={() => input.current?.value ?? ""} />
    </div>
  )
}

export function RendersCopyButtonDemo() {
  return (
    <>
      <RendersDemoCard label="copy text">
        <CopyButton value="npx shadcn add @jayrr/copy-button" />
      </RendersDemoCard>
      <RendersDemoCard label="custom label">
        <CopyButton value="https://jayrr.dev" tone="default">
          Copy link
        </CopyButton>
      </RendersDemoCard>
      <RendersDemoCard label="icon only · reads value on click">
        <RendersCopyFromInput />
      </RendersDemoCard>
    </>
  )
}
