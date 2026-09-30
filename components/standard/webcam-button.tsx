"use client"

import * as React from "react"
import { VideoIcon, VideoOffIcon } from "lucide-react"

import { Button } from "@/components/standard/button"
import { useMediaDevice } from "@/components/standard/media-device"

/**
 * Turns the camera on and off. The first press asks for permission; the
 * stream goes to `onStreamChange` (null when it stops) and every track is
 * stopped on unmount, so the camera light never stays on.
 *
 * <WebcamButton onStreamChange={(stream) => (video.srcObject = stream)} />
 * <WebcamButton iconOnly facingMode="environment" />
 */

type WebcamButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "onClick" | "href"
> & {
  /** "user" is the front camera, "environment" the back one. */
  facingMode?: "user" | "environment"
  /** Full video constraints; replaces `facingMode`. */
  video?: MediaTrackConstraints
  onStreamChange?: (stream: MediaStream | null) => void
  onError?: (error: unknown) => void
}

function WebcamButton({
  facingMode = "user",
  video,
  onStreamChange,
  onError,
  iconOnly = false,
  tone = "outline",
  children,
  ...props
}: WebcamButtonProps) {
  const camera = useMediaDevice({
    constraints: { video: video ?? { facingMode }, audio: false },
    onStreamChange,
    onError,
  })
  const on = camera.status === "on"
  const label =
    camera.status === "denied"
      ? "Camera blocked"
      : on
        ? "Stop camera"
        : (children ?? "Start camera")
  const icon = on ? (
    <VideoIcon aria-hidden className="size-4" />
  ) : (
    <VideoOffIcon aria-hidden className="size-4" />
  )

  return (
    <Button
      data-slot="webcam-button"
      data-status={camera.status}
      tone={on ? "danger" : tone}
      iconOnly={iconOnly}
      aria-pressed={on}
      aria-label={iconOnly ? "Camera" : undefined}
      title={iconOnly ? (on ? "Stop camera" : "Start camera") : undefined}
      loading={camera.status === "starting"}
      leading={iconOnly ? undefined : icon}
      onClick={camera.toggle}
      {...props}
    >
      {iconOnly ? icon : label}
    </Button>
  )
}

export { WebcamButton }
