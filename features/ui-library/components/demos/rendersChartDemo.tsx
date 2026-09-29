"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  XAxis,
  YAxis,
} from "recharts"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

import { RendersDemoCard } from "./rendersDemoCard"

const weekData = [
  { name: "Mon", visits: 4, signups: 2 },
  { name: "Tue", visits: 7, signups: 3 },
  { name: "Wed", visits: 5, signups: 4 },
  { name: "Thu", visits: 9, signups: 5 },
  { name: "Fri", visits: 6, signups: 3 },
]

const shareData = [
  { name: "search", value: 45, fill: "var(--color-search)" },
  { name: "direct", value: 30, fill: "var(--color-direct)" },
  { name: "social", value: 25, fill: "var(--color-social)" },
]

const skillData = [
  { skill: "Speed", score: 80 },
  { skill: "Reach", score: 65 },
  { skill: "Depth", score: 90 },
  { skill: "Polish", score: 70 },
  { skill: "Focus", score: 55 },
]

const seriesConfig = {
  visits: { label: "Visits", color: "var(--chart-1)" },
  signups: { label: "Signups", color: "var(--chart-2)" },
} satisfies ChartConfig

const shareConfig = {
  search: { label: "Search", color: "var(--chart-1)" },
  direct: { label: "Direct", color: "var(--chart-2)" },
  social: { label: "Social", color: "var(--chart-3)" },
} satisfies ChartConfig

const skillConfig = {
  score: { label: "Score", color: "var(--chart-1)" },
} satisfies ChartConfig

const chartClass = "h-32 w-full"

const chartDemos: { label: string; node: React.ReactNode }[] = [
  {
    label: "Bar",
    node: (
      <ChartContainer config={seriesConfig} className={chartClass}>
        <BarChart data={weekData}>
          <Bar dataKey="visits" fill="var(--color-visits)" radius={4} />
        </BarChart>
      </ChartContainer>
    ),
  },
  {
    label: "Grouped bar",
    node: (
      <ChartContainer config={seriesConfig} className={chartClass}>
        <BarChart data={weekData}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="name" tickLine={false} axisLine={false} />
          <Bar dataKey="visits" fill="var(--color-visits)" radius={3} />
          <Bar dataKey="signups" fill="var(--color-signups)" radius={3} />
        </BarChart>
      </ChartContainer>
    ),
  },
  {
    label: "Stacked bar",
    node: (
      <ChartContainer config={seriesConfig} className={chartClass}>
        <BarChart data={weekData}>
          <XAxis dataKey="name" tickLine={false} axisLine={false} />
          <Bar dataKey="visits" stackId="a" fill="var(--color-visits)" />
          <Bar
            dataKey="signups"
            stackId="a"
            fill="var(--color-signups)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    ),
  },
  {
    label: "Horizontal bar",
    node: (
      <ChartContainer config={seriesConfig} className={chartClass}>
        <BarChart data={weekData} layout="vertical">
          <YAxis
            dataKey="name"
            type="category"
            tickLine={false}
            axisLine={false}
          />
          <XAxis type="number" hide />
          <Bar dataKey="visits" fill="var(--color-visits)" radius={4} />
        </BarChart>
      </ChartContainer>
    ),
  },
  {
    label: "Line",
    node: (
      <ChartContainer config={seriesConfig} className={chartClass}>
        <LineChart data={weekData}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="name" tickLine={false} axisLine={false} />
          <Line
            dataKey="visits"
            type="monotone"
            stroke="var(--color-visits)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    ),
  },
  {
    label: "Multi-line with legend",
    node: (
      <ChartContainer config={seriesConfig} className="h-36 w-full">
        <LineChart data={weekData}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="name" tickLine={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            dataKey="visits"
            type="monotone"
            stroke="var(--color-visits)"
            strokeWidth={2}
          />
          <Line
            dataKey="signups"
            type="monotone"
            stroke="var(--color-signups)"
            strokeWidth={2}
          />
          <ChartLegend content={<ChartLegendContent />} />
        </LineChart>
      </ChartContainer>
    ),
  },
  {
    label: "Area",
    node: (
      <ChartContainer config={seriesConfig} className={chartClass}>
        <AreaChart data={weekData}>
          <XAxis dataKey="name" tickLine={false} axisLine={false} />
          <Area
            dataKey="visits"
            type="natural"
            fill="var(--color-visits)"
            fillOpacity={0.35}
            stroke="var(--color-visits)"
          />
        </AreaChart>
      </ChartContainer>
    ),
  },
  {
    label: "Stacked area",
    node: (
      <ChartContainer config={seriesConfig} className={chartClass}>
        <AreaChart data={weekData}>
          <XAxis dataKey="name" tickLine={false} axisLine={false} />
          <Area
            dataKey="signups"
            type="natural"
            stackId="a"
            fill="var(--color-signups)"
            fillOpacity={0.4}
            stroke="var(--color-signups)"
          />
          <Area
            dataKey="visits"
            type="natural"
            stackId="a"
            fill="var(--color-visits)"
            fillOpacity={0.4}
            stroke="var(--color-visits)"
          />
        </AreaChart>
      </ChartContainer>
    ),
  },
  {
    label: "Pie",
    node: (
      <ChartContainer config={shareConfig} className={chartClass}>
        <PieChart>
          <Pie data={shareData} dataKey="value" nameKey="name" />
        </PieChart>
      </ChartContainer>
    ),
  },
  {
    label: "Donut",
    node: (
      <ChartContainer config={shareConfig} className={chartClass}>
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          <Pie
            data={shareData}
            dataKey="value"
            nameKey="name"
            innerRadius={28}
            strokeWidth={4}
          />
        </PieChart>
      </ChartContainer>
    ),
  },
  {
    label: "Radar",
    node: (
      <ChartContainer config={skillConfig} className={chartClass}>
        <RadarChart data={skillData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="skill" />
          <Radar
            dataKey="score"
            fill="var(--color-score)"
            fillOpacity={0.4}
            stroke="var(--color-score)"
          />
        </RadarChart>
      </ChartContainer>
    ),
  },
]

export function RendersChartDemo({ pieceName }: { pieceName: string }) {
  if (pieceName !== "Chart") {
    return null
  }

  return (
    <>
      {chartDemos.map((demo) => (
        <RendersDemoCard key={demo.label} label={demo.label}>
          {demo.node}
        </RendersDemoCard>
      ))}
    </>
  )
}
