"use client"

import { useState } from "react"

import { Art, ArtPiece, artEnters, artIdles } from "@/components/standard/art"
import { Button } from "@/components/standard/button"
import { Gradient } from "@/components/standard/gradient"
import { Noise } from "@/components/standard/noise"
import { Pattern } from "@/components/standard/pattern"
import { Surface } from "@/components/standard/surface"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const stage = "h-64 w-full overflow-hidden rounded-xl border bg-muted/30"

function RendersArtEnters() {
  const [plays, setPlays] = useState(0)
  const enters = artEnters.filter((enter) => enter !== "none")

  return (
    <div className="flex w-full flex-col gap-3">
      <Button
        size="sm"
        tone="outline"
        className="self-start"
        onClick={() => setPlays((n) => n + 1)}
      >
        Replay
      </Button>
      <Surface key={plays} className={stage}>
        <Pattern kind="grid" opacity={0.4} />
        <Art trigger="mount" stagger={140}>
          {enters.map((enter, index) => {
            const column = index % 5
            const row = Math.floor(index / 5)

            return (
              <ArtPiece
                key={enter}
                x={12 + column * 19}
                y={32 + row * 42}
                width={140}
                enter={enter}
              >
                <div className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/hero/orb.svg" alt="" className="size-14" />
                  {enter}
                </div>
              </ArtPiece>
            )
          })}
        </Art>
      </Surface>
    </div>
  )
}

function RendersArtIdles() {
  const idles = artIdles.filter((idle) => idle !== "none")

  return (
    <Surface className={stage}>
      <Art trigger="mount" stagger={0}>
        {idles.map((idle, index) => (
          <ArtPiece
            key={idle}
            x={14 + index * 24}
            y={50}
            width={120}
            enter="fade"
            duration={400}
            idle={idle}
          >
            <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/hero/pill.svg" alt="" className="w-20" />
              {idle}
            </div>
          </ArtPiece>
        ))}
      </Art>
    </Surface>
  )
}

export function RendersArtDemo() {
  return (
    <div data-fill className="flex w-full flex-col gap-3">
      <RendersDemoCard label="enter · stagger">
        <RendersArtEnters />
      </RendersDemoCard>
      <RendersDemoCard label="idle">
        <RendersArtIdles />
      </RendersDemoCard>
      <RendersDemoCard label="scene · depth · parallax (move the pointer)">
        <Surface className="h-96 w-full overflow-hidden rounded-xl text-white">
          <Gradient preset="midnight" />
          <Gradient preset="primary" blend="screen" />
          <Noise opacity={0.2} blend="overlay" />
          <Art parallax={24}>
            <ArtPiece src="/hero/blob.svg" x={78} y={60} width={260} depth={0.4} enter="blur" idle="float" idleDuration={6} />
            <ArtPiece src="/hero/ring.svg" x={20} y={70} width={160} depth={0.8} enter="zoom" idle="spin" idleDuration={30} />
            <ArtPiece src="/hero/stat-card.svg" x={62} y={42} width={300} depth={1.4} enter="rise" />
            <ArtPiece src="/hero/toast.svg" x={30} y={24} width={240} depth={2} enter="slide-start" idle="float" idleDuration={3.5} />
            <ArtPiece src="/hero/cursor.svg" x={46} y={78} width={100} depth={3} enter="pop" idle="float" idleDuration={2.4} />
            <ArtPiece src="/hero/sparkle.svg" x={88} y={16} width={34} depth={3.5} enter="pop" idle="pulse" />
            <ArtPiece src="/hero/sparkle.svg" x={10} y={30} width={22} depth={3.5} enter="pop" idle="pulse" idleDuration={1.4} />
          </Art>
        </Surface>
      </RendersDemoCard>
    </div>
  )
}
