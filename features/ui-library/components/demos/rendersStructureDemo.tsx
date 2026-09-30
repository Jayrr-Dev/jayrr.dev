"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Row } from "@/components/standard/row"
import { Stack } from "@/components/standard/stack"

import { RendersDemoCard } from "./rendersDemoCard"

export function RendersStructureDemo({
  pieceName,
}: {
  pieceName: string
}) {
  if (pieceName === "Separator") {
    return (
      <>
        <RendersDemoCard>
          <div className="flex w-full flex-col gap-3">
            <p className="text-sm">Above</p>
            <Separator />
            <p className="text-sm">Below</p>
          </div>
        </RendersDemoCard>
        <RendersDemoCard>
          <div className="flex h-8 items-center gap-3 text-sm">
            <span>Left</span>
            <Separator orientation="vertical" />
            <span>Right</span>
          </div>
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Stack") {
    return (
      <>
        <RendersDemoCard>
          <Stack className="w-full">
            <Button variant="outline">First</Button>
            <Button variant="outline">Second</Button>
            <Button variant="outline">Third</Button>
          </Stack>
        </RendersDemoCard>
        <RendersDemoCard label="row">
          <Row className="w-full">
            <Button variant="outline">One</Button>
            <Button variant="outline">Two</Button>
            <Button>Go</Button>
          </Row>
        </RendersDemoCard>
        <RendersDemoCard label="direction row">
          <Stack direction="row">
            <Button variant="outline">One</Button>
            <Button variant="outline">Two</Button>
            <Button variant="outline">Three</Button>
          </Stack>
        </RendersDemoCard>
        <RendersDemoCard label="gap">
          <Stack gap="md" className="w-full">
            {(["none", "xs", "sm", "md", "lg", "xl"] as const).map((gap) => (
              <Stack key={gap} direction="row" align="center" gap={gap}>
                <span className="w-8 text-xs text-muted-foreground">{gap}</span>
                <span className="size-5 rounded bg-primary/70" />
                <span className="size-5 rounded bg-primary/70" />
                <span className="size-5 rounded bg-primary/70" />
              </Stack>
            ))}
          </Stack>
        </RendersDemoCard>
        <RendersDemoCard label="align">
          <Stack gap="md" className="w-full">
            {(["start", "center", "end", "stretch", "baseline"] as const).map(
              (align) => (
                <Stack
                  key={align}
                  direction="row"
                  align={align}
                  className="h-12 rounded-md border border-dashed border-border p-1"
                >
                  <span className="w-16 self-center text-xs text-muted-foreground">
                    {align}
                  </span>
                  <span className="min-h-4 w-6 rounded bg-primary/70" />
                  <span className="min-h-7 w-6 rounded bg-primary/70" />
                  <span className="min-h-5 w-6 rounded bg-primary/70" />
                </Stack>
              )
            )}
          </Stack>
        </RendersDemoCard>
        <RendersDemoCard label="justify">
          <Stack gap="md" className="w-full">
            {(
              ["start", "center", "end", "between", "around", "evenly"] as const
            ).map((justify) => (
              <Stack
                key={justify}
                direction="row"
                justify={justify}
                className="relative rounded-md border border-dashed border-border p-1"
              >
                <span className="size-5 rounded bg-primary/70" />
                <span className="size-5 rounded bg-primary/70" />
                <span className="size-5 rounded bg-primary/70" />
                <span className="absolute top-1/2 right-2 -translate-y-1/2 text-xs text-muted-foreground">
                  {justify}
                </span>
              </Stack>
            ))}
          </Stack>
        </RendersDemoCard>
        <RendersDemoCard label="wrap">
          <Stack direction="row" wrap className="w-48">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <Button key={day} variant="outline" size="sm">
                {day}
              </Button>
            ))}
          </Stack>
        </RendersDemoCard>
        <RendersDemoCard label="divider">
          <Stack direction="row" align="center" gap="md" divider className="h-8">
            <span className="text-sm">Jobs</span>
            <span className="text-sm">Hours</span>
            <span className="text-sm">Rates</span>
          </Stack>
          <Stack divider className="mt-3 w-full">
            <span className="text-sm">Monday</span>
            <span className="text-sm">Tuesday</span>
            <span className="text-sm">Wednesday</span>
          </Stack>
        </RendersDemoCard>
      </>
    )
  }

  return null
}
