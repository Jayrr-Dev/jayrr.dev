"use client"

import { useEffect, useState } from "react"

import { ImageUpload } from "@/components/standard/image-upload"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const SAMPLE_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#ec4899"/></linearGradient></defs><rect width="96" height="96" fill="url(#g)"/><circle cx="68" cy="30" r="10" fill="#fde68a"/><path d="M0 80 L32 48 L56 70 L72 56 L96 78 V96 H0Z" fill="#1e1b4b" opacity=".55"/></svg>`
)}`

function RendersUploadProgressCard() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((current) => (current >= 100 ? 0 : current + 5))
    }, 300)
    return () => clearInterval(timer)
  }, [])

  return (
    <RendersDemoCard label="Uploading">
      <ImageUpload
        label="Cover image"
        defaultPreview={SAMPLE_IMAGE}
        progress={progress}
      />
    </RendersDemoCard>
  )
}

export function RendersImageUploadDemo() {
  return (
    <>
      <RendersDemoCard label="Dropzone">
        <ImageUpload label="Cover image" />
      </RendersDemoCard>
      <RendersDemoCard label="With image">
        <ImageUpload label="Cover image" defaultPreview={SAMPLE_IMAGE} />
      </RendersDemoCard>
      <RendersDemoCard label="Avatar">
        <ImageUpload label="Profile photo" variant="avatar" maxSizeMb={2} />
      </RendersDemoCard>
      <RendersDemoCard label="Avatar with image">
        <ImageUpload
          label="Profile photo"
          variant="avatar"
          maxSizeMb={2}
          defaultPreview={SAMPLE_IMAGE}
        />
      </RendersDemoCard>
      <RendersUploadProgressCard />
      <RendersDemoCard label="Disabled">
        <ImageUpload label="Cover image" disabled />
      </RendersDemoCard>
    </>
  )
}
