"use client"

import { addDays, format } from "date-fns"

import { Gantt, type GanttTask } from "@/components/standard/gantt"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

/** "yyyy-MM-dd" a number of days from today, so today lands mid-project. */
const day = (offset: number) =>
  format(addDays(new Date(), offset), "yyyy-MM-dd")

/** A substation upgrade: done, running late, blocked, and not yet started. */
const SUBSTATION: GanttTask[] = [
  { id: "1.0", name: "Engineering" },
  {
    id: "1.1",
    parent: "1.0",
    name: "Site survey",
    assignee: "R. Ortiz",
    progress: 100,
    planStart: day(-62),
    planDays: 8,
    actualStart: day(-62),
    actualEnd: day(-54),
  },
  {
    id: "1.2",
    parent: "1.0",
    name: "Single-line diagram",
    assignee: "M. Chen",
    progress: 100,
    planStart: day(-53),
    planDays: 12,
    actualStart: day(-51),
    actualEnd: day(-36),
    dependsOn: ["1.1"],
  },
  {
    id: "1.3",
    parent: "1.0",
    name: "Protection settings",
    assignee: "M. Chen",
    progress: 60,
    planStart: day(-38),
    planDays: 21,
    actualStart: day(-30),
    forecastEnd: day(-3),
    dependsOn: ["1.2"],
  },
  {
    id: "1.4",
    parent: "1.0",
    name: "IFC drawings issued",
    milestone: true,
    progress: 0,
    planEnd: day(-4),
    dependsOn: ["1.3"],
  },
  { id: "2.0", name: "Procurement" },
  {
    id: "2.1",
    parent: "2.0",
    name: "Transformer order",
    assignee: "J. Park",
    progress: 100,
    planStart: day(-45),
    planDays: 5,
    actualStart: day(-44),
    actualEnd: day(-40),
  },
  {
    id: "2.2",
    parent: "2.0",
    name: "Transformer delivery",
    assignee: "Vendor",
    progress: 45,
    planStart: day(-39),
    planDays: 56,
    actualStart: day(-39),
    dependsOn: ["2.1"],
  },
  {
    id: "2.3",
    parent: "2.0",
    name: "Switchgear delivery",
    assignee: "Vendor",
    progress: 30,
    planStart: day(-20),
    planDays: 35,
    actualStart: day(-14),
    forecastEnd: day(28),
  },
  {
    id: "3.0",
    name: "Construction",
    planStart: day(-7),
    planEnd: day(70),
  },
  {
    id: "3.1",
    parent: "3.0",
    name: "Civil & foundations",
    assignee: "Crew A",
    progress: 25,
    planStart: day(-7),
    planDays: 28,
    actualStart: day(-5),
    dependsOn: ["1.4"],
  },
  {
    id: "3.2",
    parent: "3.0",
    name: "Grounding grid",
    assignee: "Crew A",
    progress: 0,
    planStart: day(14),
    planDays: 14,
    dependsOn: ["3.1"],
  },
  {
    id: "3.3",
    parent: "3.0",
    name: "Set transformer",
    assignee: "Crew B",
    progress: 0,
    planStart: day(28),
    planDays: 7,
    dependsOn: ["2.2", "3.1"],
  },
  {
    id: "3.4",
    parent: "3.0",
    name: "Wiring & terminations",
    assignee: "Crew B",
    progress: 0,
    planStart: day(40),
    planDays: 42,
    dependsOn: ["3.3"],
  },
  { id: "4.0", name: "Commissioning" },
  {
    id: "4.1",
    parent: "4.0",
    name: "Relay testing",
    assignee: "M. Chen",
    progress: 0,
    planStart: day(84),
    planDays: 10,
    dependsOn: ["3.4"],
  },
  {
    id: "4.2",
    parent: "4.0",
    name: "Energization",
    milestone: true,
    progress: 0,
    planEnd: day(96),
    dependsOn: ["4.1"],
  },
]

/** A two-week sprint in days, finished and slipping side by side. */
const SPRINT: GanttTask[] = [
  { id: "1.0", name: "Sprint 14" },
  {
    id: "1.1",
    parent: "1.0",
    name: "Auth refresh",
    progress: 100,
    planStart: day(-6),
    planDays: 3,
    actualStart: day(-6),
    actualEnd: day(-4),
  },
  {
    id: "1.2",
    parent: "1.0",
    name: "Billing page",
    progress: 50,
    planStart: day(-4),
    planDays: 4,
    actualStart: day(-2),
    forecastEnd: day(3),
  },
  {
    id: "1.3",
    parent: "1.0",
    name: "Release",
    milestone: true,
    progress: 0,
    planEnd: day(5),
    dependsOn: ["1.2"],
  },
]

export function RendersStandardGanttDemo() {
  return (
    <div className="flex w-full flex-col gap-3">
      <RendersDemoCard label="substation upgrade · switch the scale, zoom, fold a phase, hover a row">
        <Gantt
          tasks={SUBSTATION}
          defaultMode="weekly"
          aria-label="Substation upgrade schedule"
        />
      </RendersDemoCard>
      <RendersDemoCard label="daily · actuals and forecast columns · no toolbar or legend">
        <Gantt
          tasks={SPRINT}
          mode="daily"
          toolbar={false}
          legend={false}
          padding={3}
          columns={["progress", "actual-start", "actual-end", "forecast-end"]}
          aria-label="Sprint schedule"
        />
      </RendersDemoCard>
    </div>
  )
}
