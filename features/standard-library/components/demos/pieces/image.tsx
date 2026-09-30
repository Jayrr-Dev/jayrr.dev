"use client"

import { Image } from "@/components/standard/image"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

// Inline SVG so the demo needs no network or next/image config.
const sampleSrc = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#38bdf8"/><stop offset="1" stop-color="#4f46e5"/></linearGradient></defs><rect width="320" height="180" fill="url(#g)"/><circle cx="240" cy="60" r="28" fill="#fde68a"/><path d="M0 180 L90 90 L160 150 L220 110 L320 180 Z" fill="#1e1b4b" opacity="0.7"/></svg>'
)}`

export function RendersImageDemo() {
  return (
    <>
      <RendersDemoCard className="w-full max-w-xl">
        <Image src={sampleSrc} alt="Mountains at dusk" />
      </RendersDemoCard>
      <RendersDemoCard label="placeholder (no src)" className="w-full max-w-xl">
        <Image alt="Site photo" />
      </RendersDemoCard>
      <RendersDemoCard label="ratio" className="w-full max-w-xl">
        <div className="grid w-full grid-cols-4 items-start gap-2">
          <Image ratio="wide" alt="wide" />
          <Image ratio="still" alt="still" />
          <Image ratio="square" alt="square" />
          <Image ratio={21 / 9} alt="21 / 9" />
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="fit contain" className="w-full max-w-xl">
        <div className="grid w-full grid-cols-2 gap-2">
          <Image src={sampleSrc} alt="cover" ratio="square" fit="cover" />
          <Image src={sampleSrc} alt="contain" ratio="square" fit="contain" />
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="rounded false" className="w-full max-w-xl">
        <Image src={sampleSrc} alt="Square corners" rounded={false} />
      </RendersDemoCard>
      <RendersDemoCard label="hover" className="w-full max-w-xl">
        <div className="grid w-full grid-cols-3 gap-2">
          <Image src={sampleSrc} alt="zoom" hover="zoom" />
          <Image src={sampleSrc} alt="sheen" hover="sheen" />
          <Image src={sampleSrc} alt="color" hover="color" />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          zoom · sheen · color — hover each image
        </p>
      </RendersDemoCard>
    </>
  )
}
