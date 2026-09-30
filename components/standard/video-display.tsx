"use client"

import * as React from "react"
import {
  CaptionsIcon,
  LoaderCircleIcon,
  MaximizeIcon,
  MinimizeIcon,
  PauseIcon,
  PictureInPicture2Icon,
  PlayIcon,
  RotateCcwIcon,
  Volume1Icon,
  Volume2Icon,
  VolumeXIcon,
} from "lucide-react"
import { cn } from "cn"

import { formatDuration } from "@/components/standard/display-frame"

/**
 * A video with its own controls: play, a seek bar that shows what has
 * buffered, time, volume, speed, captions, picture-in-picture and
 * fullscreen. The controls fade out while it plays and the pointer rests.
 *
 * Keys, when the player has focus: Space or K plays and pauses, ← and →
 * seek 5 seconds, ↑ and ↓ change the volume, M mutes, F goes fullscreen,
 * C toggles captions.
 *
 * <VideoDisplay src="/clips/intro.mp4" poster="/clips/intro.jpg" />
 * <VideoDisplay sources={[{ src: "a.webm", type: "video/webm" }, { src: "a.mp4", type: "video/mp4" }]} ratio={4 / 3} />
 */

type VideoSource = { src: string; type?: string }
type VideoTrack = {
  src: string
  label: string
  srcLang: string
  default?: boolean
}

const SPEEDS = [0.5, 1, 1.25, 1.5, 2]

const noSubscribe = () => () => {}

const controlButton =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-md text-white/85 outline-none transition-colors hover:bg-white/15 hover:text-white focus-visible:ring-2 focus-visible:ring-white/60 disabled:opacity-40 [&_svg]:size-4"

