"use client"

import * as React from "react"

/**
 * Shared by the Webcam and Mic buttons: turns a camera or microphone stream
 * on and off with `getUserMedia`, and stops every track when it goes off or
 * the component unmounts.
 */

/** `off` before asking or after stopping, `denied` when permission or the device failed. */
type MediaDeviceStatus = "off" | "starting" | "on" | "denied"

function useMediaDevice({
  constraints,
  onStreamChange,
  onError,
}: {
  constraints: MediaStreamConstraints
  onStreamChange?: (stream: MediaStream | null) => void
  onError?: (error: unknown) => void
}) {
  const [status, setStatus] = React.useState<MediaDeviceStatus>("off")
  const stream = React.useRef<MediaStream | null>(null)
  // Bumped on every stop so a slow permission prompt can't turn it back on.
  const attempt = React.useRef(0)

  const callbacks = React.useRef({ constraints, onStreamChange, onError })
  React.useEffect(() => {
    callbacks.current = { constraints, onStreamChange, onError }
  })

  const stop = React.useCallback(() => {
    attempt.current += 1
    if (stream.current) {
      stream.current.getTracks().forEach((track) => track.stop())
      stream.current = null
      callbacks.current.onStreamChange?.(null)
    }
    setStatus("off")
  }, [])

  const start = React.useCallback(async () => {
    const current = ++attempt.current
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("denied")
      callbacks.current.onError?.(
        new Error("Media devices need a secure (https) page")
      )
      return
    }

    setStatus("starting")
    try {
      const next = await navigator.mediaDevices.getUserMedia(
        callbacks.current.constraints
      )
      if (current !== attempt.current) {
        next.getTracks().forEach((track) => track.stop())
        return
      }
      stream.current = next
      // The device can go away on its own (unplugged, revoked in the browser).
      next.getTracks().forEach((track) =>
        track.addEventListener("ended", () => {
          if (stream.current === next) stop()
        })
      )
      setStatus("on")
      callbacks.current.onStreamChange?.(next)
    } catch (error) {
      if (current !== attempt.current) return
      setStatus("denied")
      callbacks.current.onError?.(error)
    }
  }, [stop])

  React.useEffect(() => stop, [stop])

  function toggle() {
    if (status === "on" || status === "starting") {
      stop()
    } else {
      void start()
    }
  }

  return { status, stream, start, stop, toggle }
}

export { useMediaDevice, type MediaDeviceStatus }
