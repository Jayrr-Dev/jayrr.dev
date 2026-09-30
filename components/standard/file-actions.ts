import type * as React from "react"

/**
 * Shared by the file action buttons (Print, Excel, CSV, Download, Upload):
 * how a button shows its icon and label, and the table export helpers.
 */

/** `icon` is a square icon-only button, `icon-text` an icon before the label, `text` the label alone. */
type FileActionDisplay = "icon" | "icon-text" | "text"

/** Button props for a display: icon-only buttons carry the label as their accessible name. */
function displaysFileAction(
  display: FileActionDisplay,
  icon: React.ReactNode,
  label: React.ReactNode,
  name: string
) {
  if (display === "icon") {
    return {
      iconOnly: true,
      "aria-label": name,
      title: name,
      leading: undefined,
      children: icon,
    }
  }

  return {
    iconOnly: false,
    leading: display === "icon-text" ? icon : undefined,
    children: label,
  }
}

type ExportCell = string | number | boolean | Date | null | undefined

/** Objects keyed by column, or arrays of cells (the first array is not a header unless `columns` is left out). */
type ExportRows = Record<string, unknown>[] | unknown[][]

type ExportColumn = {
  key: string
  /** Header text; defaults to the key. */
  label?: string
}

/** Rows given directly, or read when the button is pressed. */
type ExportSource = ExportRows | (() => ExportRows | Promise<ExportRows>)

type ExportTable = {
  header: string[] | null
  body: ExportCell[][]
}

function readsCell(value: unknown): ExportCell {
  if (
    value === null ||
    value === undefined ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    value instanceof Date
  ) {
    return value
  }

  return typeof value === "object" ? JSON.stringify(value) : String(value)
}

/** Turns rows into a header plus a grid of cells. Object rows take their columns from `columns` or the first row. */
function readsExportTable(
  rows: ExportRows,
  columns?: ExportColumn[]
): ExportTable {
  if (rows.length === 0) {
    return {
      header: columns?.map((column) => column.label ?? column.key) ?? null,
      body: [],
    }
  }

  if (Array.isArray(rows[0])) {
    return {
      header: columns?.map((column) => column.label ?? column.key) ?? null,
      body: (rows as unknown[][]).map((row) => row.map(readsCell)),
    }
  }

  const objects = rows as Record<string, unknown>[]
  const picked: ExportColumn[] =
    columns ?? Object.keys(objects[0]).map((key) => ({ key }))

  return {
    header: picked.map((column) => column.label ?? column.key),
    body: objects.map((row) =>
      picked.map((column) => readsCell(row[column.key]))
    ),
  }
}

async function readsExportSource(source: ExportSource) {
  return typeof source === "function" ? await source() : source
}

/** Saves a blob through a temporary download link. */
function savesBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  link.style.display = "none"
  document.body.appendChild(link)
  link.click()
  link.remove()
  // Some browsers start the download after click returns.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function withExtension(fileName: string, extension: string) {
  return fileName.toLowerCase().endsWith(`.${extension}`)
    ? fileName
    : `${fileName}.${extension}`
}

function csvCell(value: ExportCell, delimiter: string) {
  if (value === null || value === undefined) {
    return ""
  }

  const text = value instanceof Date ? value.toISOString() : String(value)

  return text.includes(delimiter) || /["\r\n]/.test(text)
    ? `"${text.replace(/"/g, '""')}"`
    : text
}

/** CSV text with a byte order mark so Excel reads it as UTF-8. */
function writesCsv(table: ExportTable, delimiter = ",") {
  const lines = [...(table.header ? [table.header] : []), ...table.body].map(
    (row) => row.map((cell) => csvCell(cell, delimiter)).join(delimiter)
  )

  return new Blob([`﻿${lines.join("\r\n")}`], {
    type: "text/csv;charset=utf-8",
  })
}

function escapesXml(text: string) {
  return (
    text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      // Control characters other than tab and newlines are not allowed in XML.
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
  )
}

function columnName(index: number) {
  let name = ""
  let rest = index + 1

  while (rest > 0) {
    const digit = (rest - 1) % 26
    name = String.fromCharCode(65 + digit) + name
    rest = Math.floor((rest - 1) / 26)
  }

  return name
}

function xlsxCell(value: ExportCell, ref: string, style: string) {
  if (value === null || value === undefined || value === "") {
    return ""
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return `<c r="${ref}"${style}><v>${value}</v></c>`
  }
  if (typeof value === "boolean") {
    return `<c r="${ref}"${style} t="b"><v>${value ? 1 : 0}</v></c>`
  }

  const text = value instanceof Date ? value.toISOString() : String(value)

  return `<c r="${ref}"${style} t="inlineStr"><is><t xml:space="preserve">${escapesXml(text)}</t></is></c>`
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  }
  return c >>> 0
})

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff
  for (const byte of bytes) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

