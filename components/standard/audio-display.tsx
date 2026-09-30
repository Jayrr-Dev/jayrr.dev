"use client"

import * as React from "react"
import {
  DownloadIcon,
  MusicIcon,
  PauseIcon,
  PlayIcon,
  Volume2Icon,
  VolumeXIcon,
} from "lucide-react"
import { cn } from "cn"

import { formatDuration } from "@/components/standard/display-frame"

/**
 * An audio player: cover art, title and artist, a play button, and a seek
 * bar that can draw the file's waveform. Pass `waveform` to decode the
 * waveform from the file (it fetches the file once more, so the server
 * must allow it), or pass your own peaks from 0 to 1.
 *
 * <AudioDisplay src="/audio/take-3.mp3" title="Take 3" artist="Demo" />
 * <AudioDisplay src={url} waveform cover="/covers/ep.jpg" />
 * <AudioDisplay src={url} waveform={[0.2, 0.6, 0.9, …]} />
 */

const BAR_COUNT = 72
const SPEEDS = [0.75, 1, 1.25, 1.5, 2]

async function decodePeaks(src: string, count: number, signal: AbortSignal) {
  const response = await fetch(src, { signal })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const data = await response.arrayBuffer()
  const context = new OfflineAudioContext(1, 1, 44100)
  const audio = await context.decodeAudioData(data)
  const channel = audio.getChannelData(0)
  const block = Math.max(1, Math.floor(channel.length / count))
  const peaks: number[] = []
  for (let bar = 0; bar < count; bar += 1) {
    let peak = 0
    const end = Math.min(channel.length, (bar + 1) * block)
    // Sampling every few frames is plenty for a bar's height.
    for (let frame = bar * block; frame < end; frame += 8) {
      const value = Math.abs(channel[frame])
      if (value > peak) peak = value
    }
    peaks.push(peak)
  }
  const max = Math.max(...peaks, 0.001)
  return peaks.map((peak) => peak / max)
}

/** Stretches or squeezes peaks to `count` bars. */
function resample(peaks: number[], count: number) {
  if (peaks.length === count) return peaks
  return Array.from({ length: count }, (_, index) => {
    const at = Math.floor((index / count) * peaks.length)
    return Math.min(1, Math.max(0, peaks[at] ?? 0))
  })
}

