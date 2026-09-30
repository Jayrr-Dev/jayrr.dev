"use client"

import { useEffect, useRef, useState } from "react"

import { ArrayLayout, type ArrayJustify, type ArrayPoint } from "@/components/standard/array"
import { Increment } from "@/components/standard/increment"
import { Button } from "@/components/ui/button"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const BOX = 240

function Dot({ index }: { index: number }) {
  return (
    <span className="grid size-6 place-items-center rounded-full border bg-card text-[10px] font-medium tabular-nums">
      {index + 1}
    </span>
  )
}

function Arrow() {
  return <span className="block h-1 w-4 rounded-full bg-foreground" />
}

const WAVE = "M 10 120 C 60 20, 100 20, 120 120 S 180 220, 230 120"

/** Items drift along a closed path, so the array reads as moving. */
function RendersOrbitDemo() {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    let frame = 0
    const step = (now: number) => {
      setOffset((now / 12000) % 1)
      frame = requestAnimationFrame(step)
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (!reduced) frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <ArrayLayout
      shape="path"
      path="M 120 20 C 240 20, 240 220, 120 220 C 0 220, 0 20, 120 20 Z"
      offset={offset}
      orient
      showPath
      count={10}
      renderItem={() => <Arrow />}
    />
  )
}

const JUSTIFY: ArrayJustify[] = ["start", "center", "end", "between", "around", "evenly"]

/** Switches how items share the path, on a line and an arc. */
function RendersJustifyDemo() {
  const [justify, setJustify] = useState<ArrayJustify>("center")
  const [gap, setGap] = useState(32)
  const packed = justify === "start" || justify === "center" || justify === "end"

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap gap-1">
        {JUSTIFY.map((value) => (
          <Button
            key={value}
            size="sm"
            variant={value === justify ? "secondary" : "ghost"}
            onClick={() => setJustify(value)}
          >
            {value}
          </Button>
        ))}
      </div>
      <ArrayLayout
        height={40}
        showPath
        justify={justify}
        gap={gap}
        count={4}
        renderItem={(index) => <Dot index={index} />}
      />
      <ArrayLayout
        shape="arc"
        startAngle={-170}
        endAngle={-10}
        className="-mb-[45%]"
        showPath
        justify={justify}
        gap={gap}
        count={4}
        renderItem={(index) => <Dot index={index} />}
      />
      <div className="relative flex items-center gap-2 text-xs text-muted-foreground">
        <Increment
          label="gap"
          value={gap}
          onChange={setGap}
          min={8}
          max={72}
          step={8}
          disabled={!packed}
        />
        <span className="ml-auto">{packed ? "Packed" : "Spread over the path"}</span>
      </div>
    </div>
  )
}

/** Draw a stroke; the items follow it once you let go. */
function RendersDrawnDemo() {
  const [points, setPoints] = useState<ArrayPoint[]>([
    [20, 200],
    [80, 60],
    [140, 180],
    [220, 40],
  ])
  const [count, setCount] = useState(8)
  const drawing = useRef(false)

  function toPoint(event: React.PointerEvent<HTMLDivElement>): ArrayPoint {
    const rect = event.currentTarget.getBoundingClientRect()
    return [
      ((event.clientX - rect.left) / rect.width) * BOX,
      ((event.clientY - rect.top) / rect.height) * BOX,
    ]
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <div
        className="touch-none cursor-crosshair rounded-lg border border-dashed"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId)
          drawing.current = true
          setPoints([toPoint(event)])
        }}
        onPointerMove={(event) => {
          if (!drawing.current) return
          const next = toPoint(event)
          setPoints((current) => {
            const last = current[current.length - 1]
            // Skip tiny moves so the curve stays smooth.
            return Math.hypot(next[0] - last[0], next[1] - last[1]) < 6
              ? current
              : [...current, next]
          })
        }}
        onPointerUp={() => {
          drawing.current = false
        }}
      >
        <ArrayLayout
          shape="points"
          points={points}
          showPath
          orient
          count={points.length > 1 ? count : 0}
          renderItem={() => <Arrow />}
        />
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Increment
          value={count}
          onChange={setCount}
          min={2}
          max={30}
          format={(value) => `${value} items`}
          aria-label="Items"
        />
        <span className="ml-auto">Drag to draw</span>
      </div>
    </div>
  )
}

export function RendersArrayDemo() {
  return (
    <>
      <RendersDemoCard label="line">
        <ArrayLayout
          height={60}
          count={6}
          renderItem={(index) => <Dot index={index} />}
        />
      </RendersDemoCard>
      <RendersDemoCard label="justify · gap">
        <RendersJustifyDemo />
      </RendersDemoCard>
      <RendersDemoCard label="circle">
        <ArrayLayout
          shape="circle"
          count={12}
          renderItem={(index) => <Dot index={index} />}
        />
      </RendersDemoCard>
      <RendersDemoCard label="arc">
        <ArrayLayout
          shape="arc"
          startAngle={-170}
          endAngle={-10}
          showPath
          count={7}
          renderItem={(index) => <Dot index={index} />}
        />
      </RendersDemoCard>
      <RendersDemoCard label="path · orient">
        <ArrayLayout
          shape="path"
          path={WAVE}
          showPath
          orient
          count={14}
          renderItem={() => <Arrow />}
        />
      </RendersDemoCard>
      <RendersDemoCard label="any element">
        <ArrayLayout shape="circle" inset={28}>
          <Button size="sm">One</Button>
          <Button size="sm" variant="outline">Two</Button>
          <Button size="sm" variant="secondary">Three</Button>
          <Button size="sm" variant="ghost">Four</Button>
          <span className="text-2xl">★</span>
        </ArrayLayout>
      </RendersDemoCard>
      <RendersDemoCard label="offset · animated">
        <RendersOrbitDemo />
      </RendersDemoCard>
      <RendersDemoCard label="drawn">
        <RendersDrawnDemo />
      </RendersDemoCard>
    </>
  )
}
