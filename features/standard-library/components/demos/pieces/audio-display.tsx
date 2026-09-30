"use client"

import { AudioDisplay } from "@/components/standard/audio-display"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const src = "/samples/sample-audio.mp3"

// Hand-drawn peaks, for when the file can't be fetched and decoded.
const peaks = Array.from(
  { length: 48 },
  (_, index) =>
    0.25 + 0.75 * Math.abs(Math.sin(index * 0.45) * Math.cos(index * 0.13))
)

export function RendersAudioDisplayDemo() {
  return (
    <>
      <RendersDemoCard
        label="waveform decoded from the file"
        className="w-full max-w-xl"
      >
        <AudioDisplay
          src={src}
          title="Arpeggio in A"
          artist="ffmpeg aevalsrc"
          waveform
          download
        />
      </RendersDemoCard>
      <RendersDemoCard label="cover · given peaks" className="w-full max-w-xl">
        <AudioDisplay
          src={src}
          title="Arpeggio in A"
          artist="Sample"
          cover="/samples/sample-video-poster.jpg"
          waveform={peaks}
        />
      </RendersDemoCard>
      <RendersDemoCard label="plain" className="w-full max-w-xl">
        <AudioDisplay src={src} title="Voice memo" />
      </RendersDemoCard>
    </>
  )
}
