"use client"

import { Accordion, StandardText, Table } from "@/components/standard/accordion"
import { Avatar } from "@/components/standard/avatar"
import { BarStack } from "@/components/standard/bar-stack"
import { Button } from "@/components/standard/button"
import { Card, CardBody, CardFooter, CardTitle } from "@/components/standard/card"
import { BentoGrid, CardBar, StandardCard } from "@/components/standard/card-bar"
import { Carousel } from "@/components/standard/carousel"
import { Chart } from "@/components/standard/chart"
import { Progress } from "@/components/standard/progress"
import { Resizable } from "@/components/standard/resizable"
import { Divider } from "@/components/standard/divider"
import { Row } from "@/components/standard/row"
import { Stack } from "@/components/standard/stack"
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
            <CardTitle>Registry item</CardTitle>
            <CardBody>A heading you can install.</CardBody>
            <CardFooter>
              <Button size="sm">Add</Button>
            </CardFooter>
          </Card>
        </RendersDemoCard>
        <RendersDemoCard label="body only">
          <Card>
            <CardBody>Classic stays shadcn. Standard stays yours.</CardBody>
          </Card>
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Card Bar" || pieceName === "Card Bars" || pieceName === "Card List") {
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

  if (pieceName === "Bento Grid") {
    return (
      <>
        <RendersDemoCard>
          <BentoGrid className="w-full">
            <CardBar title="Hours" />
            <CardBar title="Cost" />
            <CardBar title="Jobs" />
            <CardBar title="Crew" />
          </BentoGrid>
        </RendersDemoCard>
      </>
    )
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
            items={[{ id: "faq", title: "What is this?", body: "A collapsible panel." }]}
          />
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Carousel") {
    return (
      <RendersDemoCard className="w-full max-w-xl" label="Carousel">
        <Carousel slides={["Hours", "Cost", "Crew"]} />
      </RendersDemoCard>
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

  if (pieceName === "Sticky Table") {
    return <RendersStandardTableDemo mode="sticky" />
  }

  if (pieceName === "Standard Table Row Actions Menu") {
    return <RendersStandardTableDemo mode="actions" />
  }

  if (pieceName === "Standard Grid") {
    return <RendersStandardGridDemo />
  }

  if (pieceName === "Standard Hybrid" || pieceName === "Renders Standard Hybrid Pagination Footer") {
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

  if (
    pieceName === "Standard Text" ||
    pieceName === "Standard Cell Text" ||
    pieceName === "Math" ||
    pieceName === "Vacation Hours Display" ||
    pieceName === "Standard Date Format"
  ) {
    const sample =
      pieceName === "Standard Date Format"
        ? "Sep 22, 2026"
        : pieceName === "Vacation Hours Display" || pieceName === "Math"
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
