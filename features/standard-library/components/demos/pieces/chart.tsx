"use client"

import { Chart } from "@/components/standard/chart"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersChartDemo() {
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
