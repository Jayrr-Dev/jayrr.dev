"use client"

import * as React from "react"
import { FileSpreadsheetIcon } from "lucide-react"

import { Button } from "@/components/standard/button"
import {
  displaysFileAction,
  readsExportSource,
  readsExportTable,
  savesBlob,
  withExtension,
  writesXlsx,
  type ExportColumn,
  type ExportSource,
  type FileActionDisplay,
} from "@/components/standard/file-actions"

/**
 * Exports rows as an Excel workbook (.xlsx) with no spreadsheet library:
 * one sheet, numbers and booleans kept as values, a bold frozen header.
 *
 * <ExcelButton rows={orders} fileName="orders" />
 * <ExcelButton display="icon" rows={() => fetchOrders()} sheetName="Orders" />
 */

type ExcelButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "href" | "iconOnly" | "leading" | "onClick"
> & {
  display?: FileActionDisplay
  rows: ExportSource
  columns?: ExportColumn[]
  /** `.xlsx` is added when missing. */
  fileName?: string
  sheetName?: string
  onExport?: (fileName: string) => void
  onExportError?: (error: unknown) => void
}

function ExcelButton({
  display = "icon-text",
  rows,
  columns,
  fileName = "export",
  sheetName,
  onExport,
  onExportError,
  tone = "outline",
  loading,
  children,
  ...props
}: ExcelButtonProps) {
  const [busy, setBusy] = React.useState(false)

  async function handleClick() {
    const name = withExtension(fileName, "xlsx")
    setBusy(true)
    try {
      const table = readsExportTable(await readsExportSource(rows), columns)
      savesBlob(writesXlsx(table, sheetName), name)
      onExport?.(name)
    } catch (error) {
      onExportError?.(error)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button
      data-slot="excel-button"
      data-display={display}
      tone={tone}
      loading={busy || loading}
      onClick={handleClick}
      {...displaysFileAction(
        display,
        <FileSpreadsheetIcon aria-hidden className="size-4" />,
        children ?? "Excel",
        "Export to Excel"
      )}
      {...props}
    />
  )
}

export { ExcelButton }
