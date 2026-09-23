"use client"

import { Bar, BarChart, XAxis } from "recharts"

function Chart({
  data,
}: {
  data: { name: string; value: number }[]
}) {
  return (
    <div data-slot="chart" className="h-32 w-full text-primary">
      <BarChart width={280} height={128} data={data}>
        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
        <Bar dataKey="value" fill="currentColor" radius={4} />
      </BarChart>
    </div>
  )
}

export { Chart }
