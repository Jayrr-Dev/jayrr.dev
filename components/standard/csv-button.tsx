"use client"

import * as React from "react"
import { FileTextIcon } from "lucide-react"

import { Button } from "@/components/standard/button"
import {
  displaysFileAction,
  readsExportSource,
  readsExportTable,
  savesBlob,
  withExtension,
  writesCsv,
  type ExportColumn,
  type ExportSource,
  type FileActionDisplay,
} from "@/components/standard/file-actions"

/**
 * Exports rows as a .csv file. Rows are objects (columns from `columns` or
 * the first row's keys) or arrays of cells, given directly or read on click.
 *
 * <CsvButton rows={orders} fileName="orders" />
 * <CsvButton display="icon" rows={() => fetchOrders()} />
 * <CsvButton rows={orders} columns={[{ key: "id", label: "Order" }]} delimiter=";" />
 */

type CsvButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "href" | "iconOnly" | "leading" | "onClick"
> & {
  display?: FileActionDisplay
  rows: ExportSource
  columns?: ExportColumn[]
  /** `.csv` is added when missing. */
  fileName?: string
  delimiter?: string
  onExport?: (fileName: string) => void
  onExportError?: (error: unknown) => void
}

function CsvButton({
  display = "icon-text",
  rows,
  columns,
  fileName = "export",
  delimiter = ",",
  onExport,
  onExportError,
  tone = "outline",
  loading,
  children,
  ...props
}: CsvButtonProps) {
  const [busy, setBusy] = React.useState(false)

  async function handleClick() {
    const name = withExtension(fileName, "csv")
    setBusy(true)
    try {
      const table = readsExportTable(await readsExportSource(rows), columns)
      savesBlob(writesCsv(table, delimiter), name)
      onExport?.(name)
    } catch (error) {
      onExportError?.(error)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button
      data-slot="csv-button"
      data-display={display}
      tone={tone}
      loading={busy || loading}
      onClick={handleClick}
      {...displaysFileAction(
        display,
        <FileTextIcon aria-hidden className="size-4" />,
        children ?? "CSV",
        "Export CSV"
      )}
      {...props}
    />
  )
}

export { CsvButton }
