"use client"

import * as React from "react"
import { Volume1Icon, Volume2Icon, VolumeIcon, VolumeXIcon } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/standard/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/standard/popover"
import { useControllableState } from "@/hooks/use-controllable-state"

/**
 * A mute button with a volume slider beside it. The slider slides out on
 * hover and focus, stays open with `expand="always"`, or opens in a popover
 * with `expand="popover"` (the button opens a bare slider; drag to zero to
 * mute).
 * `orientation="vertical"` stands the slider up above the button. Pass
 * `media` to drive an <audio> or <video> element directly; volume runs 0 to 1.
 *
 * <VolumeButton media={videoRef} />
 * <VolumeButton value={volume} onValueChange={setVolume} expand="always" />
 * <VolumeButton expand="popover" />
 */

type VolumeButtonProps = Omit<React.ComponentProps<"div">, "defaultValue"> & {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  muted?: boolean
  defaultMuted?: boolean
  onMutedChange?: (muted: boolean) => void
  /** Element whose volume and muted state follow this control. */
  media?: React.RefObject<HTMLMediaElement | null>
  /**
   * "hover" shows the slider on hover or focus; "always" keeps it open;
   * "popover" opens it in a popover from the button.
   */
  expand?: "hover" | "always" | "popover"
  /** Slider direction. Popovers default to vertical, inline to horizontal. */
  orientation?: "horizontal" | "vertical"
  size?: React.ComponentProps<typeof Button>["size"]
  tone?: React.ComponentProps<typeof Button>["tone"]
  disabled?: boolean
}

function rendersVolumeIcon(volume: number, muted: boolean) {
  const className = "size-4"
  if (muted || volume === 0)
    return <VolumeXIcon aria-hidden className={className} />
  if (volume < 0.34) return <VolumeIcon aria-hidden className={className} />
  if (volume < 0.67) return <Volume1Icon aria-hidden className={className} />
  return <Volume2Icon aria-hidden className={className} />
}

function RendersVolumeSlider({
  value,
  orientation,
  disabled,
  onValueChange,
}: {
  value: number
  orientation: "horizontal" | "vertical"
  disabled: boolean
  onValueChange: (value: number) => void
}) {
  const vertical = orientation === "vertical"
  const percent = `${value * 100}%`

  return (
    <>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none relative overflow-hidden rounded-full bg-muted",
          vertical ? "h-full w-1" : "h-1 w-full"
        )}
      >
        <div
          className={cn(
            "absolute bg-foreground",
            vertical ? "inset-x-0 bottom-0" : "inset-y-0 left-0"
          )}
          style={vertical ? { height: percent } : { width: percent }}
        />
      </div>
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute size-3 rounded-full bg-foreground shadow-sm",
          vertical ? "translate-y-1/2" : "-translate-x-1/2"
        )}
        style={vertical ? { bottom: percent } : { left: percent }}
      />
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        disabled={disabled}
        aria-label="Volume"
        aria-orientation={orientation}
        aria-valuetext={`${Math.round(value * 100)}%`}
        onChange={(event) => onValueChange(Number(event.target.value))}
        // Vertical writing mode turns the native range upright; rtl puts the
        // minimum at the bottom so arrow keys and dragging match the track.
        className={cn(
          "absolute inset-0 size-full cursor-pointer opacity-0 disabled:cursor-default",
          vertical && "[direction:rtl] [writing-mode:vertical-lr]"
        )}
      />
    </>
  )
}

function syncsMedia(element: HTMLMediaElement, volume: number, muted: boolean) {
  element.volume = volume
  element.muted = muted
}

function VolumeButton({
  value,
  defaultValue = 0.8,
  onValueChange,
  muted: mutedProp,
  defaultMuted = false,
  onMutedChange,
  media,
  expand = "hover",
  orientation = expand === "popover" ? "vertical" : "horizontal",
  size = "default",
  tone = "ghost",
  disabled = false,
  className,
  ...props
}: VolumeButtonProps) {
  const [volume, setVolume] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const [muted, setMuted] = useControllableState({
    value: mutedProp,
    defaultValue: defaultMuted,
    onChange: onMutedChange,
  })
  // Unmuting from zero restores the last audible level instead of silence.
  const lastAudible = React.useRef(volume > 0 ? volume : defaultValue || 0.8)

  React.useEffect(() => {
    const element = media?.current
    if (element) syncsMedia(element, volume, muted)
  }, [media, volume, muted])

  function changesVolume(next: number) {
    setVolume(next)
    if (next > 0) {
      lastAudible.current = next
      setMuted(false)
    }
  }

  function togglesMute() {
    if (muted || volume === 0) {
      setMuted(false)
      if (volume === 0) setVolume(lastAudible.current)
    } else {
      setMuted(true)
    }
  }

  const silent = muted || volume === 0
  const shown = silent ? 0 : volume

  const vertical = orientation === "vertical"
  const label = silent ? "Unmute" : "Mute"
  const muteButton = (
    <Button
      tone={tone}
      size={size}
      iconOnly
      disabled={disabled}
      aria-pressed={silent}
      aria-label={label}
      title={label}
      onClick={togglesMute}
    >
      {rendersVolumeIcon(volume, muted)}
    </Button>
  )
  const slider = (
    <RendersVolumeSlider
      value={shown}
      orientation={orientation}
      disabled={disabled}
      onValueChange={changesVolume}
    />
  )

  if (expand === "popover") {
    return (
      <div
        data-slot="volume-button"
        data-expand={expand}
        data-orientation={orientation}
        data-muted={silent || undefined}
        className={cn("inline-flex", className)}
        {...props}
      >
        <Popover>
          <PopoverTrigger asChild>
            <Button
              tone={tone}
              size={size}
              iconOnly
              disabled={disabled}
              aria-label="Volume"
              title="Volume"
            >
              {rendersVolumeIcon(volume, muted)}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side={vertical ? "top" : "bottom"}
            className="w-auto p-3"
          >
            <div
              className={cn(
                "relative flex items-center justify-center",
                vertical ? "h-28 w-5" : "h-5 w-32"
              )}
            >
              {slider}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    )
  }

  return (
    <div
      data-slot="volume-button"
      data-expand={expand}
      data-orientation={orientation}
      data-muted={silent || undefined}
      className={cn(
        "group/volume inline-flex items-center gap-1",
        vertical && "flex-col-reverse",
        className
      )}
      {...props}
    >
      {muteButton}
      <div
        className={cn(
          "relative flex items-center justify-center transition-[width,height,opacity] duration-200",
          vertical
            ? expand === "always"
              ? "h-24 w-5"
              : "h-0 w-5 opacity-0 group-focus-within/volume:h-24 group-focus-within/volume:opacity-100 group-hover/volume:h-24 group-hover/volume:opacity-100"
            : expand === "always"
              ? "h-5 w-24"
              : "h-5 w-0 opacity-0 group-focus-within/volume:w-24 group-focus-within/volume:opacity-100 group-hover/volume:w-24 group-hover/volume:opacity-100"
        )}
      >
        {slider}
      </div>
    </div>
  )
}

export { VolumeButton }
