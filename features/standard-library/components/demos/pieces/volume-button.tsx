"use client"

import { useState } from "react"

import { VolumeButton } from "@/components/standard/volume-button"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

function RendersVolumeReadout() {
  const [volume, setVolume] = useState(0.6)
  const [muted, setMuted] = useState(false)

  return (
    <div className="flex flex-wrap items-center gap-3">
      <VolumeButton
        expand="always"
        value={volume}
        onValueChange={setVolume}
        muted={muted}
        onMutedChange={setMuted}
      />
      <span className="font-mono text-xs text-muted-foreground tabular-nums">
        {muted ? "Muted" : `${Math.round(volume * 100)}%`}
      </span>
    </div>
  )
}

const MIXER_CHANNELS = [
  { name: "Vox", level: 0.72 },
  { name: "Gtr", level: 0.55 },
  { name: "Bass", level: 0.64 },
  { name: "Drum", level: 0.8 },
  { name: "Keys", level: 0.38 },
  { name: "Main", level: 0.9 },
]

function RendersMixerChannel({ name, level }: { name: string; level: number }) {
  const [volume, setVolume] = useState(level)
  const [muted, setMuted] = useState(false)

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
        {muted ? "—" : Math.round(volume * 100)}
      </span>
      <VolumeButton
        expand="always"
        orientation="vertical"
        size="sm"
        value={volume}
        onValueChange={setVolume}
        muted={muted}
        onMutedChange={setMuted}
      />
      <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
        {name}
      </span>
    </div>
  )
}

function RendersMixer() {
  return (
    <div className="flex items-end gap-3">
      {MIXER_CHANNELS.map((channel) => (
        <RendersMixerChannel key={channel.name} {...channel} />
      ))}
    </div>
  )
}

export function RendersVolumeButtonDemo() {
  return (
    <>
      <RendersDemoCard label="hover to adjust">
        <VolumeButton />
      </RendersDemoCard>
      <RendersDemoCard label="always open · controlled">
        <RendersVolumeReadout />
      </RendersDemoCard>
      <RendersDemoCard label="outline · starts muted">
        <VolumeButton tone="outline" defaultMuted />
      </RendersDemoCard>
      <RendersDemoCard label="popover · click to open">
        <VolumeButton expand="popover" tone="outline" />
      </RendersDemoCard>
      <RendersDemoCard label="vertical · hover to adjust">
        <VolumeButton orientation="vertical" />
      </RendersDemoCard>
      <RendersDemoCard label="mixer · vertical channels">
        <RendersMixer />
      </RendersDemoCard>
    </>
  )
}
