"use client"

import {
  BarChart3Icon,
  CalendarIcon,
  ClockIcon,
  DollarSignIcon,
  HardHatIcon,
  SparklesIcon,
  UsersIcon,
  WrenchIcon,
} from "lucide-react"

import {
  BentoGrid,
  BentoTile,
  BentoTileDescription,
  BentoTileFooter,
  BentoTileMedia,
  BentoTileTitle,
} from "@/components/standard/bento-grid"
import { Button } from "@/components/standard/button"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

function RendersSwatch({ className }: { className: string }) {
  return <div className={`size-full ${className}`} />
}

export function RendersStandardBentoGridDemo() {
  return (
    <div data-fill className="flex w-full flex-col gap-3">
      <RendersDemoCard fill label='variant "featured"'>
        <BentoGrid variant="featured">
          <BentoTile
            variant="primary"
            icon={<SparklesIcon />}
            title="This week"
            description="412 hours logged across 18 jobs."
          >
            <BentoTileFooter>
              <Button
                size="sm"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              >
                Open report
              </Button>
            </BentoTileFooter>
          </BentoTile>
          <BentoTile icon={<ClockIcon />} title="Hours" description="412" />
          <BentoTile icon={<DollarSignIcon />} title="Cost" description="$38.2k" />
          <BentoTile icon={<HardHatIcon />} title="Jobs" description="18 open" />
          <BentoTile icon={<UsersIcon />} title="Crew" description="24 active" />
        </BentoGrid>
      </RendersDemoCard>

      <RendersDemoCard fill label='variant "mosaic"'>
        <BentoGrid variant="mosaic">
          <BentoTile variant="muted" title="Elevation">
            <BentoTileMedia>
              <RendersSwatch className="bg-linear-to-br from-indigo-500 to-cyan-400" />
            </BentoTileMedia>
          </BentoTile>
          <BentoTile title="Shape" description="Corners and radii." />
          <BentoTile variant="muted" title="Motion">
            <BentoTileMedia>
              <RendersSwatch className="bg-linear-to-br from-lime-400 to-amber-400" />
            </BentoTileMedia>
          </BentoTile>
          <BentoTile title="Color" description="Tokens, not hex." />
          <BentoTile variant="outline" title="Type" description="One scale, five steps." />
          <BentoTile variant="outline" title="Space" description="Multiples of four." />
        </BentoGrid>
      </RendersDemoCard>

      <RendersDemoCard fill label='variant "hero"'>
        <BentoGrid variant="hero">
          <BentoTile className="min-h-40 justify-end text-white">
            <BentoTileMedia position="background">
              <RendersSwatch className="bg-linear-to-br from-pink-400 via-fuchsia-500 to-indigo-600" />
            </BentoTileMedia>
            <BentoTileTitle className="text-xl">Spring schedule</BentoTileTitle>
            <BentoTileDescription className="text-white/80">
              Background media sits behind the tile content.
            </BentoTileDescription>
          </BentoTile>
          <BentoTile icon={<CalendarIcon />} title="Mar" description="6 jobs" />
          <BentoTile icon={<CalendarIcon />} title="Apr" description="9 jobs" />
          <BentoTile icon={<CalendarIcon />} title="May" description="11 jobs" />
        </BentoGrid>
      </RendersDemoCard>

      <RendersDemoCard fill label='variant "sidebar"'>
        <BentoGrid variant="sidebar">
          <BentoTile variant="muted" icon={<WrenchIcon />} title="Equipment">
            <BentoTileDescription>
              A tall tile runs two rows down the side.
            </BentoTileDescription>
          </BentoTile>
          <BentoTile title="Trucks" description="7" />
          <BentoTile title="Lifts" description="3" />
          <BentoTile title="Trailers" description="5" />
          <BentoTile title="Tools" description="142" />
        </BentoGrid>
      </RendersDemoCard>

      <RendersDemoCard fill label='variant "split"'>
        <BentoGrid variant="split" rowHeight="sm">
          <BentoTile interactive title="Wide" description="Two columns." />
          <BentoTile interactive title="Small" />
          <BentoTile interactive title="Small" />
          <BentoTile interactive title="Wide" description="Two columns." />
        </BentoGrid>
      </RendersDemoCard>

      <RendersDemoCard fill label="custom spans on uniform">
        <BentoGrid columns={4} rowHeight="sm" gap="sm">
          <BentoTile colSpan={3} variant="muted" icon={<BarChart3Icon />} title="colSpan 3" />
          <BentoTile rowSpan={2} variant="primary" title="rowSpan 2" />
          <BentoTile title="1×1" />
          <BentoTile colSpan={2} variant="outline" title="colSpan 2" />
          <BentoTile colSpan="full" variant="ghost" title='colSpan "full", variant "ghost"' />
        </BentoGrid>
      </RendersDemoCard>

      <RendersDemoCard fill label="tile variants">
        <BentoGrid columns={5} rowHeight="auto" gap="sm">
          <BentoTile title="default" />
          <BentoTile variant="muted" title="muted" />
          <BentoTile variant="outline" title="outline" />
          <BentoTile variant="ghost" title="ghost" />
          <BentoTile variant="primary" title="primary" />
        </BentoGrid>
      </RendersDemoCard>
    </div>
  )
}
