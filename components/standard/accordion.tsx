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

export { Accordion }

// Moved to their own files; re-exported so existing imports keep working.
export { StandardText } from "@/components/standard/standard-text"
export { Table } from "@/components/standard/table"
export { ToggleRow } from "@/components/standard/toggle-row"