function VideoDisplay({
  className,
  src,
  sources,
  poster,
  title,
  tracks,
  ratio = 16 / 9,
  autoPlay = false,
  muted: initialMuted = false,
  loop = false,
  controls = "custom",
  rounded = true,
  onEnded,
  ...props
}: Omit<React.ComponentProps<"div">, "children" | "title" | "onEnded"> & {
  src?: string
  /** Several encodings of one video; the browser plays the first it can. */
  sources?: VideoSource[]
  poster?: string
  /** Shown over the top of the frame while the controls are visible. */
  title?: string
  /** Caption or subtitle files (WebVTT). */
  tracks?: VideoTrack[]
  /** Width / height. */
  ratio?: number
  autoPlay?: boolean
  /** Start muted; browsers only autoplay muted video. */
  muted?: boolean
  loop?: boolean
  /** "native" uses the browser's own controls instead. */
  controls?: "custom" | "native"
  rounded?: boolean
  onEnded?: () => void
}) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const hideTimer = React.useRef<number | undefined>(undefined)

  const [playing, setPlaying] = React.useState(false)
  const [started, setStarted] = React.useState(autoPlay)
  const [ended, setEnded] = React.useState(false)
  const [waiting, setWaiting] = React.useState(false)
  const [error, setError] = React.useState(false)
  const [current, setCurrent] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const [buffered, setBuffered] = React.useState(0)
  const [volume, setVolume] = React.useState(1)
  const [muted, setMuted] = React.useState(initialMuted || autoPlay)
  const [speed, setSpeed] = React.useState(1)
  const [captions, setCaptions] = React.useState(
    () => tracks?.some((track) => track.default) ?? false
  )
  const [fullscreen, setFullscreen] = React.useState(false)
  const [idle, setIdle] = React.useState(false)
  // False on the server, so the button appears after hydration.
  const canPip = React.useSyncExternalStore(
    noSubscribe,
    () => document.pictureInPictureEnabled === true,
    () => false
  )

  const video = () => videoRef.current

  // Metadata and autoplay can land before hydration, when no handler is
  // attached yet, so read them off the element as it mounts.
  const attachVideo = React.useCallback((element: HTMLVideoElement | null) => {
    videoRef.current = element
    if (!element) return
    if (element.readyState >= 1) setDuration(element.duration)
    if (!element.paused) {
      setPlaying(true)
      setStarted(true)
    }
    if (element.error) setError(true)
  }, [])

  React.useEffect(() => {
    const onChange = () =>
      setFullscreen(document.fullscreenElement === rootRef.current)
    document.addEventListener("fullscreenchange", onChange)
    return () => document.removeEventListener("fullscreenchange", onChange)
  }, [])

  // Keep the element in step with state it can't report on its own.
  React.useEffect(() => {
    const element = video()
    if (!element) return
    element.volume = volume
    element.muted = muted
    element.playbackRate = speed
  }, [volume, muted, speed])

  React.useEffect(() => {
    const element = video()
    if (!element) return
    for (let index = 0; index < element.textTracks.length; index += 1) {
      element.textTracks[index].mode =
        captions && index === 0 ? "showing" : "hidden"
    }
  }, [captions, tracks])

  const wake = React.useCallback(() => {
    setIdle(false)
    window.clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => setIdle(true), 2500)
  }, [])

  React.useEffect(() => () => window.clearTimeout(hideTimer.current), [])

  const toggle = React.useCallback(() => {
    const element = video()
    if (!element) return
    if (element.paused || element.ended) {
      setStarted(true)
      void element.play().catch(() => setPlaying(false))
    } else {
      element.pause()
    }
  }, [])

  const seekTo = (time: number) => {
    const element = video()
    if (!element || !Number.isFinite(element.duration)) return
    element.currentTime = Math.min(Math.max(time, 0), element.duration)
    setCurrent(element.currentTime)
  }

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void rootRef.current?.requestFullscreen?.()
  }

  const togglePip = () => {
    const element = video()
    if (!element) return
    if (document.pictureInPictureElement) void document.exitPictureInPicture()
    else void element.requestPictureInPicture?.().catch(() => {})
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (
      event.target instanceof HTMLInputElement &&
      event.key.startsWith("Arrow")
    )
      return
    const key = event.key.toLowerCase()
    const element = video()
    if (!element) return
    switch (key) {
      case " ":
      case "k":
        toggle()
        break
      case "arrowleft":
        seekTo(element.currentTime - 5)
        break
      case "arrowright":
        seekTo(element.currentTime + 5)
        break
      case "arrowup":
        setMuted(false)
        setVolume((value) => Math.min(1, value + 0.1))
        break
      case "arrowdown":
        setVolume((value) => Math.max(0, value - 0.1))
        break
      case "m":
        setMuted((value) => !value)
        break
      case "f":
        toggleFullscreen()
        break
      case "c":
        if (tracks?.length) setCaptions((value) => !value)
        break
      default:
        return
    }
    event.preventDefault()
    wake()
  }

  const mediaChildren = (
    <>
      {sources?.map((source) => (
        <source key={source.src} src={source.src} type={source.type} />
      ))}
      {tracks?.map((track) => (
        <track
          key={track.src}
          kind="subtitles"
          src={track.src}
          label={track.label}
          srcLang={track.srcLang}
          default={track.default}
        />
      ))}
    </>
  )

  if (controls === "native") {
    return (
      <div
        data-slot="video-display"
        className={cn(
          "relative w-full overflow-hidden bg-black",
          rounded && "rounded-lg",
          className
        )}
        style={{ aspectRatio: ratio }}
        {...props}
      >
        <video
          src={src}
          poster={poster}
          controls
          autoPlay={autoPlay}
          muted={initialMuted || autoPlay}
          loop={loop}
          playsInline
          onEnded={onEnded}
          className="size-full"
        >
          {mediaChildren}
        </video>
      </div>
    )
  }

  const progress = duration ? (current / duration) * 100 : 0
  const bufferedPercent = duration ? (buffered / duration) * 100 : 0
  const showControls = !playing || !idle
  const VolumeIcon =
    muted || volume === 0
      ? VolumeXIcon
      : volume < 0.5
        ? Volume1Icon
        : Volume2Icon

  return (
    <div
      ref={rootRef}
      data-slot="video-display"
      data-playing={playing || undefined}
      tabIndex={0}
      role="region"
      aria-label={title ? `Video: ${title}` : "Video player"}
      onKeyDown={onKeyDown}
      onPointerMove={wake}
      onPointerLeave={() => playing && setIdle(true)}
      className={cn(
        "group/video relative w-full overflow-hidden bg-black text-white outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50",
        rounded && !fullscreen && "rounded-lg",
        !showControls && "cursor-none",
        className
      )}
      style={fullscreen ? undefined : { aspectRatio: ratio }}
      {...props}
    >
      <video
        ref={attachVideo}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline
        preload="metadata"
        onClick={toggle}
        onDoubleClick={toggleFullscreen}
        onPlay={() => {
          setPlaying(true)
          setEnded(false)
          wake()
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false)
          setEnded(true)
          onEnded?.()
        }}
        onWaiting={() => setWaiting(true)}
        onPlaying={() => setWaiting(false)}
        onCanPlay={() => setWaiting(false)}
        onError={() => setError(true)}
        onLoadedMetadata={(event) => {
          setDuration(event.currentTarget.duration)
          setError(false)
        }}
        onDurationChange={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => setCurrent(event.currentTarget.currentTime)}
        onProgress={(event) => {
          const ranges = event.currentTarget.buffered
          setBuffered(ranges.length ? ranges.end(ranges.length - 1) : 0)
        }}
        className="size-full object-contain"
      >
        {mediaChildren}
      </video>

      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-sm text-white/70">
          This video can&apos;t be played.
        </div>
      ) : null}

      {waiting && playing && !error ? (
        <LoaderCircleIcon
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 size-10 -translate-1/2 animate-spin text-white/80"
        />
      ) : null}

      {!playing && !error && !waiting ? (
        <button
          type="button"
          onClick={toggle}
          aria-label={ended ? "Replay" : "Play"}
          className={cn(
            "absolute top-1/2 left-1/2 flex size-16 -translate-1/2 items-center justify-center rounded-full bg-black/55 text-white ring-1 ring-white/20 backdrop-blur-sm transition-transform outline-none hover:scale-105 focus-visible:ring-3 focus-visible:ring-white/60",
            started && !ended && "size-14"
          )}
        >
          {ended ? (
            <RotateCcwIcon className="size-6" />
          ) : (
            <PlayIcon className="size-7 translate-x-0.5 fill-current" />
          )}
        </button>
      ) : null}

      {title ? (
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 bg-linear-to-b from-black/70 to-transparent px-4 pt-3 pb-8 text-sm font-medium transition-opacity duration-300",
            showControls ? "opacity-100" : "opacity-0"
          )}
        >
          {title}
        </div>
      ) : null}

      <div
        data-slot="video-controls"
        className={cn(
          // The gradient passes clicks through to the video; only the controls take them.
          "pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/40 to-transparent px-2 pt-8 pb-1.5 transition-opacity duration-300",
          showControls ? "opacity-100 *:pointer-events-auto" : "opacity-0"
        )}
        onFocus={wake}
      >
        <div className="group/seek relative mx-1 flex h-4 items-center">
          <div className="pointer-events-none absolute inset-x-0 h-1 overflow-hidden rounded-full bg-white/25 transition-[height] group-hover/seek:h-1.5">
            <div
              className="absolute inset-y-0 left-0 bg-white/35"
              style={{ width: `${bufferedPercent}%` }}
            />
            <div
              className="absolute inset-y-0 left-0 bg-white"
              style={{ width: `${progress}%` }}
            />
          </div>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={current}
            aria-label="Seek"
            aria-valuetext={`${formatDuration(current)} of ${formatDuration(duration)}`}
            onChange={(event) => seekTo(Number(event.target.value))}
            className="absolute inset-0 w-full cursor-pointer appearance-none bg-transparent opacity-0 focus-visible:opacity-100 [&::-moz-range-thumb]:size-3 [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute size-3 -translate-x-1/2 rounded-full bg-white opacity-0 shadow transition-opacity group-hover/seek:opacity-100"
            style={{ left: `${progress}%` }}
          />
        </div>

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            className={controlButton}
            onClick={toggle}
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? (
              <PauseIcon className="fill-current" />
            ) : (
              <PlayIcon className="fill-current" />
            )}
          </button>

          <div className="group/volume flex items-center">
            <button
              type="button"
              className={controlButton}
              onClick={() => setMuted((value) => !value)}
              aria-label={muted ? "Unmute" : "Mute"}
            >
              <VolumeIcon />
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              aria-label="Volume"
              onChange={(event) => {
                const value = Number(event.target.value)
                setVolume(value)
                setMuted(value === 0)
              }}
              className="h-1 w-0 cursor-pointer accent-white opacity-0 transition-all duration-200 group-focus-within/volume:mr-2 group-focus-within/volume:w-16 group-focus-within/volume:opacity-100 group-hover/volume:mr-2 group-hover/volume:w-16 group-hover/volume:opacity-100"
            />
          </div>

          <span className="px-1.5 font-mono text-xs whitespace-nowrap text-white/85 tabular-nums">
            {formatDuration(current)}
            <span className="text-white/50"> / {formatDuration(duration)}</span>
          </span>

          <span className="flex-1" />

          <button
            type="button"
            className={cn(
              controlButton,
              "w-auto min-w-8 px-1.5 font-mono text-xs"
            )}
            onClick={() =>
              setSpeed(
                (value) => SPEEDS[(SPEEDS.indexOf(value) + 1) % SPEEDS.length]
              )
            }
            aria-label={`Playback speed ${speed}×`}
            title="Playback speed"
          >
            {speed}×
          </button>

          {tracks?.length ? (
            <button
              type="button"
              className={cn(controlButton, captions && "text-white")}
              onClick={() => setCaptions((value) => !value)}
              aria-label="Captions"
              aria-pressed={captions}
            >
              <CaptionsIcon className={cn(captions && "fill-white/25")} />
            </button>
          ) : null}

          {canPip ? (
            <button
              type="button"
              className={controlButton}
              onClick={togglePip}
              aria-label="Picture in picture"
            >
              <PictureInPicture2Icon />
            </button>
          ) : null}

          <button
            type="button"
            className={controlButton}
            onClick={toggleFullscreen}
            aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {fullscreen ? <MinimizeIcon /> : <MaximizeIcon />}
          </button>
        </div>
      </div>
    </div>
  )
}

export { VideoDisplay }
export type { VideoSource, VideoTrack }
