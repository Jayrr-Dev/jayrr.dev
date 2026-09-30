"use client"

import { Accordion, StandardText, Table } from "@/components/standard/accordion"
import { Avatar } from "@/components/standard/avatar"
import { BarStack } from "@/components/standard/bar-stack"
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
  CardRight,
  CardThumbnail,
  CardTitle,
} from "@/components/standard/card"
import { BentoGrid } from "@/components/standard/bento-grid"
import { CardBar, StandardCard } from "@/components/standard/card-bar"
import { Carousel } from "@/components/standard/carousel"
import { Chart } from "@/components/standard/chart"
import { Progress } from "@/components/standard/progress"
import { Resizable } from "@/components/standard/resizable"
import { Divider } from "@/components/standard/divider"
import { Math as MathFormula } from "@/components/ui/math"
import { Row } from "@/components/standard/row"
import { Stack } from "@/components/standard/stack"
import { ChevronRightIcon, ClockIcon, PlayIcon } from "lucide-react"
import { RendersStandardArticleDemo } from "@/features/standard-library/components/demos/rendersStandardArticleDemo"
import { RendersStandardAppGridDemo } from "@/features/standard-library/components/demos/rendersStandardAppGridDemo"
import { RendersStandardBentoGridDemo } from "@/features/standard-library/components/demos/rendersStandardBentoGridDemo"
import { RendersStandardDataGridDemo } from "@/features/standard-library/components/demos/rendersStandardDataGridDemo"
import {
  RendersStandardGridDemo,
  RendersStandardHybridDemo,
  RendersStandardTableDemo,
} from "@/features/standard-library/components/demos/rendersStandardTableGridDemo"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersStandardContentDemo({
  pieceName,
}: {
  pieceName: string
}) {
  if (pieceName === "Card") {
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
              <CardMediaOverlay
                placement="bottom-left"
                className="right-3 flex-col items-start gap-0.5 text-white"
              >
                <span className="text-xs text-white/70">Feature</span>
                <span className="text-base font-semibold">Text over media</span>
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

  if (
    pieceName === "Card Bar" ||
    pieceName === "Card Bars" ||
    pieceName === "Card List"
  ) {
    return (
      <>
        <RendersDemoCard>
          <CardBar title="Timesheets" description="Hours for this week" />
        </RendersDemoCard>
        <RendersDemoCard label="stack">
          <Stack className="w-full">
            <CardBar title="Jobs" description="Open work" />
            <CardBar title="Crew" description="Who is on site" />
          </Stack>
        </RendersDemoCard>
        <RendersDemoCard label="icon left">
          <CardBar
            title="Timesheets"
            description="Hours for this week"
            icon={<ClockIcon />}
          />
        </RendersDemoCard>
        <RendersDemoCard label="icon right">
          <CardBar
            title="Timesheets"
            description="Hours for this week"
            icon={<ChevronRightIcon />}
            iconPosition="right"
          />
        </RendersDemoCard>
        <RendersDemoCard label="auto size">
          <Stack className="w-full">
            <CardBar
              autoSize
              title="Timesheets"
              description="Hours for this week"
              icon={<ClockIcon />}
            />
            <CardBar
              autoSize
              title="Site photos"
              description="12 uploads from today"
              image={
                <span className="block size-full bg-linear-to-br from-muted to-border" />
              }
            />
          </Stack>
        </RendersDemoCard>
        <RendersDemoCard label="image left">
          <CardBar
            title="Site photos"
            description="12 uploads from today"
            image={
              <span className="block size-full bg-linear-to-br from-muted to-border" />
            }
          />
        </RendersDemoCard>
        <RendersDemoCard label="image right">
          <CardBar
            title="Site photos"
            description="12 uploads from today"
            imagePosition="right"
            image={
              <span className="block size-full bg-linear-to-br from-muted to-border" />
            }
          />
        </RendersDemoCard>
      </>
    )
  }

  if (
    pieceName === "Standard Card" ||
    pieceName === "Standard Card Chrome" ||
    pieceName === "App Cards Layout" ||
    pieceName === "Card Header Image"
  ) {
    return (
      <>
        <RendersDemoCard>
          <StandardCard title="Contract 1001" meta="Client #708">
            Open items: 3
          </StandardCard>
        </RendersDemoCard>
        <RendersDemoCard label="no meta">
          <StandardCard title="Job 1002">Ready to bill.</StandardCard>
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Article") {
    return <RendersStandardArticleDemo />
  }

  if (pieceName === "Bento Grid") {
    return <RendersStandardBentoGridDemo />
  }

  if (pieceName === "App Grid") {
    return <RendersStandardAppGridDemo />
  }

  if (pieceName === "Progress") {
    return (
      <>
        <RendersDemoCard>
          <Progress value={25} className="w-full" />
        </RendersDemoCard>
        <RendersDemoCard label="value 70">
          <Progress value={70} className="w-full" />
        </RendersDemoCard>
        <RendersDemoCard label="value 100">
          <Progress value={100} className="w-full" />
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Bar Stack") {
    return (
      <>
        <RendersDemoCard>
          <BarStack
            className="w-full"
            segments={[
              { id: "a", value: 40, className: "bg-primary" },
              { id: "b", value: 25, className: "bg-muted-foreground/50" },
              { id: "c", value: 15, className: "bg-destructive" },
            ]}
          />
        </RendersDemoCard>
        <RendersDemoCard label="two segments">
          <BarStack
            className="w-full"
            segments={[
              { id: "billable", value: 8, className: "bg-primary" },
              { id: "other", value: 2, className: "bg-muted-foreground/40" },
            ]}
          />
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Chart") {
    return (
      <RendersDemoCard className="w-full max-w-xl" label="Chart">
        <Chart
          data={[
            { name: "Mon", value: 8 },
            { name: "Tue", value: 5 },
            { name: "Wed", value: 6 },
          ]}
        />
      </RendersDemoCard>
    )
  }

  if (pieceName === "Accordion") {
    return (
      <>
        <RendersDemoCard>
          <Accordion
            items={[
              { id: "one", title: "Hours", body: "Billable vs non-billable." },
              { id: "two", title: "Cost", body: "Labor and equipment." },
            ]}
          />
        </RendersDemoCard>
        <RendersDemoCard label="one item">
          <Accordion
            items={[
              {
                id: "faq",
                title: "What is this?",
                body: "A collapsible panel.",
              },
            ]}
          />
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Carousel") {
    return (
      <>
        <RendersDemoCard className="w-full max-w-xl" label="Carousel">
          <Carousel slides={["Hours", "Cost", "Crew"]} />
        </RendersDemoCard>
        <RendersDemoCard
          className="w-full max-w-xl"
          label='variant "multi-browse"'
        >
          <Carousel
            variant="multi-browse"
            slides={["Family", "Festivals", "Plants", "Travel", "Food", "Pets"]}
          />
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Resizable") {
    return (
      <RendersDemoCard className="w-full max-w-xl" label="Resizable">
        <Resizable />
      </RendersDemoCard>
    )
  }

  if (pieceName === "Separator") {
    return (
      <>
        <RendersDemoCard>
          <Stack className="w-full">
            <StandardText>Above</StandardText>
            <Divider />
            <StandardText>Below</StandardText>
          </Stack>
        </RendersDemoCard>
        <RendersDemoCard label="orientation vertical">
          <Row className="h-8">
            <StandardText>Left</StandardText>
            <Divider orientation="vertical" />
            <StandardText>Right</StandardText>
          </Row>
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Standard Table") {
    return <RendersStandardTableDemo />
  }

  if (pieceName === "Data Grid") {
    return <RendersStandardDataGridDemo />
  }

  if (pieceName === "Sticky Table") {
    return <RendersStandardTableDemo mode="sticky" />
  }

  if (pieceName === "Standard Table Row Actions Menu") {
    return <RendersStandardTableDemo mode="actions" />
  }

  if (pieceName === "Standard Grid") {
    return <RendersStandardGridDemo />
  }

  if (
    pieceName === "Standard Hybrid" ||
    pieceName === "Renders Standard Hybrid Pagination Footer"
  ) {
    return <RendersStandardHybridDemo />
  }

  if (pieceName === "Table") {
    return (
      <>
        <RendersDemoCard className="w-full max-w-xl">
          <Table
            headers={["Job", "Hours", "Status"]}
            rows={[
              ["1001", "8.0", "Open"],
              ["1002", "4.5", "Hold"],
            ]}
          />
        </RendersDemoCard>
        <RendersDemoCard label="one row" className="w-full max-w-xl">
          <Table headers={["Name"]} rows={[["Jayrr"]]} />
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Math") {
    return (
      <>
        <RendersDemoCard label="display · quadratic formula">
          <MathFormula display tex={String.raw`x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}`} />
        </RendersDemoCard>
        <RendersDemoCard label="display · gaussian integral">
          <MathFormula display tex={String.raw`\int_0^{\infty} e^{-x^2}\,dx = \frac{\sqrt{\pi}}{2}`} />
        </RendersDemoCard>
        <RendersDemoCard label="display · series">
          <MathFormula display tex={String.raw`\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}`} />
        </RendersDemoCard>
        <RendersDemoCard label="display · matrix">
          <MathFormula
            display
            tex={String.raw`\det \begin{bmatrix} a & b \\ c & d \end{bmatrix} = ad - bc`}
          />
        </RendersDemoCard>
        <RendersDemoCard label="inline">
          <p className="text-sm">
            Euler&apos;s identity <MathFormula tex={String.raw`e^{i\pi} + 1 = 0`} /> ties
            together five constants, and <MathFormula tex={String.raw`E = mc^2`} /> fits
            in a sentence.
          </p>
        </RendersDemoCard>
        <RendersDemoCard label="invalid tex · shown in red">
          <MathFormula display tex={String.raw`\frac{1}{`} />
        </RendersDemoCard>
      </>
    )
  }

  if (
    pieceName === "Standard Text" ||
    pieceName === "Standard Cell Text" ||
    pieceName === "Vacation Hours Display" ||
    pieceName === "Standard Date Format"
  ) {
    const sample =
      pieceName === "Standard Date Format"
        ? "Sep 22, 2026"
        : pieceName === "Vacation Hours Display"
          ? "8.0 h"
          : "Sep 22, 2026 · 8.0 h"
    return (
      <>
        <RendersDemoCard label="Standard text">
          <StandardText>{sample}</StandardText>
        </RendersDemoCard>
        <RendersDemoCard label="muted">
          <StandardText className="text-muted-foreground">
            Remaining 12.0 h
          </StandardText>
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Avatar") {
    return (
      <>
        <RendersDemoCard>
          <Avatar>JR</Avatar>
        </RendersDemoCard>
        <RendersDemoCard label="size sm">
          <Avatar size="sm">AL</Avatar>
        </RendersDemoCard>
        <RendersDemoCard label="size lg">
          <Avatar size="lg">MK</Avatar>
        </RendersDemoCard>
      </>
    )
  }

  return (
    <RendersDemoCard label="Not built">
      <p className="text-xs text-muted-foreground">
        {pieceName} is not a Standard primitive yet.
      </p>
    </RendersDemoCard>
  )
}
