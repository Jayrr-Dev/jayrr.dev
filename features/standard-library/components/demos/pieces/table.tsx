"use client"

import { Table } from "@/components/standard/table"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersTableDemo() {
  return (
    <>
      <RendersDemoCard className="w-full max-w-xl">
        <Table
          headers={["Job", "Hours", "Status"]}
          rows={[
            ["1001", "8.0", "Open"],
            ["1002", "4.5", "Hold"],
          ]}
        />
      </RendersDemoCard>
      <RendersDemoCard label="one row" className="w-full max-w-xl">
        <Table headers={["Name"]} rows={[["Jayrr"]]} />
      </RendersDemoCard>
    </>
  )
}
