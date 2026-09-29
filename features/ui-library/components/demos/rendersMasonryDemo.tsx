"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Masonry } from "@/components/ui/masonry"

import { RendersDemoCard } from "./rendersDemoCard"

// Varying heights so the columns stagger; numbers show left-to-right order.
const heights = ["h-10", "h-20", "h-14", "h-24", "h-8", "h-16", "h-12", "h-20", "h-10"]

function tiles(count: number) {
  return heights.slice(0, count).map((height, index) => (
    <Card key={index} size="sm">
      <CardHeader>
        <CardTitle>{index + 1}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`${height} rounded-md bg-muted`} />
      </CardContent>
    </Card>
  ))
}

export function RendersMasonryDemo({ pieceName }: { pieceName: string }) {
  if (pieceName !== "Masonry") {
    return null
  }

  return (
    <>
      <RendersDemoCard label="3 columns">
        <Masonry columns={3} className="w-full gap-2">
          {tiles(9)}
        </Masonry>
      </RendersDemoCard>
      <RendersDemoCard label="2 columns">
        <Masonry columns={2} className="w-full gap-2">
          {tiles(6)}
        </Masonry>
      </RendersDemoCard>
      <RendersDemoCard label="Responsive (min 120px)">
        <Masonry minColumnWidth={120} className="w-full gap-2">
          {tiles(7)}
        </Masonry>
      </RendersDemoCard>
    </>
  )
}
