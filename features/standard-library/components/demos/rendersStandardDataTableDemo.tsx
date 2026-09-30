"use client"

import { useState } from "react"
import { Trash2Icon } from "lucide-react"

import { Badge } from "@/components/standard/badge"
import { ButtonArray } from "@/components/standard/button-array"
import {
  createDataTableColumns,
  DataTable,
  type DataTableCellEdit,
} from "@/components/standard/data-table"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

type Payment = {
  id: string
  name: string
  email: string
  status: "Success" | "Processing" | "Failed"
  amount: number
}

const PAYMENTS: Payment[] = [
  {
    id: "p1",
    name: "Shang Chain",
    email: "shang07@yahoo.com",
    status: "Success",
    amount: 699,
  },
  {
    id: "p2",
    name: "Kevin Lincoln",
    email: "kevinli09@gmail.com",
    status: "Success",
    amount: 242,
  },
  {
    id: "p3",
    name: "Milton Rose",
    email: "rose96@gmail.com",
    status: "Processing",
    amount: 655,
  },
  {
    id: "p4",
    name: "Silas Ryan",
    email: "silas22@gmail.com",
    status: "Success",
    amount: 874,
  },
  {
    id: "p5",
    name: "Ben Tenison",
    email: "bent@hotmail.com",
    status: "Failed",
    amount: 541,
  },
  {
    id: "p6",
    name: "Ada Park",
    email: "ada.park@proton.me",
    status: "Processing",
    amount: 318,
  },
  {
    id: "p7",
    name: "Nia Holt",
    email: "nia@holt.dev",
    status: "Success",
    amount: 1290,
  },
  {
    id: "p8",
    name: "Omar Quist",
    email: "oquist@gmail.com",
    status: "Failed",
    amount: 76,
  },
  {
    id: "p9",
    name: "Rhea Stone",
    email: "rhea.s@yahoo.com",
    status: "Success",
    amount: 432,
  },
  {
    id: "p10",
    name: "Tomas Vale",
    email: "tvale@outlook.com",
    status: "Processing",
    amount: 905,
  },
  {
    id: "p11",
    name: "Uma Reyes",
    email: "uma@reyes.io",
    status: "Success",
    amount: 188,
  },
  {
    id: "p12",
    name: "Wes Kline",
    email: "wes.kline@gmail.com",
    status: "Failed",
    amount: 612,
  },
]

const STATUS_TONE: Record<Payment["status"], "default" | "quiet" | "danger"> = {
  Success: "default",
  Processing: "quiet",
  Failed: "danger",
}

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

const payment = createDataTableColumns<Payment>()

const PAYMENT_COLUMNS = payment.columns([
  payment.accessor("name", {
    header: "Name",
    size: 160,
    meta: { editable: "text" },
    cell: ({ getValue }) => <span className="font-medium">{getValue()}</span>,
  }),
  payment.accessor("status", {
    header: "Status",
    size: 130,
    meta: { filter: "select" },
    cell: ({ getValue }) => (
      <Badge tone={STATUS_TONE[getValue()]}>{getValue()}</Badge>
    ),
  }),
  payment.accessor("email", {
    header: "Email",
    size: 220,
    meta: { editable: "text" },
  }),
  payment.accessor("amount", {
    header: "Amount",
    size: 140,
    meta: { align: "end", editable: "number" },
    cell: ({ getValue }) => (
      <span className="tabular-nums">{money.format(getValue())}</span>
    ),
  }),
])

type Task = {
  id: string
  title: string
  owner: string
  hours: number
  subtasks?: Task[]
}

const TASKS: Task[] = [
  {
    id: "t1",
    title: "Website relaunch",
    owner: "Ada",
    hours: 64,
    subtasks: [
      {
        id: "t1-1",
        title: "Design system",
        owner: "Nia",
        hours: 24,
        subtasks: [
          { id: "t1-1-1", title: "Tokens", owner: "Nia", hours: 8 },
          { id: "t1-1-2", title: "Components", owner: "Omar", hours: 16 },
        ],
      },
      { id: "t1-2", title: "Content migration", owner: "Uma", hours: 40 },
    ],
  },
  {
    id: "t2",
    title: "Billing v2",
    owner: "Wes",
    hours: 52,
    subtasks: [
      { id: "t2-1", title: "Invoices", owner: "Wes", hours: 30 },
      { id: "t2-2", title: "Refunds", owner: "Rhea", hours: 22 },
    ],
  },
  { id: "t3", title: "Security review", owner: "Tomas", hours: 12 },
]

const task = createDataTableColumns<Task>()

const TASK_COLUMNS = task.columns([
  task.accessor("title", { header: "Task" }),
  task.accessor("owner", { header: "Owner" }),
  task.accessor("hours", {
    header: "Hours",
    meta: { align: "end" },
    cell: ({ getValue }) => <span className="tabular-nums">{getValue()}</span>,
  }),
])

const PANELS = [
  { id: "full", label: "Full" },
  { id: "basic", label: "Basic" },
  { id: "columns", label: "Columns" },
  { id: "tree", label: "Sub-rows" },
]

const PANEL_LABELS: Record<string, string> = {
  full: "search · select filter · selection · bulk actions · export · edit · pagination",
  basic: "sorting only",
  columns: "resizable · reorderable · pinnable · view options",
  tree: "getSubRows · selectable",
}

function editingPayments(rows: Payment[], edit: DataTableCellEdit<Payment>) {
  return rows.map((row) =>
    row.id === edit.rowId ? { ...row, [edit.columnId]: edit.value } : row
  )
}

export function RendersStandardDataTableDemo() {
  const [panel, setPanel] = useState("full")
  const [payments, setPayments] = useState(PAYMENTS)

  return (
    <RendersDemoCard
      className="w-full max-w-3xl"
      label={PANEL_LABELS[panel]}
      fill
    >
      <div className="flex w-full flex-col gap-3">
        <ButtonArray
          appearance="badge"
          size="sm"
          items={PANELS}
          value={panel}
          onValueChange={setPanel}
        />
        {panel === "full" ? (
          <DataTable
            columns={PAYMENT_COLUMNS}
            data={payments}
            getRowId={(row) => row.id}
            search
            searchPlaceholder="Search payments"
            selectable
            bulkActions={(rows) => [
              {
                id: "delete",
                label: `Delete ${rows.length}`,
                tone: "danger",
                icon: <Trash2Icon />,
                onSelect: () => {
                  const ids = new Set(rows.map((row) => row.id))
                  setPayments((current) =>
                    current.filter((row) => !ids.has(row.id))
                  )
                },
              },
            ]}
            exportable
            exportFileName="payments"
            viewOptions
            pagination
            pageSize={5}
            onCellEdit={(edit) =>
              setPayments((current) => editingPayments(current, edit))
            }
          />
        ) : null}
        {panel === "basic" ? (
          <DataTable columns={PAYMENT_COLUMNS} data={PAYMENTS.slice(0, 5)} />
        ) : null}
        {panel === "columns" ? (
          <DataTable
            columns={PAYMENT_COLUMNS}
            data={PAYMENTS}
            getRowId={(row) => row.id}
            selectable
            resizable
            reorderable
            pinnable
            viewOptions
            striped
            maxHeight={320}
          />
        ) : null}
        {panel === "tree" ? (
          <DataTable
            columns={TASK_COLUMNS}
            data={TASKS}
            getRowId={(row) => row.id}
            getSubRows={(row) => row.subtasks}
            selectable
          />
        ) : null}
      </div>
    </RendersDemoCard>
  )
}
