import * as React from "react"
import { cn } from "cn"

function Accordion({
  className,
  items,
}: {
  className?: string
  items: { id: string; title: string; body: string }[]
}) {
  return (
    <div data-slot="accordion" className={cn("w-full", className)}>
      {items.map((item) => (
        <details
          key={item.id}
          className="border-b border-border py-2"
        >
          <summary className="cursor-pointer text-sm font-medium">
            {item.title}
          </summary>
          <p className="pt-1 text-sm text-muted-foreground">{item.body}</p>
        </details>
      ))}
    </div>
  )
}

function Table({
  className,
  headers,
  rows,
}: {
  className?: string
  headers: string[]
  rows: string[][]
}) {
  return (
    <table
      data-slot="table"
      className={cn("w-full text-left text-sm", className)}
    >
      <thead>
        <tr>
          {headers.map((header) => (
            <th key={header} className="border-b border-border pb-1 font-medium">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={index}>
            {row.map((cell) => (
              <td key={cell} className="py-1 text-muted-foreground">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function StandardText({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="standard-text"
      className={cn("text-sm leading-relaxed", className)}
      {...props}
    />
  )
}

function ToggleRow({
  className,
  label,
  children,
}: {
  className?: string
  label: string
  children: React.ReactNode
}) {
  return (
    <div
      data-slot="toggle-row"
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-lg border border-border px-3 py-2",
        className
      )}
    >
      <span className="text-sm">{label}</span>
      {children}
    </div>
  )
}

export { Accordion, StandardText, Table, ToggleRow }