/** An uncompressed (stored) zip archive, which is all an .xlsx needs. */
function zipsFiles(files: { name: string; text: string }[]) {
  const encoder = new TextEncoder()
  const locals: Uint8Array[] = []
  const centrals: Uint8Array[] = []
  let offset = 0

  for (const file of files) {
    const name = encoder.encode(file.name)
    const data = encoder.encode(file.text)
    const crc = crc32(data)

    const local = new Uint8Array(30 + name.length + data.length)
    const lv = new DataView(local.buffer)
    lv.setUint32(0, 0x04034b50, true)
    lv.setUint16(4, 20, true)
    lv.setUint16(6, 0x0800, true) // UTF-8 names
    lv.setUint32(14, crc, true)
    lv.setUint32(18, data.length, true)
    lv.setUint32(22, data.length, true)
    lv.setUint16(26, name.length, true)
    local.set(name, 30)
    local.set(data, 30 + name.length)

    const central = new Uint8Array(46 + name.length)
    const cv = new DataView(central.buffer)
    cv.setUint32(0, 0x02014b50, true)
    cv.setUint16(4, 20, true)
    cv.setUint16(6, 20, true)
    cv.setUint16(8, 0x0800, true)
    cv.setUint32(16, crc, true)
    cv.setUint32(20, data.length, true)
    cv.setUint32(24, data.length, true)
    cv.setUint16(28, name.length, true)
    cv.setUint32(42, offset, true)
    central.set(name, 46)

    locals.push(local)
    centrals.push(central)
    offset += local.length
  }

  const centralSize = centrals.reduce((sum, part) => sum + part.length, 0)
  const end = new Uint8Array(22)
  const ev = new DataView(end.buffer)
  ev.setUint32(0, 0x06054b50, true)
  ev.setUint16(8, files.length, true)
  ev.setUint16(10, files.length, true)
  ev.setUint32(12, centralSize, true)
  ev.setUint32(16, offset, true)

  return new Blob([...locals, ...centrals, end] as BlobPart[], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
}

/** A one-sheet .xlsx workbook; the header row is bold and frozen. */
function writesXlsx(table: ExportTable, sheetName = "Sheet1") {
  const rows = [...(table.header ? [table.header] : []), ...table.body]
  const headerStyle = ' s="1"'
  const sheetRows = rows
    .map((row, rowIndex) => {
      const style = table.header && rowIndex === 0 ? headerStyle : ""
      const cells = row
        .map((cell, columnIndex) =>
          xlsxCell(cell, `${columnName(columnIndex)}${rowIndex + 1}`, style)
        )
        .join("")
      return `<row r="${rowIndex + 1}">${cells}</row>`
    })
    .join("")
  const frozen = table.header
    ? '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>'
    : ""
  // Sheet names allow at most 31 characters and none of : \ / ? * [ ]
  const safeName =
    sheetName.replace(/[:\\/?*[\]]/g, " ").slice(0, 31) || "Sheet1"
  const xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
  const main = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
  const rel =
    "http://schemas.openxmlformats.org/officeDocument/2006/relationships"

  return zipsFiles([
    {
      name: "[Content_Types].xml",
      text: `${xml}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`,
    },
    {
      name: "_rels/.rels",
      text: `${xml}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${rel}/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    },
    {
      name: "xl/workbook.xml",
      text: `${xml}<workbook xmlns="${main}" xmlns:r="${rel}"><sheets><sheet name="${escapesXml(safeName)}" sheetId="1" r:id="rId1"/></sheets></workbook>`,
    },
    {
      name: "xl/_rels/workbook.xml.rels",
      text: `${xml}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${rel}/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="${rel}/styles" Target="styles.xml"/></Relationships>`,
    },
    {
      name: "xl/styles.xml",
      text: `${xml}<styleSheet xmlns="${main}"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`,
    },
    {
      name: "xl/worksheets/sheet1.xml",
      text: `${xml}<worksheet xmlns="${main}">${frozen}<sheetData>${sheetRows}</sheetData></worksheet>`,
    },
  ])
}

export {
  displaysFileAction,
  readsExportTable,
  readsExportSource,
  savesBlob,
  withExtension,
  writesCsv,
  writesXlsx,
  type ExportCell,
  type ExportColumn,
  type ExportRows,
  type ExportSource,
  type ExportTable,
  type FileActionDisplay,
}
