"use client"

import * as React from "react"
import { MicIcon, MicOffIcon } from "lucide-react"

import { Button } from "@/components/standard/button"
import { useMediaDevice } from "@/components/standard/media-device"

/**
 * Turns the microphone on and off. The first press asks for permission; the
 * stream goes to `onStreamChange` (null when it stops) and every track is
 * stopped on unmount. While on, a small meter shows the input level.
 *
 * <MicButton onStreamChange={(stream) => recorder.attach(stream)} />
 * <MicButton iconOnly meter={false} />
 */

type MicButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "onClick" | "href"
> & {
  /** Full audio constraints, e.g. `{ echoCancellation: true }`. */
  audio?: MediaTrackConstraints | true
  /** Shows the live input level while on. */
  meter?: boolean
  onStreamChange?: (stream: MediaStream | null) => void
  onError?: (error: unknown) => void
}

const METER_BARS = [0.55, 1, 0.75]

/** Scales the meter's bars to the stream's loudness, once per frame. */
function useLevelMeter(
  stream: MediaStream | null,
  meter: React.RefObject<HTMLSpanElement | null>
) {
  React.useEffect(() => {
    const bars = meter.current
    if (!stream || !bars) return

    const context = new AudioContext()
    const analyser = context.createAnalyser()
    analyser.fftSize = 256
    context.createMediaStreamSource(stream).connect(analyser)
    const samples = new Uint8Array(analyser.fftSize)
    let frame = 0

    const draws = () => {
      analyser.getByteTimeDomainData(samples)
      let peak = 0
      for (const sample of samples) {
        peak = Math.max(peak, Math.abs(sample - 128) / 128)
      }
      const level = Math.min(1, peak * 2.5)
      Array.from(bars.children).forEach((bar, index) => {
        const scale = 0.2 + level * METER_BARS[index] * 0.8
        ;(bar as HTMLElement).style.transform = `scaleY(${scale})`
      })
      frame = requestAnimationFrame(draws)
    }
    draws()

    return () => {
      cancelAnimationFrame(frame)
      void context.close()
    }
  }, [stream, meter])
}

function MicButton({
  audio = true,
  meter = true,
  onStreamChange,
  onError,
  iconOnly = false,
  tone = "outline",
  children,
  ...props
}: MicButtonProps) {
  const [stream, setStream] = React.useState<MediaStream | null>(null)
  const bars = React.useRef<HTMLSpanElement>(null)
  const mic = useMediaDevice({
    constraints: { audio, video: false },
    onStreamChange: (next) => {
      setStream(next)
      onStreamChange?.(next)
    },
    onError,
  })
  useLevelMeter(meter ? stream : null, bars)

  const on = mic.status === "on"
  const label =
    mic.status === "denied"
      ? "Mic blocked"
      : on
        ? "Stop mic"
        : (children ?? "Start mic")
  const icon = on ? (
    <MicIcon aria-hidden className="size-4" />
  ) : (
    <MicOffIcon aria-hidden className="size-4" />
  )
  const levels =
    meter && on ? (
      <span
        ref={bars}
        aria-hidden
        data-slot="mic-level"
        className="inline-flex h-3.5 items-end gap-px"
      >
        {METER_BARS.map((_, index) => (
          <span
            key={index}
            className="h-full w-0.5 origin-bottom scale-y-20 rounded-full bg-current transition-transform duration-75"
          />
        ))}
      </span>
    ) : null

  return (
    <Button
      data-slot="mic-button"
      data-status={mic.status}
      tone={on ? "danger" : tone}
      iconOnly={iconOnly && !levels}
      aria-pressed={on}
      aria-label={iconOnly ? "Microphone" : undefined}
      title={iconOnly ? (on ? "Stop mic" : "Start mic") : undefined}
      loading={mic.status === "starting"}
      leading={iconOnly ? undefined : icon}
      trailing={levels}
      onClick={mic.toggle}
      {...props}
    >
      {iconOnly ? icon : label}
    </Button>
  )
}

export { MicButton }
