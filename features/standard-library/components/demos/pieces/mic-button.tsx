"use client"

import { useState } from "react"

import { MicButton } from "@/components/standard/mic-button"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

function RendersMicStatus() {
  const [status, setStatus] = useState("Mic off")

  return (
    <div className="flex flex-wrap items-center gap-3">
      <MicButton
        onStreamChange={(stream) =>
          setStatus(
            stream
              ? (stream.getAudioTracks()[0]?.label ?? "Listening")
              : "Mic off"
          )
        }
        onError={() => setStatus("Permission denied or no mic")}
      />
      <span className="max-w-48 truncate font-mono text-xs text-muted-foreground">
        {status}
      </span>
    </div>
  )
}

export function RendersMicButtonDemo() {
  return (
    <>
      <RendersDemoCard label="iconed text · level meter">
        <RendersMicStatus />
      </RendersDemoCard>
      <RendersDemoCard label="icon only">
        <div className="flex gap-2">
          <MicButton iconOnly />
          <MicButton iconOnly shape="circle" tone="quiet" />
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="no meter">
        <MicButton meter={false} />
      </RendersDemoCard>
    </>
  )
}
