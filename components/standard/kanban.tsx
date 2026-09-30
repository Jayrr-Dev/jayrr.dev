"use client"

import * as React from "react"
import { PlusIcon } from "lucide-react"
import { cn } from "cn"

import { Badge } from "@/components/standard/badge"
import { Button } from "@/components/standard/button"
import {
  Draggable,
  DraggableRoot,
  type DraggableMove,
} from "@/components/standard/draggable"

type KanbanCard = {
  id: string
  title: string
  description?: string
  tags?: string[]
}

type KanbanColumn<T extends KanbanCard = KanbanCard> = {
  id: string
  title: string
  cards: T[]
  /** Most cards the column takes. Past it, drops are refused. */
  limit?: number
  /** Dot beside the title, any CSS colour. */
  color?: string
}

/** Returns the columns with one card moved, for `onColumnsChange`. */
function movesKanbanCard<T extends KanbanCard>(
  columns: KanbanColumn<T>[],
  move: DraggableMove
): KanbanColumn<T>[] {
  const source = columns.find((column) => column.id === move.from.listId)
  const card = source?.cards[move.from.index]
  if (!source || !card) return columns

  return columns.map((column) => {
    let cards = column.cards
    if (column.id === move.from.listId) {
      cards = cards.filter((_, index) => index !== move.from.index)
    }
    if (column.id === move.to.listId) {
      cards = cards.slice()
      cards.splice(move.to.index, 0, card)
    }
    return cards === column.cards ? column : { ...column, cards }
  })
}

function KanbanCardView({ card }: { card: KanbanCard }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{card.title}</span>
      {card.description ? (
        <span className="text-xs text-muted-foreground">{card.description}</span>
      ) : null}
      {card.tags?.length ? (
        <div className="flex flex-wrap gap-1 pt-0.5">
          {card.tags.map((tag) => (
            <Badge key={tag} tone="quiet" appearance="soft" size="sm">
              {tag}
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  )
}

/**
 * Board of columns whose cards drag between them, by pointer or keyboard
 * (Space to lift, arrows to move within and across columns, Space to drop).
 */
function Kanban<T extends KanbanCard = KanbanCard>({
  columns,
  onColumnsChange,
  onMove,
  renderCard,
  onAddCard,
  className,
  columnClassName,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  columns: KanbanColumn<T>[]
  /** Gets the columns with the move applied. */
  onColumnsChange?: (columns: KanbanColumn<T>[]) => void
  /** Raw move, e.g. to save a card's new column. */
  onMove?: (move: DraggableMove) => void
  /** Replaces the default card body. */
  renderCard?: (card: T, column: KanbanColumn<T>) => React.ReactNode
  /** Shows an "Add card" button at the foot of each column. */
  onAddCard?: (columnId: string) => void
  columnClassName?: string
}) {
  return (
    <DraggableRoot
      onMove={(move) => {
        onMove?.(move)
        onColumnsChange?.(movesKanbanCard(columns, move))
      }}
    >
      <div
        data-slot="kanban"
        className={cn(
          "flex w-full gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]",
          className
        )}
        {...props}
      >
        {columns.map((column) => {
          const full = column.limit != null && column.cards.length >= column.limit

          return (
            <section
              key={column.id}
              data-slot="kanban-column"
              aria-label={column.title}
              className={cn(
                "flex w-64 shrink-0 flex-col rounded-xl border border-border bg-muted/40",
                columnClassName
              )}
            >
              <header className="flex items-center gap-2 px-3 pt-3 pb-2">
                {column.color ? (
                  <span
                    aria-hidden
                    className="size-2 shrink-0 rounded-full"
                    style={{ background: column.color }}
                  />
                ) : null}
                <h3 className="min-w-0 truncate text-sm font-semibold">
                  {column.title}
                </h3>
                <Badge
                  tone={full ? "warning" : "quiet"}
                  appearance="soft"
                  size="sm"
                  className="ms-auto tabular-nums"
                >
                  {column.cards.length}
                  {column.limit != null ? ` / ${column.limit}` : null}
                </Badge>
              </header>
              <Draggable
                listId={column.id}
                label={column.title}
                items={column.cards}
                getId={(card) => card.id}
                getItemLabel={(card) => card.title}
                accept={() =>
                  column.limit == null || column.cards.length < column.limit
                }
                className="min-h-24 flex-1 px-2 pb-2 data-[over]:bg-primary/5"
                itemClassName="rounded-lg border border-border bg-background p-3 shadow-xs"
                empty={
                  <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
                    Drop cards here
                  </div>
                }
                renderItem={(card) =>
                  renderCard ? renderCard(card, column) : <KanbanCardView card={card} />
                }
              />
              {onAddCard ? (
                <div className="px-2 pb-2">
                  <Button
                    tone="ghost"
                    size="sm"
                    className="w-full justify-start"
                    disabled={full}
                    onClick={() => onAddCard(column.id)}
                  >
                    <PlusIcon aria-hidden className="size-4" />
                    Add card
                  </Button>
                </div>
              ) : null}
            </section>
          )
        })}
      </div>
    </DraggableRoot>
  )
}

export {
  Kanban,
  KanbanCardView,
  movesKanbanCard,
  type KanbanCard,
  type KanbanColumn,
}
