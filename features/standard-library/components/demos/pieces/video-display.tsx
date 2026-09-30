"use client"

import { VideoDisplay } from "@/components/standard/video-display"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const src = "/samples/sample-video.mp4"
const poster = "/samples/sample-video-poster.jpg"

export function RendersVideoDisplayDemo() {
  return (
    <>
      <RendersDemoCard className="w-full max-w-2xl">
        <VideoDisplay
          src={src}
          poster={poster}
          title="Mandelbrot zoom"
          tracks={[
            {
              src: "/samples/sample-video.vtt",
              label: "English",
              srcLang: "en",
              default: true,
            },
          ]}
        />
      </RendersDemoCard>
      <RendersDemoCard
        label="autoplay · muted · loop · 4 / 3"
        className="w-full max-w-2xl"
      >
        <div className="w-full max-w-sm">
          <VideoDisplay src={src} autoPlay loop ratio={4 / 3} />
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="controls native" className="w-full max-w-2xl">
        <div className="w-full max-w-sm">
          <VideoDisplay src={src} poster={poster} controls="native" />
        </div>
      </RendersDemoCard>
    </>
  )
}
