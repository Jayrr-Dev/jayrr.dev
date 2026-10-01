"use client"

import { useState } from "react"

import { NumberInput } from "@/components/standard/number-input"
import {
  createGridData,
  Spreadsheet,
  type SpreadsheetResults,
} from "@/components/standard/spreadsheet"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const BUDGET = createGridData({
  columns: [
    { label: "Item", width: 160 },
    { label: "Qty", type: "number", width: 80 },
    { label: "Unit price", type: "number", width: 110 },
    { label: "Line total", type: "number", width: 120 },
    { label: "Share", type: "number", width: 100 },
    { width: 120 },
  ],
  rows: [
    ["Laptop stand", 2, 49.99, "=B1*C1", "=D1/$D$7"],
    ["USB-C hub", 3, 34.5, "=B2*C2", "=D2/$D$7"],
    ["Monitor", 1, 219, "=B3*C3", "=D3/$D$7"],
    ["Desk lamp", 2, 27.25, "=B4*C4", "=D4/$D$7"],
    ["Cables", 6, 8.99, "=B5*C5", "=D5/$D$7"],
    [],
    ["Total", "=SUM(B1:B5)", null, "=SUM(D1:D5)", "=SUM(E1:E5)"],
    ["Tax", null, null, "=ROUND(D7 * taxRate, 2)"],
    [
      "Grand total",
      null,
      null,
      "=D7 + D8",
      '=IF(D9 > budget, "Over budget", "OK")',
    ],
    ["Priciest", null, null, "=MAX(C1:C5)"],
  ],
})

function RendersBudgetCard() {
  const [taxRate, setTaxRate] = useState(0.0825)
  const [budget, setBudget] = useState(600)
  const [grand, setGrand] = useState<string>("")

  const readsGrandTotal = (results: SpreadsheetResults) => {
    const result = results.D9
    setGrand(
      result?.status === "ok"
        ? String(result.value)
        : result?.status === "error"
          ? result.error.code
          : ""
    )
  }

  return (
    <section className="flex w-full min-w-0 flex-col gap-3">
      <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        formulas · ranges · named values
      </h3>
      <div className="flex w-full min-w-0 flex-col gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-28">
            <NumberInput
              label="taxRate"
              value={taxRate}
              onChange={setTaxRate}
              compact
            />
          </div>
          <div className="w-28">
            <NumberInput
              label="budget"
              value={budget}
              onChange={setBudget}
              compact
            />
          </div>
          <p className="ml-auto font-mono text-xs text-muted-foreground tabular-nums">
            onResults → D9 = {grand}
          </p>
        </div>
        <Spreadsheet
          defaultValue={BUDGET}
          variables={{ taxRate, budget }}
          headerMode="both"
          autoFitButton
          height={380}
          formatResult={(value) =>
            typeof value === "number"
              ? value.toLocaleString("en-US", { maximumFractionDigits: 4 })
              : String(value)
          }
          onResults={readsGrandTotal}
          label="Office budget"
        />
        <p className="text-xs text-muted-foreground">
          Double-click a total to see its formula; type <code>=</code> in any
          cell to write one. Change a Qty and every total follows. Drag a line
          total&apos;s fill handle down and its references move with it, while{" "}
          <code>$D$7</code> stays pinned.
        </p>
      </div>
    </section>
  )
}

const SCRATCH = createGridData({
  columns: 6,
  rows: [
    [10, 20, "=A1+B1", "=C1*2"],
    [5, 0, "=A2/B2", "=IFERROR(C2, 0)"],
    ["=A1", "=B1", "=A3+B3+C3", ""],
    ["=D4", "", "", "=A4"],
    ['="Hello, " & "sheet"', "=LEN(A5)", "=UPPER(A5)"],
  ],
})

function RendersScratchCard() {
  return (
    <section className="flex w-full min-w-0 flex-col gap-3">
      <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        errors · circular references · text
      </h3>
      <Spreadsheet
        defaultValue={SCRATCH}
        height={240}
        className="w-full"
        label="Scratch sheet"
      />
    </section>
  )
}

const WORKBOOK = [
  {
    id: "q1",
    name: "Q1",
    data: createGridData({
      columns: [
        { label: "Month", width: 120 },
        { label: "Sales", type: "number", width: 110 },
        { width: 110 },
      ],
      rows: [
        ["Jan", 1200],
        ["Feb", 1350],
        ["Mar", 1610],
        [],
        ["Total", "=SUM(B1:B3)"],
      ],
    }),
  },
  {
    id: "q2",
    name: "Q2",
    data: createGridData({
      columns: [
        { label: "Month", width: 120 },
        { label: "Sales", type: "number", width: 110 },
        { width: 110 },
      ],
      rows: [
        ["Apr", 1480],
        ["May", 1720],
        ["Jun", 1905],
        [],
        ["Total", "=SUM(B1:B3)"],
      ],
    }),
  },
]

function RendersWorkbookCard() {
  return (
    <section className="flex w-full min-w-0 flex-col gap-3">
      <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        sheet tabs · footer
      </h3>
      <Spreadsheet
        defaultSheets={WORKBOOK}
        height={220}
        className="w-full"
        label="Sales workbook"
      />
      <p className="text-xs text-muted-foreground">
        Click a tab to switch sheets, or Ctrl+PageUp / PageDown. Double-click a
        tab to rename it, + adds a sheet, and × removes one.
      </p>
    </section>
  )
}

export function RendersSpreadsheetDemo() {
  return (
    // One card, so the gallery gives the sheets its full width.
    <RendersDemoCard fill>
      <div className="flex w-full min-w-0 flex-col gap-8 py-1">
        <RendersBudgetCard />
        <RendersScratchCard />
        <RendersWorkbookCard />
      </div>
    </RendersDemoCard>
  )
}
