"use client"

import { SvgDisplay } from "@/components/standard/svg-display"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const badge = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="fill" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#38bdf8"/>
      <stop offset="1" stop-color="#6366f1"/>
    </linearGradient>
  </defs>
  <path d="M60 6 L108 33 V87 L60 114 L12 87 V33 Z" fill="url(#fill)"/>
  <path d="M40 62 L54 76 L82 46" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4"/></svg>`

export function RendersSvgDisplayDemo() {
  return (
    <>
      <RendersDemoCard className="w-full max-w-xl">
        <SvgDisplay svg={badge} title="verified.svg" />
      </RendersDemoCard>
      <RendersDemoCard
        label="src · dark background"
        className="w-full max-w-xl"
      >
        <SvgDisplay src="/fx/sample-scene.svg" background="dark" height={220} />
      </RendersDemoCard>
      <RendersDemoCard
        label="small icon · light · preview only"
        className="w-full max-w-xl"
      >
        <SvgDisplay
          svg={icon}
          title="sun.svg"
          background="light"
          showCode={false}
          height={160}
        />
      </RendersDemoCard>
    </>
  )
}
