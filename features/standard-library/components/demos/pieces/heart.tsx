"use client"

import { useState } from "react"

import {
  Heart,
  type HeartEffect,
  type HeartUnlikeEffect,
} from "@/components/standard/heart"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const EFFECTS: HeartEffect[] = ["burst", "pop", "beat", "float", "fill"]
const UNLIKE_EFFECTS: HeartUnlikeEffect[] = ["break", "deflate", "fall", "drain"]
const BASE_COUNT = 241

function RendersHeartCountCard() {
  const [liked, setLiked] = useState(false)

  return (
    <RendersDemoCard label="count · controlled">
      <Heart
        pressed={liked}
        onPressedChange={setLiked}
        count={BASE_COUNT + (liked ? 1 : 0)}
      />
    </RendersDemoCard>
  )
}

export function RendersHeartDemo() {
  return (
    <>
      {EFFECTS.map((effect) => (
        <RendersDemoCard key={effect} label={`effect ${effect}`}>
          <Heart effect={effect} size="lg" />
        </RendersDemoCard>
      ))}
      {UNLIKE_EFFECTS.map((unlikeEffect) => (
        <RendersDemoCard
          key={unlikeEffect}
          label={`unlikeEffect ${unlikeEffect}`}
        >
          <Heart defaultPressed unlikeEffect={unlikeEffect} size="lg" />
        </RendersDemoCard>
      ))}
      <RendersDemoCard label="size sm, default, lg">
        <div className="flex items-center gap-2">
          <Heart size="sm" />
          <Heart />
          <Heart size="lg" />
        </div>
      </RendersDemoCard>
      <RendersHeartCountCard />
      <RendersDemoCard label="defaultPressed">
        <Heart defaultPressed />
      </RendersDemoCard>
      <RendersDemoCard label="disabled">
        <Heart disabled defaultPressed />
      </RendersDemoCard>
    </>
  )
}
