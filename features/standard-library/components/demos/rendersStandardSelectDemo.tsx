"use client"

import { useState } from "react"

import {
  BadgeSelect,
  BadgeSelectAction,
  type BadgeSelectOption,
} from "@/components/standard/badge-select"
import {
  FilterSelect,
  type FilterSelectGroup,
  type FilterSelectValue,
} from "@/components/standard/filter-select"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const STATUS_OPTIONS: BadgeSelectOption[] = [
  { id: "open", label: "Open" },
  { id: "hold", label: "On hold" },
  { id: "review", label: "In review" },
  { id: "closed", label: "Closed" },
]

const DEPARTMENT_OPTIONS: BadgeSelectOption[] = [
  { id: "eng", label: "Engineering", description: "Engineering\nDesign and drafting." },
  { id: "ops", label: "Operations" },
  { id: "field", label: "Field" },
  { id: "survey", label: "Survey" },
  { id: "admin", label: "Admin" },
  { id: "finance", label: "Finance" },
  { id: "safety", label: "Safety" },
  { id: "hr", label: "People" },
]

const PROJECT_OPTIONS: BadgeSelectOption[] = Array.from({ length: 18 }, (_, index) => ({
  id: `p${1040 + index}`,
  label: `${1040 + index}`,
  subtitle: index % 3 === 0 ? "WO" : "WR",
}))

const MONTH_OPTIONS: BadgeSelectOption[] = [
  ...["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((month) => ({
    id: `2026-${month}`,
    label: month,
    header: "2026",
  })),
  ...["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month) => ({
    id: `2025-${month}`,
    label: month,
    header: "2025",
  })),
]

const INBOX_OPTIONS: BadgeSelectOption[] = [
  { id: "new", label: "New", notificationCount: 4, notificationCountWithSeparator: true },
  { id: "assigned", label: "Assigned", notificationCount: 12, notificationCountWithSeparator: true },
  { id: "waiting", label: "Waiting", notificationCount: 0, notificationCountWithSeparator: true },
]

const FILTER_GROUPS: FilterSelectGroup[] = [
  {
    id: "status",
    label: "Status",
    description: "Where the job is",
    options: STATUS_OPTIONS,
    sortAlphabetically: false,
  },
  {
    id: "department",
    label: "Department",
    options: DEPARTMENT_OPTIONS,
    columns: 4,
  },
  {
    id: "project",
    label: "Project #",
    options: PROJECT_OPTIONS,
    search: true,
    searchPlaceholder: "Search projects...",
  },
  {
    id: "owner",
    label: "Owner",
    description: "Pick one",
    selectType: "single",
    options: [
      { id: "me", label: "Me" },
      { id: "team", label: "My team" },
      { id: "anyone", label: "Anyone" },
    ],
  },
]

/** Builds activity options under one substep header. */
function listsActivities(stepId: string, header: string, labels: string[]) {
  return labels.map((label, index) => ({
    id: `${stepId}-${header.slice(0, 1)}${index}`,
    label,
    header,
  }))
}

/** Process tree shaped like the utilitek timesheet Work Performed picker. */
const WORK_PERFORMED_GROUPS: FilterSelectGroup[] = [
  {
    id: "s1",
    section: "Design",
    label: "1 Intake",
    sortAlphabetically: false,
    options: [
      ...listsActivities("s1", "A Scope", ["Review request", "Site visit", "Client call"]),
      ...listsActivities("s1", "B Records", ["Pull as-builts", "Locate request"]),
    ],
  },
  {
    id: "s2",
    section: "Design",
    label: "2 Layout",
    sortAlphabetically: false,
    options: [
      ...listsActivities("s2", "A Drafting", ["Base drawing", "Pole layout", "Trench profile"]),
      ...listsActivities("s2", "B Calcs", ["Voltage drop", "Sag and tension"]),
      ...listsActivities("s2", "C Review", ["Peer check", "Redlines"]),
    ],
  },
  {
    id: "s3",
    section: "Permits",
    label: "3 Applications",
    sortAlphabetically: false,
    options: [
      ...listsActivities("s3", "A Municipal", ["Road occupancy", "Tree permit"]),
      ...listsActivities("s3", "B Utility", ["Joint use", "Crossing agreement"]),
    ],
  },
  {
    id: "s4",
    section: "Construction",
    label: "4 Field support",
    sortAlphabetically: false,
    options: listsActivities("s4", "A Inspection", ["Pre-con meeting", "Site inspection", "Deficiency list"]),
  },
]

function RendersWorkPerformedFilterSelect() {
  const [filters, setFilters] = useState<FilterSelectValue>({
    s2: ["s2-B0"],
  })

  return (
    <RendersDemoCard label="layout miller · work performed">
      <FilterSelect
        layout="miller"
        columnLabels={["Steps", "Substeps", "Activity"]}
        placeholder="Work performed"
        groups={WORK_PERFORMED_GROUPS}
        value={filters}
        onChange={(groupId, selected) =>
          setFilters((previous) => ({ ...previous, [groupId]: selected }))
        }
        onClearAll={() => setFilters({})}
      />
    </RendersDemoCard>
  )
}

