"use client"

import { useState } from "react"
import { CheckIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ProgressRing } from "@/components/ui/progress-ring"
import { Skeleton } from "@/components/ui/skeleton"

import { RendersDemoCard } from "./rendersDemoCard"

function ProgressRingLiveDemo() {
  const [value, setValue] = useState(20)

  return (
    <div className="flex items-center gap-4">
      <ProgressRing value={value} aria-label="Live progress">
        {value}%
      </ProgressRing>
      <div className="flex flex-col gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setValue((v) => Math.min(v + 20, 100))}
        >
          +20
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setValue(0)}>
          Reset
        </Button>
      </div>
    </div>
  )
}

function ProgressRingHealthDemo({ segments }: { segments?: number }) {
  const [hp, setHp] = useState(100)
  const color =
    hp > 50
      ? "[--progress-ring-color:var(--color-success)]"
      : hp > 25
        ? "[--progress-ring-color:var(--color-warning)]"
        : "[--progress-ring-color:var(--color-destructive)]"

  return (
    <div className="flex items-center gap-4">
      <ProgressRing
        value={hp}
        aria-label="Health"
        below="HP"
        segments={segments}
        className={color}
      >
        {hp}
      </ProgressRing>
      <div className="flex flex-col gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setHp((v) => Math.max(v - 20, 0))}
        >
          Hit
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setHp((v) => Math.min(v + 20, 100))}
        >
          Heal
        </Button>
      </div>
    </div>
  )
}

export function RendersIndicatorDemo({
  pieceName,
}: {
  pieceName: string
}) {
  if (pieceName === "Badge") {
    return (
      <>
        <RendersDemoCard>
          <Badge>Default</Badge>
        </RendersDemoCard>
        <RendersDemoCard>
          <Badge variant="secondary">Secondary</Badge>
        </RendersDemoCard>
        <RendersDemoCard>
          <Badge variant="outline">Outline</Badge>
        </RendersDemoCard>
        <RendersDemoCard>
          <Badge variant="destructive">Destructive</Badge>
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Progress") {
    return (
      <>
        <RendersDemoCard>
          <Progress value={25} className="w-full" />
        </RendersDemoCard>
        <RendersDemoCard>
          <Progress value={70} className="w-full" />
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Progress Ring") {
    return (
      <>
        <RendersDemoCard label="center value">
          <ProgressRing value={64} aria-label="Upload">
            64%
          </ProgressRing>
        </RendersDemoCard>
        <RendersDemoCard label="above + below">
          <ProgressRing
            value={42}
            above="Storage"
            below="42 of 100 GB"
            aria-label="Storage used"
          >
            42%
          </ProgressRing>
        </RendersDemoCard>
        <RendersDemoCard label="stacked center">
          <ProgressRing value={7} max={10} size={104} aria-label="Tasks done">
            <span className="text-xl font-semibold">7/10</span>
            <span className="text-xs font-normal text-muted-foreground">
              tasks
            </span>
          </ProgressRing>
        </RendersDemoCard>
        <RendersDemoCard label="sizes + thickness">
          <div className="flex items-end gap-4">
            <ProgressRing value={30} size={32} thickness={4} />
            <ProgressRing value={60} size={48} thickness={5} />
            <ProgressRing value={90} size={64} thickness={10} />
          </div>
        </RendersDemoCard>
        <RendersDemoCard label="color">
          <div className="flex items-center gap-4">
            <ProgressRing
              value={100}
              size={56}
              className="[--progress-ring-color:var(--color-success)]"
            >
              <CheckIcon className="size-5 text-success" />
            </ProgressRing>
            <ProgressRing
              value={80}
              size={56}
              className="[--progress-ring-color:var(--color-warning)]"
            >
              80
            </ProgressRing>
            <ProgressRing
              value={95}
              size={56}
              className="[--progress-ring-color:var(--color-destructive)]"
            >
              95
            </ProgressRing>
          </div>
        </RendersDemoCard>
        <RendersDemoCard label="indeterminate">
          <ProgressRing size={48} thickness={5} below="Syncing" />
        </RendersDemoCard>
        <RendersDemoCard label="live">
          <ProgressRingLiveDemo />
        </RendersDemoCard>
        <RendersDemoCard label="health">
          <ProgressRingHealthDemo />
        </RendersDemoCard>
        <RendersDemoCard label="health · segments">
          <ProgressRingHealthDemo segments={5} />
        </RendersDemoCard>
        <RendersDemoCard label="segments">
          <div className="flex items-center gap-4">
            <ProgressRing value={3} max={4} segments={4} size={56} segmentGap={6}>
              3/4
            </ProgressRing>
            <ProgressRing value={60} segments={12} size={56} thickness={6}>
              60
            </ProgressRing>
            <ProgressRing
              value={70}
              segments={24}
              size={56}
              thickness={10}
              segmentGap={2}
            >
              70
            </ProgressRing>
          </div>
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Skeleton") {
    return (
      <RendersDemoCard>
        <div className="flex w-full items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      </RendersDemoCard>
    )
  }

  return null
}
