"use client"

import { GlobeIcon, MoreVerticalIcon, PlayIcon } from "lucide-react"

import { Button } from "@/components/standard/button"
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardLeft,
  CardMain,
  CardMedia,
  CardMediaOverlay,
  CardMeta,
  CardRight,
  CardThumbnail,
  CardTitle,
} from "@/components/standard/card"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersCardDemo() {
  return (
    <>
      <RendersDemoCard>
        <Card>
          <CardHeader>
            <CardTitle>Registry item</CardTitle>
          </CardHeader>
          <CardBody>A heading you can install.</CardBody>
          <CardFooter>
            <Button size="sm">Add</Button>
          </CardFooter>
        </Card>
      </RendersDemoCard>
      <RendersDemoCard label="left and right panels">
        <Card>
          <CardLeft>Left</CardLeft>
          <CardMain>
            <CardHeader>
              <CardTitle>Crew</CardTitle>
            </CardHeader>
            <CardBody>Panels run the full height, like columns.</CardBody>
            <CardFooter>Footer</CardFooter>
          </CardMain>
          <CardRight>Right</CardRight>
        </Card>
      </RendersDemoCard>
      <RendersDemoCard label="body only">
        <Card>
          <CardBody>Classic stays shadcn. Standard stays yours.</CardBody>
        </Card>
      </RendersDemoCard>
      <RendersDemoCard label="media top">
        <Card>
          <CardMedia>
            <div className="size-full bg-linear-to-br from-indigo-500 to-cyan-400" />
          </CardMedia>
          <CardHeader>
            <CardTitle>Elevation</CardTitle>
          </CardHeader>
          <CardBody>
            The relative distance between two surfaces along the z-axis.
          </CardBody>
        </Card>
      </RendersDemoCard>
      <RendersDemoCard label="media inset">
        <Card>
          <CardMedia inset ratio="still">
            <div className="size-full bg-linear-to-br from-lime-400 to-amber-400" />
          </CardMedia>
          <CardHeader>
            <CardTitle>Shape</CardTitle>
          </CardHeader>
          <CardBody>Inset media keeps the card padding around it.</CardBody>
        </Card>
      </RendersDemoCard>
      <RendersDemoCard label="media left">
        <Card>
          <CardMedia position="left">
            <div className="size-full bg-linear-to-br from-pink-300 to-fuchsia-400" />
          </CardMedia>
          <CardMain className="justify-center">
            <CardBody>May 19, 2026</CardBody>
            <CardHeader>
              <CardTitle>What&apos;s new</CardTitle>
            </CardHeader>
            <CardBody>Side media runs the full height of the card.</CardBody>
          </CardMain>
        </Card>
      </RendersDemoCard>
      <RendersDemoCard label="media right, inset">
        <Card>
          <CardMedia position="right" inset>
            <div className="size-full bg-linear-to-br from-sky-400 to-violet-500" />
          </CardMedia>
          <CardMain className="justify-center">
            <CardHeader>
              <CardTitle>Color</CardTitle>
            </CardHeader>
            <CardBody>Put the media on either side.</CardBody>
          </CardMain>
        </Card>
      </RendersDemoCard>
      <RendersDemoCard label="video, play on hover">
        <Card effect="lift">
          <CardMedia hover="zoom">
            <div className="size-full bg-linear-to-br from-zinc-700 to-zinc-900" />
            <CardMediaOverlay placement="center" reveal>
              <span className="flex size-12 items-center justify-center rounded-full bg-background/80 text-foreground">
                <PlayIcon className="size-5" />
              </span>
            </CardMediaOverlay>
            <CardMediaOverlay>
              <span className="rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
                12:04
              </span>
            </CardMediaOverlay>
          </CardMedia>
          <CardHeader>
            <CardTitle>Motion basics</CardTitle>
          </CardHeader>
          <CardBody>Pass a video element or a poster with overlays.</CardBody>
        </Card>
      </RendersDemoCard>
      <RendersDemoCard label="lift, zoom, edge fade">
        <Card effect="lift">
          <CardMedia fade="edge" hover="zoom">
            <div className="size-full bg-linear-to-br from-emerald-400 via-teal-500 to-indigo-600" />
          </CardMedia>
          <CardHeader>
            <CardTitle>Hover me</CardTitle>
          </CardHeader>
          <CardBody>
            The card lifts and the media zooms behind the fade.
          </CardBody>
        </Card>
      </RendersDemoCard>
      <RendersDemoCard label="scrim, sheen">
        <Card>
          <CardMedia fade="scrim" hover="sheen" ratio="still">
            <div className="size-full bg-linear-to-br from-amber-300 via-orange-500 to-rose-600" />
            <CardMediaOverlay placement="bottom-left" className="right-3">
              <div className="flex flex-col items-start gap-0.5 text-white">
                <span className="text-xs text-white/70">Feature</span>
                <span className="text-base font-semibold">Text over media</span>
              </div>
            </CardMediaOverlay>
          </CardMedia>
        </Card>
      </RendersDemoCard>
      <RendersDemoCard label="side fade">
        <Card>
          <CardMedia position="left" fade="edge">
            <div className="size-full bg-linear-to-br from-violet-500 to-blue-500" />
          </CardMedia>
          <CardMain className="justify-center">
            <CardHeader>
              <CardTitle>Soft edge</CardTitle>
            </CardHeader>
            <CardBody>Side media fades toward the text.</CardBody>
          </CardMain>
        </Card>
      </RendersDemoCard>
      <RendersDemoCard label="glow">
        <Card effect="glow">
          <CardHeader>
            <CardTitle>Glow</CardTitle>
          </CardHeader>
          <CardBody>
            A gradient border and colored shadow fade in on hover.
          </CardBody>
        </Card>
      </RendersDemoCard>
      <RendersDemoCard label="gradient border, color on hover">
        <Card effect="gradient">
          <CardMedia inset hover="color">
            <div className="size-full bg-linear-to-br from-fuchsia-500 via-sky-400 to-lime-300" />
          </CardMedia>
          <CardHeader>
            <CardTitle>Gradient border</CardTitle>
          </CardHeader>
          <CardBody>
            Media starts grayscale and fills with color on hover.
          </CardBody>
        </Card>
      </RendersDemoCard>
      <RendersDemoCard label="title, meta">
        <Card title="Contract 1001" meta="Client #708 · 3 open items">
          <CardBody>Shorthand props render the header for you.</CardBody>
        </Card>
      </RendersDemoCard>
      <RendersDemoCard label="appearance outline">
        <Card appearance="outline" title="Outline" meta="Border only" />
      </RendersDemoCard>
      <RendersDemoCard label="appearance muted">
        <Card appearance="muted" title="Muted" meta="Filled, no border" />
      </RendersDemoCard>
      <RendersDemoCard label="appearance elevated">
        <Card appearance="elevated" title="Elevated" meta="Shadow, no border" />
      </RendersDemoCard>
      <RendersDemoCard label="padding none">
        <Card padding="none" title="No padding">
          <CardBody>Content touches the border.</CardBody>
        </Card>
      </RendersDemoCard>
      <RendersDemoCard label="padding sm">
        <Card padding="sm" title="Small padding" meta="12px all round" />
      </RendersDemoCard>
      <RendersDemoCard label="padding lg">
        <Card padding="lg" title="Large padding" meta="24px all round" />
      </RendersDemoCard>
      <RendersDemoCard label="interactive">
        <Card interactive title="Open job 1002" meta="Renders as a button" />
      </RendersDemoCard>
      <RendersDemoCard label="interactive href">
        <Card
          interactive
          href="#card"
          title="Go to reports"
          meta="Renders as a link"
        />
      </RendersDemoCard>
      <RendersDemoCard label="source icon">
        <Card effect="lift">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <GlobeIcon className="size-3.5" />
              </span>
              <CardMeta className="min-w-0 flex-1">
                <span className="block truncate text-sm text-foreground">
                  grammarhub.dev
                </span>
              </CardMeta>
              <Button iconOnly size="sm" tone="ghost" aria-label="More">
                <MoreVerticalIcon className="size-4" />
              </Button>
            </div>
          </CardHeader>
          <CardTitle>
            <span className="block text-lg leading-snug font-medium">
              Reorder vs Re-order: Which Is Correct?
            </span>
          </CardTitle>
          <CardBody>
            <p className="line-clamp-2">
              An easy grammar guide. &ldquo;Reorder&rdquo; is the standard
              spelling; the hyphen only shows up in older style guides and
              regional usage.
            </p>
          </CardBody>
        </Card>
      </RendersDemoCard>
      <RendersDemoCard label="thumbnail">
        <Card>
          <CardThumbnail>
            <div className="size-full bg-linear-to-br from-orange-400 to-rose-500" />
          </CardThumbnail>
          <CardMain>
            <CardHeader>
              <CardTitle>Typography</CardTitle>
            </CardHeader>
            <CardBody>A small image beside the content.</CardBody>
          </CardMain>
        </Card>
      </RendersDemoCard>
    </>
  )
}
