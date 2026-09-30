"use client"

import { useState } from "react"
import {
  ChevronDownIcon,
  DownloadIcon,
  FileJsonIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  PrinterIcon,
  Share2Icon,
} from "lucide-react"

import { Button } from "@/components/standard/button"
import {
  readsExportTable,
  savesBlob,
  writesCsv,
  writesXlsx,
} from "@/components/standard/file-actions"
import { DropdownMenu, type MenuEntry } from "@/components/standard/menu"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

import { DEMO_EXPORT_COLUMNS, DEMO_EXPORT_ROWS } from "./definesExportRows"

/**
 * The export group as one control: a single "Export" button whose menu
 * offers every format, built from the same helpers as the separate buttons.
 * Shown on each export piece (Share, Print, Excel, CSV, Download).
 */
export function RendersExportMenuCard() {
  const [result, setResult] = useState<string | null>(null)

  function savesTable(format: "csv" | "xlsx") {
    const table = readsExportTable(DEMO_EXPORT_ROWS, DEMO_EXPORT_COLUMNS)
    const name = `orders.${format}`
    savesBlob(format === "csv" ? writesCsv(table) : writesXlsx(table), name)
    setResult(`Saved ${name}`)
  }

  function savesJson() {
    const json = JSON.stringify(DEMO_EXPORT_ROWS, null, 2)
    savesBlob(new Blob([json], { type: "application/json" }), "orders.json")
    setResult("Saved orders.json")
  }

  async function sharesLink() {
    const data = { title: document.title, url: window.location.href }
    try {
      if (
        navigator.share &&
        (!navigator.canShare || navigator.canShare(data))
      ) {
        await navigator.share(data)
        setResult("Shared from the share sheet")
      } else {
        await navigator.clipboard.writeText(data.url)
        setResult("Copied the link")
      }
    } catch {
      // Dismissing the share sheet rejects too; leave the last result.
    }
  }

  const items: MenuEntry[] = [
    {
      type: "group",
      id: "files",
      label: "Download as",
      items: [
        {
          id: "csv",
          label: "CSV",
          icon: <FileTextIcon />,
          onSelect: () => savesTable("csv"),
        },
        {
          id: "xlsx",
          label: "Excel",
          icon: <FileSpreadsheetIcon />,
          onSelect: () => savesTable("xlsx"),
        },
        {
          id: "json",
          label: "JSON",
          icon: <FileJsonIcon />,
          onSelect: savesJson,
        },
      ],
    },
    { type: "separator", id: "sep" },
    {
      id: "print",
      label: "Print",
      icon: <PrinterIcon />,
      shortcut: "⌘P",
      onSelect: () => window.print(),
    },
    {
      id: "share",
      label: "Share link",
      icon: <Share2Icon />,
      onSelect: () => void sharesLink(),
    },
  ]

  return (
    <RendersDemoCard label="export menu">
      <div className="flex flex-wrap items-center gap-3">
        <DropdownMenu
          align="start"
          items={items}
          trigger={
            <Button
              tone="outline"
              leading={<DownloadIcon aria-hidden className="size-4" />}
              trailing={
                <ChevronDownIcon
                  aria-hidden
                  className="size-4 text-muted-foreground"
                />
              }
            >
              Export
            </Button>
          }
        />
        <span className="font-mono text-xs text-muted-foreground">
          {result ?? `${DEMO_EXPORT_ROWS.length} orders`}
        </span>
      </div>
    </RendersDemoCard>
  )
}
