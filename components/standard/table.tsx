import { cn } from "cn"

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

export { Table }
