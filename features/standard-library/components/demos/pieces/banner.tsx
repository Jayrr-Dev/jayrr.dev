"use client"

import * as React from "react"
import { MegaphoneIcon, SparklesIcon, TriangleAlertIcon } from "lucide-react"

import { Banner, type BannerPosition } from "@/components/standard/banner"
import { Button } from "@/components/standard/button"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const tones = [
  "default",
  "info",
  "success",
  "warning",
  "danger",
  "broadcast",
] as const

const quotes = [
  <span key="ACME" className="font-mono">
    ACME <span className="text-success">▲ 2.41%</span>
  </span>,
  <span key="GLOBEX" className="font-mono">
    GLOBEX <span className="text-destructive">▼ 0.87%</span>
  </span>,
  <span key="INITECH" className="font-mono">
    INITECH <span className="text-success">▲ 1.12%</span>
  </span>,
  <span key="UMBRELLA" className="font-mono">
    UMBRELLA <span className="text-destructive">▼ 3.05%</span>
  </span>,
  <span key="HOOLI" className="font-mono">
    HOOLI <span className="text-success">▲ 0.34%</span>
  </span>,
]

const news = [
  "Payroll closes Thursday at 5pm",
  "New timesheet export is live",
  "Office closed Monday for the holiday",
]

/** A stage the floating demos pin to instead of the viewport. */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-56 w-full overflow-hidden rounded-lg border border-dashed border-border bg-background/40">
      {children}
    </div>
  )
}

function FloatingPositions() {
  const [position, setPosition] = React.useState<BannerPosition>("bottom")

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {(["top", "bottom", "left", "right"] as const).map((option) => (
          <Button
            key={option}
            size="sm"
            tone={option === position ? "default" : "outline"}
            onClick={() => setPosition(option)}
          >
            {option}
          </Button>
        ))}
      </div>
      <Stage>
        <Banner
          layout="floating"
          strategy="absolute"
          position={position}
          tone="broadcast"
          icon={<SparklesIcon />}
          title="New"
          dismissible
          key={position}
        >
          Timesheets now sync offline.
        </Banner>
      </Stage>
    </div>
  )
}

function ViewportBanner() {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <Button size="sm" tone="outline" onClick={() => setOpen(true)}>
        Show on page
      </Button>
      <Banner
        layout="floating"
        position="bottom"
        tone="info"
        appearance="solid"
        icon={<MegaphoneIcon />}
        title="Heads up"
        open={open}
        onOpenChange={setOpen}
        dismissible
        action={
          <Button size="sm" tone="quiet" onClick={() => setOpen(false)}>
            Got it
          </Button>
        }
      >
        Scheduled maintenance tonight from 10 to 11pm.
      </Banner>
    </>
  )
}

export function RendersBannerDemo() {
  return (
    <>
      <RendersDemoCard label="inline · announcement" className="w-full max-w-xl">
        <Banner
          tone="broadcast"
          icon={<MegaphoneIcon />}
          title="Office closed Friday"
          dismissible
        >
          Submit hours by Thursday.
        </Banner>
      </RendersDemoCard>
      <RendersDemoCard label="tone" className="w-full max-w-xl">
        <div className="flex w-full flex-col gap-2">
          {tones.map((tone) => (
            <Banner key={tone} tone={tone} title={tone} size="sm">
              Hours posted for Monday.
            </Banner>
          ))}
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="appearance solid" className="w-full max-w-xl">
        <div className="flex w-full flex-col gap-2">
          {tones.map((tone) => (
            <Banner key={tone} tone={tone} appearance="solid" title={tone} size="sm">
              Hours posted for Monday.
            </Banner>
          ))}
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="appearance outline · warning" className="w-full max-w-xl">
        <Banner
          tone="warning"
          appearance="outline"
          icon={<TriangleAlertIcon />}
          title="Sync paused"
          action={
            <Button size="sm" tone="outline">
              Retry
            </Button>
          }
        >
          Changes are saved on this device.
        </Banner>
      </RendersDemoCard>
      <RendersDemoCard label="motion ticker · stock" className="w-full max-w-xl">
        <Banner
          motion="ticker"
          appearance="solid"
          size="sm"
          title={<span className="font-mono">MARKETS</span>}
          items={quotes}
        />
      </RendersDemoCard>
      <RendersDemoCard label="motion ticker · news, reverse" className="w-full max-w-xl">
        <Banner
          motion="ticker"
          tone="broadcast"
          icon={<MegaphoneIcon />}
          items={news}
          speed={40}
          reverse
        />
      </RendersDemoCard>
      <RendersDemoCard label="layout floating · position" className="w-full max-w-xl">
        <FloatingPositions />
      </RendersDemoCard>
      <RendersDemoCard label="floating · ticker left / right" className="w-full max-w-xl">
        <Stage>
          <Banner
            layout="floating"
            strategy="absolute"
            position="left"
            motion="ticker"
            size="sm"
            appearance="solid"
            items={quotes}
          />
          <Banner
            layout="floating"
            strategy="absolute"
            position="right"
            motion="ticker"
            size="sm"
            tone="info"
            items={news}
          />
        </Stage>
      </RendersDemoCard>
      <RendersDemoCard label="inline · position bottom">
        <Stage>
          <div className="flex h-full flex-col">
            <div className="flex-1 p-3 text-xs text-muted-foreground">Page content</div>
            <Banner position="bottom" size="sm" tone="success" title="Saved">
              All hours are posted.
            </Banner>
          </div>
        </Stage>
      </RendersDemoCard>
      <RendersDemoCard label="floating · viewport (fixed)">
        <ViewportBanner />
      </RendersDemoCard>
    </>
  )
}