function RendersLiveFilterSelect({
  label,
  variant,
  compact,
}: {
  label: string
  variant?: "default" | "select" | "badge"
  compact?: boolean
}) {
  const [filters, setFilters] = useState<FilterSelectValue>({
    status: ["open"],
  })

  return (
    <RendersDemoCard label={label}>
      <FilterSelect
        groups={FILTER_GROUPS}
        value={filters}
        variant={variant}
        compact={compact}
        onChange={(groupId, selected) =>
          setFilters((previous) => ({ ...previous, [groupId]: selected }))
        }
      />
    </RendersDemoCard>
  )
}

export function RendersFilterSelectDemo() {
  return (
    <>
      <RendersLiveFilterSelect label="category list · badge grid" />
      <RendersLiveFilterSelect label="compact" compact />
      <RendersLiveFilterSelect label="variant select" variant="select" />
      <RendersLiveFilterSelect label="variant badge" variant="badge" />
      <RendersWorkPerformedFilterSelect />
    </>
  )
}

export function RendersBadgeSelectDemo() {
  const [status, setStatus] = useState<string | string[] | null>("open")
  const [departments, setDepartments] = useState<string | string[] | null>(["eng"])
  const [project, setProject] = useState<string | string[] | null>(null)
  const [months, setMonths] = useState<string | string[] | null>([])
  const [type, setType] = useState<string | string[] | null>(null)
  const [owner, setOwner] = useState<string | string[] | null>(null)
  const [inbox, setInbox] = useState<string | string[] | null>(null)
  const [listFilter, setListFilter] = useState<string | string[] | null>([])
  const [actions, setActions] = useState(0)

  return (
    <>
      <RendersDemoCard label="single">
        <BadgeSelect
          options={STATUS_OPTIONS}
          selectedId={status}
          onSelect={setStatus}
          placeholder="Status"
          sortAlphabetically={false}
        />
      </RendersDemoCard>
      <RendersDemoCard label="multi · search · select all">
        <BadgeSelect
          options={DEPARTMENT_OPTIONS}
          selectedId={departments}
          onSelect={setDepartments}
          placeholder="Departments"
          selectType="multi"
          search
          enableSelectAll
        />
      </RendersDemoCard>
      <RendersDemoCard label="subtitles · 18 options">
        <BadgeSelect
          options={PROJECT_OPTIONS}
          selectedId={project}
          onSelect={setProject}
          placeholder="Project #"
          search
          searchPlaceholder="Search projects..."
        />
      </RendersDemoCard>
      <RendersDemoCard label="groupByHeader · multi">
        <BadgeSelect
          options={MONTH_OPTIONS}
          selectedId={months}
          onSelect={setMonths}
          placeholder="Months"
          selectType="multi"
          groupByHeader
          sortAlphabetically={false}
          columns={6}
          size="lg"
        />
      </RendersDemoCard>
      <RendersDemoCard label="variant badge">
        <BadgeSelect
          variant="badge"
          triggerLabel="Type"
          options={[
            { id: "general", label: "General" },
            { id: "urgent", label: "Urgent" },
            { id: "internal", label: "Internal" },
          ]}
          selectedId={type}
          onSelect={setType}
          placeholder="Type"
        />
      </RendersDemoCard>
      <RendersDemoCard label="variant select · all · none">
        <BadgeSelect
          variant="select"
          options={[
            { id: "me", label: "Me" },
            { id: "team", label: "My team" },
          ]}
          selectedId={owner}
          onSelect={setOwner}
          placeholder="Owner"
          allowAllOption
          allOptionLabel="Everyone"
        />
      </RendersDemoCard>
      <RendersDemoCard label="counts after a divider">
        <BadgeSelect
          options={INBOX_OPTIONS}
          selectedId={inbox}
          onSelect={setInbox}
          placeholder="Queue"
          sortAlphabetically={false}
        />
      </RendersDemoCard>
      <RendersDemoCard label="variant icon · list layout">
        <div className="flex items-center gap-1.5 text-sm font-medium">
          Status
          <BadgeSelect
            variant="icon"
            optionLayout="list"
            options={STATUS_OPTIONS}
            selectedId={listFilter}
            onSelect={setListFilter}
            placeholder="Filter status"
            selectType="multi"
            size="sm"
            sortAlphabetically={false}
          />
        </div>
      </RendersDemoCard>
      <RendersDemoCard label={`BadgeSelectAction · clicked ${actions}`}>
        <div className="flex gap-1.5">
          <BadgeSelectAction label="Edit" onClick={() => setActions((count) => count + 1)} />
          <BadgeSelectAction label="Archive" tone="quiet" onClick={() => setActions((count) => count + 1)} />
          <BadgeSelectAction label="Locked" disabled onClick={() => {}} />
        </div>
      </RendersDemoCard>
    </>
  )
}
