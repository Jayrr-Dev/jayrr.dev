"use client"

import { useRef, useState, type CSSProperties, type PointerEvent } from "react"
import { ArchiveIcon, FileTextIcon, HeartIcon } from "lucide-react"

import { Button } from "@/components/standard/button"
import { TutorialFloat } from "@/components/standard/tutorial-float"
import { TutorialIconGuide } from "@/components/standard/tutorial-icon-guide"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

type TourStep = "like" | "file" | "done" | "closed"

const TOUR_STEPS = 2

/** Two hands-on steps, each moving on only when it's actually done. */
function RendersTour() {
  const stageRef = useRef<HTMLDivElement>(null)
  const heartRef = useRef<HTMLButtonElement>(null)
  const fileRef = useRef<HTMLDivElement>(null)
  const trayRef = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState<TourStep>("like")
  const [liked, setLiked] = useState(false)
  const [filed, setFiled] = useState(false)
  const [offset, setOffset] = useState<{ x: number; y: number } | null>(null)
  const grab = useRef<{ x: number; y: number } | null>(null)

  function restart() {
    setStep("like")
    setLiked(false)
    setFiled(false)
    setOffset(null)
  }

  function startsDrag(event: PointerEvent<HTMLDivElement>) {
    if (filed) return
    event.currentTarget.setPointerCapture(event.pointerId)
    grab.current = { x: event.clientX, y: event.clientY }
    setOffset({ x: 0, y: 0 })
  }

  function movesDrag(event: PointerEvent<HTMLDivElement>) {
    if (!grab.current) return
    setOffset({
      x: event.clientX - grab.current.x,
      y: event.clientY - grab.current.y,
    })
  }

  function endsDrag(event: PointerEvent<HTMLDivElement>) {
    if (!grab.current) return
    grab.current = null
    const tray = trayRef.current?.getBoundingClientRect()
    const over =
      tray &&
      event.clientX > tray.left &&
      event.clientX < tray.right &&
      event.clientY > tray.top &&
      event.clientY < tray.bottom
    setOffset(null)
    if (!over) return
    setFiled(true)
    if (step === "file") setStep("done")
  }

  const copy = {
    like: {
      title: "Like the post",
      body: "Tap the heart in the corner. The tutorial moves on once you do.",
    },
    file: {
      title: "File the report",
      body: "Drag the report into the Archive tray and let go.",
    },
    done: {
      title: "You're set",
      body: "That's the whole tour. This card closes by itself.",
    },
    closed: { title: "", body: "" },
  }[step]

  return (
    <RendersDemoCard label="hands-on tour · with Tutorial Icon Guide" fill>
      <div className="flex w-full flex-col items-center gap-3">
        <div
          ref={stageRef}
          className="relative h-80 w-full overflow-hidden rounded-lg border border-border bg-background"
        >
          <Button
            ref={heartRef}
            tone="ghost"
            iconOnly
            aria-label={liked ? "Unlike" : "Like"}
            aria-pressed={liked}
            className="absolute top-3 right-3"
            onClick={() => {
              setLiked((on) => !on)
              if (step === "like") setStep("file")
            }}
          >
            <HeartIcon
              className={liked ? "fill-destructive text-destructive" : ""}
            />
          </Button>
          {filed ? null : (
            <div
              ref={fileRef}
              onPointerDown={startsDrag}
              onPointerMove={movesDrag}
              onPointerUp={endsDrag}
              onPointerCancel={() => {
                grab.current = null
                setOffset(null)
              }}
              style={
                {
                  "--drag-x": `${offset?.x ?? 0}px`,
                  "--drag-y": `${offset?.y ?? 0}px`,
                } as CSSProperties
              }
              className="absolute bottom-6 left-6 z-10 flex translate-x-(--drag-x) translate-y-(--drag-y) cursor-grab touch-none items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm shadow-sm select-none active:cursor-grabbing"
            >
              <FileTextIcon className="size-4" />
              Report.pdf
            </div>
          )}
          <div
            ref={trayRef}
            className="absolute right-6 bottom-6 flex size-24 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-xs text-muted-foreground"
          >
            <ArchiveIcon className="size-5" />
            {filed ? "Report.pdf" : "Archive"}
          </div>
        </div>
        <Button tone="outline" size="sm" onClick={restart}>
          {step === "closed" ? "Take the tour again" : "Start over"}
        </Button>
      </div>
      <TutorialFloat
        anchor={stageRef}
        boundary={stageRef}
        avoid={step === "like" ? heartRef : null}
        open={step !== "closed"}
        title={copy.title}
        step={step === "like" ? 1 : 2}
        steps={TOUR_STEPS}
        done={step === "done"}
        onSkip={() => setStep("closed")}
        onDone={() => setStep("closed")}
      >
        {copy.body}
      </TutorialFloat>
      <TutorialIconGuide
        gesture={step === "file" ? "drag" : "tap"}
        target={heartRef}
        from={fileRef}
        to={trayRef}
        hidden={(step !== "like" && step !== "file") || offset !== null}
      />
    </RendersDemoCard>
  )
}

/** One card on its own, below what it explains, with no steps. */
function RendersTip() {
  const stageRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(true)

  return (
    <RendersDemoCard label="single tip · below its anchor" fill>
      <div
        ref={stageRef}
        className="flex h-64 w-full flex-col items-center rounded-lg border border-border bg-background pt-8"
      >
        <Button ref={buttonRef} tone="outline" onClick={() => setOpen(true)}>
          Auto-select
        </Button>
      </div>
      <TutorialFloat
        anchor={buttonRef}
        boundary={stageRef}
        side="bottom"
        width={260}
        open={open}
        eyebrow="Tip"
        title="Auto-select is on"
        skipLabel="Got it"
        onSkip={() => setOpen(false)}
        float={false}
      >
        The next item is picked for you. Tap the button to bring this tip back.
      </TutorialFloat>
    </RendersDemoCard>
  )
}

export function RendersTutorialFloatDemo() {
  return (
    <>
      <RendersTour />
      <RendersTip />
    </>
  )
}
