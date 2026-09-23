export const STANDARD_MOCK_STATUSES = ["Active", "Pending", "Archived"] as const

export const STANDARD_MOCK_DEPARTMENTS = [
  "Engineering",
  "Operations",
  "Finance",
  "People",
] as const

export type StandardMockRow = {
  id: string
  name: string
  status: (typeof STANDARD_MOCK_STATUSES)[number]
  department: (typeof STANDARD_MOCK_DEPARTMENTS)[number]
  updated_at: string
}

export const STANDARD_MOCK_TABLE_ROWS: StandardMockRow[] = [
  {
    id: "1",
    name: "North Feeder Study",
    status: "Active",
    department: "Engineering",
    updated_at: "2026-07-18",
  },
  {
    id: "2",
    name: "Yard Expansion",
    status: "Pending",
    department: "Operations",
    updated_at: "2026-07-15",
  },
  {
    id: "3",
    name: "Q2 Capex Review",
    status: "Active",
    department: "Finance",
    updated_at: "2026-07-12",
  },
  {
    id: "4",
    name: "Onboarding Pack",
    status: "Archived",
    department: "People",
    updated_at: "2026-06-30",
  },
  {
    id: "5",
    name: "Relay Settings Audit",
    status: "Active",
    department: "Engineering",
    updated_at: "2026-07-20",
  },
  {
    id: "6",
    name: "Fleet GPS Rollout",
    status: "Pending",
    department: "Operations",
    updated_at: "2026-07-10",
  },
  {
    id: "7",
    name: "Invoice Batch 442",
    status: "Active",
    department: "Finance",
    updated_at: "2026-07-21",
  },
  {
    id: "8",
    name: "Safety Orientation",
    status: "Active",
    department: "People",
    updated_at: "2026-07-08",
  },
  {
    id: "9",
    name: "Substation B Cutover",
    status: "Pending",
    department: "Engineering",
    updated_at: "2026-07-22",
  },
  {
    id: "10",
    name: "SCADA Historian Migrate",
    status: "Active",
    department: "Operations",
    updated_at: "2026-07-19",
  },
  {
    id: "11",
    name: "Vendor Rate Refresh",
    status: "Pending",
    department: "Finance",
    updated_at: "2026-07-17",
  },
  {
    id: "12",
    name: "Apprentice Intake",
    status: "Archived",
    department: "People",
    updated_at: "2026-06-22",
  },
]
