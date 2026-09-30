"use client"

import { useState } from "react"

import { CsvButton } from "@/components/standard/csv-button"
import type { FileActionDisplay } from "@/components/standard/file-actions"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

import {
  DEMO_EXPORT_COLUMNS,
  DEMO_EXPORT_ROWS,
} from "../shared/definesExportRows"
import { RendersExportMenuCard } from "../shared/rendersExportMenuCard"

type ExportDisplay = FileActionDisplay

function RendersExportCard({
  label,
  display,
}: {
  label: string
  display: ExportDisplay
}) {
  const [saved, setSaved] = useState<string | null>(null)

  return (
    <RendersDemoCard label={label}>
      <div className="flex flex-wrap items-center gap-3">
        <CsvButton
          display={display}
          rows={DEMO_EXPORT_ROWS}
          columns={DEMO_EXPORT_COLUMNS}
          fileName="orders"
          onExport={setSaved}
        />
        <span className="font-mono text-xs text-muted-foreground">
          {saved ? `Saved ${saved}` : `${DEMO_EXPORT_ROWS.length} orders`}
        </span>
      </div>
    </RendersDemoCard>
  )
}

export function RendersCsvButtonDemo() {
  return (
    <>
      <RendersExportCard label="icon" display="icon" />
      <RendersExportCard label="iconed text" display="icon-text" />
      <RendersExportCard label="text" display="text" />
      <RendersExportMenuCard />
    </>
  )
}
