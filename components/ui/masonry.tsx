"use client"

import * as React from "react"
import { cn } from "cn"

/**
 * A simple masonry layout: a CSS grid of columns where each column is a
 * vertical flexbox. Children are dealt out round-robin (item 0 → column 1,
 * item 1 → column 2, ...), so content fills left to right, row by row, and
 * each column stacks its cards at their natural height.
 *
 * Pass `minColumnWidth` (px) to pick the column count from the container
 * width; `columns` is then the count used before the first measurement.
 * `maxColumns` caps the measured count on wide containers.
 *
 * Fragments are unwrapped, so every card inside `<>...</>` is its own item.
 *
 * <Masonry columns={3}>{cards}</Masonry>
 * <Masonry minColumnWidth={220} className="gap-6">{cards}</Masonry>
 */
function flattenChildren(
  children: React.ReactNode,
  prefix = ""
): React.ReactNode[] {
  return React.Children.toArray(children).flatMap((child) => {
    if (!React.isValidElement(child)) {
      return [child]
    }

    const key = `${prefix}${child.key ?? ""}`
    if (child.type === React.Fragment) {
      const props = child.props as { children?: React.ReactNode }
      return flattenChildren(props.children, `${key}/`)
    }

    return [prefix ? React.cloneElement(child, { key }) : child]
  })
}

function Masonry({
  className,
  columns = 3,
  minColumnWidth,
  maxColumns,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  columns?: number
  minColumnWidth?: number
  maxColumns?: number
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [measured, setMeasured] = React.useState<number | null>(null)

  React.useEffect(() => {
    const node = ref.current
    if (!node || !minColumnWidth) {
      setMeasured(null)
      return
    }

    const observer = new ResizeObserver(([entry]) => {
      const gap = parseFloat(getComputedStyle(node).columnGap) || 0
      const width = entry.contentRect.width
      setMeasured(
        Math.max(1, Math.floor((width + gap) / (minColumnWidth + gap)))
      )
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [minColumnWidth])

  const count = Math.max(
    1,
    Math.min(Math.floor(measured ?? columns), maxColumns ?? Infinity)
  )
  const items = flattenChildren(children)
  const cols: React.ReactNode[][] = Array.from({ length: count }, () => [])
  items.forEach((item, index) => cols[index % count].push(item))

  return (
    <div
      ref={ref}
      data-slot="masonry"
      data-columns={count}
      className={cn("grid items-start gap-4", className)}
      style={{
        gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))`,
        ...style,
      }}
      {...props}
    >
      {cols.map((col, index) => (
        <div
          key={index}
          data-slot="masonry-column"
          // Inherit the grid's gap so one `gap-*` class spaces both axes.
          className="flex min-w-0 flex-col gap-[inherit]"
        >
          {col}
        </div>
      ))}
    </div>
  )
}

export { Masonry }
