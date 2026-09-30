"use client"

import { useEffect, useRef, useState } from "react"

import { WebcamButton } from "@/components/standard/webcam-button"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

function RendersWebcamPreview() {
  const video = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (video.current) video.current.srcObject = stream
  }, [stream])

  return (
    <div className="flex w-full flex-col items-start gap-3">
      <div className="relative aspect-video w-full max-w-xs overflow-hidden rounded-lg border border-border bg-background">
        <video
          ref={video}
          autoPlay
          muted
          playsInline
          className="size-full -scale-x-100 object-cover"
        />
        {stream ? null : (
          <span className="absolute inset-0 flex items-center justify-center font-mono text-xs text-muted-foreground">
            {error ?? "Camera off"}
          </span>
        )}
      </div>
      <WebcamButton
        onStreamChange={(next) => {
          setStream(next)
          setError(null)
        }}
        onError={() => setError("Permission denied or no camera")}
      />
    </div>
  )
}

export function RendersWebcamButtonDemo() {
  return (
    <>
      <RendersDemoCard label="with preview">
        <RendersWebcamPreview />
      </RendersDemoCard>
      <RendersDemoCard label="icon only">
        <div className="flex gap-2">
          <WebcamButton iconOnly />
          <WebcamButton iconOnly shape="circle" tone="quiet" />
        </div>
      </RendersDemoCard>
    </>
  )
}
