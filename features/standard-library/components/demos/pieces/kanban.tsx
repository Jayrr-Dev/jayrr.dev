"use client"

import { useState } from "react"

import { Kanban, type KanbanColumn } from "@/components/standard/kanban"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const BOARD: KanbanColumn[] = [
  {
    id: "todo",
    title: "To do",
    color: "var(--color-muted-foreground)",
    cards: [
      { id: "c1", title: "Export timesheets", description: "CSV for payroll", tags: ["payroll"] },
      { id: "c2", title: "Fix overtime rounding", tags: ["bug"] },
      { id: "c3", title: "Draft onboarding email" },
    ],
  },
  {
    id: "doing",
    title: "In progress",
    color: "#0ea5e9",
    limit: 3,
    cards: [
      { id: "c4", title: "Offline sync", description: "Queue edits while offline", tags: ["mobile"] },
      { id: "c5", title: "Job picker search" },
    ],
  },
  {
    id: "review",
    title: "Review",
    color: "#f59e0b",
    cards: [],
  },
  {
    id: "done",
    title: "Done",
    color: "#10b981",
    cards: [{ id: "c6", title: "Dark mode", tags: ["ui"] }],
  },
]

export function RendersKanbanDemo() {
  const [columns, setColumns] = useState(BOARD)
  const [count, setCount] = useState(7)

  return (
    <RendersDemoCard label="Kanban · limit 3 on In progress" fill>
      <Kanban
        columns={columns}
        onColumnsChange={setColumns}
        onAddCard={(columnId) => {
          setColumns((current) =>
            current.map((column) =>
              column.id === columnId
                ? {
                    ...column,
                    cards: [...column.cards, { id: `c${count}`, title: `New card ${count}` }],
                  }
                : column
            )
          )
          setCount(count + 1)
        }}
      />
    </RendersDemoCard>
  )
}