function AudioDisplay({
  className,
  src,
  title,
  artist,
  cover,
  waveform = false,
  download = false,
  loop = false,
  onEnded,
  ...props
}: Omit<React.ComponentProps<"div">, "children" | "title" | "onEnded"> & {
  src: string
  title?: string
  artist?: string
  /** Cover art URL. Without one a music note stands in. */
  cover?: string
  /** true decodes the waveform from the file; an array gives peaks from 0 to 1. */
  waveform?: boolean | number[]
  /** Show a download button. */
  download?: boolean
  loop?: boolean
  onEnded?: () => void
}) {
  const audioRef = React.useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = React.useState(false)
  const [current, setCurrent] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const [muted, setMuted] = React.useState(false)
  const [speed, setSpeed] = React.useState(1)
  const [decoded, setDecoded] = React.useState<{
    src: string
    peaks: number[]
  } | null>(null)
  const [error, setError] = React.useState(false)

  // Metadata can land before hydration, when no handler is attached yet.
  const attachAudio = React.useCallback((element: HTMLAudioElement | null) => {
    audioRef.current = element
    if (!element) return
    if (element.readyState >= 1) setDuration(element.duration)
    if (element.error) setError(true)
  }, [])

  React.useEffect(() => {
    if (waveform !== true) return
    const controller = new AbortController()
    decodePeaks(src, BAR_COUNT, controller.signal)
      .then((peaks) => setDecoded({ src, peaks }))
      .catch(() => {})
    return () => controller.abort()
  }, [src, waveform])

  React.useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed
  }, [speed])

  const peaks = Array.isArray(waveform)
    ? resample(waveform, BAR_COUNT)
    : waveform && decoded?.src === src
      ? decoded.peaks
      : null
  const progress = duration ? current / duration : 0

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) void audio.play().catch(() => setPlaying(false))
    else audio.pause()
  }

  const seekTo = (time: number) => {
    const audio = audioRef.current
    if (!audio || !Number.isFinite(audio.duration)) return
    audio.currentTime = Math.min(Math.max(time, 0), audio.duration)
    setCurrent(audio.currentTime)
  }

  return (
    <div
      data-slot="audio-display"
      data-playing={playing || undefined}
      className={cn(
        "flex w-full min-w-0 items-center gap-3 rounded-lg border border-border bg-background p-2.5",
        className
      )}
      {...props}
    >
      <audio
        ref={attachAudio}
        src={src}
        preload="metadata"
        loop={loop}
        muted={muted}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false)
          onEnded?.()
        }}
        onError={() => setError(true)}
        onLoadedMetadata={(event) => {
          setDuration(event.currentTarget.duration)
          setError(false)
        }}
        onDurationChange={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => setCurrent(event.currentTarget.currentTime)}
      />

      <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="size-full object-cover" />
        ) : (
          <MusicIcon
            aria-hidden
            className="absolute top-1/2 left-1/2 size-5 -translate-1/2 text-muted-foreground"
          />
        )}
        <button
          type="button"
          onClick={toggle}
          disabled={error}
          aria-label={playing ? "Pause" : "Play"}
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset disabled:opacity-50",
            cover
              ? "bg-black/30 text-white hover:bg-black/45"
              : "text-foreground hover:bg-foreground/5"
          )}
        >
          <span
            className={cn(
              "flex size-9 items-center justify-center rounded-full shadow-sm",
              cover
                ? "bg-white/90 text-black"
                : "bg-primary text-primary-foreground"
            )}
          >
            {playing ? (
              <PauseIcon className="size-4 fill-current" />
            ) : (
              <PlayIcon className="size-4 translate-x-px fill-current" />
            )}
          </span>
        </button>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="min-w-0 truncate text-sm font-medium">
            {title ?? "Untitled"}
          </span>
          {artist ? (
            <span className="min-w-0 truncate text-xs text-muted-foreground">
              {artist}
            </span>
          ) : null}
          {error ? (
            <span className="text-xs text-destructive">Can&apos;t play</span>
          ) : null}
          <div className="-my-1 ml-auto flex shrink-0 items-center">
            <button
              type="button"
              onClick={() =>
                setSpeed(
                  (value) => SPEEDS[(SPEEDS.indexOf(value) + 1) % SPEEDS.length]
                )
              }
              aria-label={`Playback speed ${speed}×`}
              title="Playback speed"
              className="h-7 min-w-9 rounded-md px-1 font-mono text-[11px] text-muted-foreground tabular-nums hover:bg-muted hover:text-foreground"
            >
              {speed}×
            </button>
            <button
              type="button"
              onClick={() => setMuted((value) => !value)}
              aria-label={muted ? "Unmute" : "Mute"}
              className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground [&_svg]:size-4"
            >
              {muted ? <VolumeXIcon /> : <Volume2Icon />}
            </button>
            {download ? (
              <a
                href={src}
                download
                aria-label="Download"
                title="Download"
                className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground [&_svg]:size-4"
              >
                <DownloadIcon />
              </a>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-9 shrink-0 font-mono text-[11px] text-muted-foreground tabular-nums">
            {formatDuration(current)}
          </span>

          <div className="group/seek relative flex h-7 min-w-0 flex-1 items-center">
            {peaks ? (
              <div
                aria-hidden
                className="pointer-events-none flex size-full items-center gap-px"
              >
                {peaks.map((peak, index) => (
                  <span
                    key={index}
                    className={cn(
                      "min-w-px flex-1 rounded-full transition-colors",
                      (index + 0.5) / peaks.length <= progress
                        ? "bg-primary"
                        : "bg-muted-foreground/30"
                    )}
                    style={{ height: `${Math.round(Math.max(8, peak * 100))}%` }}
                  />
                ))}
              </div>
            ) : (
              <div
                aria-hidden
                className="pointer-events-none relative h-1 w-full overflow-hidden rounded-full bg-muted"
              >
                <div
                  className="absolute inset-y-0 left-0 bg-primary"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            )}
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={current}
              aria-label="Seek"
              aria-valuetext={`${formatDuration(current)} of ${formatDuration(duration)}`}
              onChange={(event) => seekTo(Number(event.target.value))}
              className="absolute inset-0 w-full cursor-pointer opacity-0"
            />
          </div>

          <span className="w-9 shrink-0 text-right font-mono text-[11px] text-muted-foreground tabular-nums">
            {formatDuration(duration)}
          </span>
        </div>
      </div>
    </div>
  )
}

export { AudioDisplay }
