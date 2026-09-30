"use client"

import type { Editor } from "prosekit/core"
import type { TableExtension } from "prosekit/extensions/table"
import { useEditorDerivedValue } from "prosekit/react"
import {
  BlockHandleAdd,
  BlockHandleDraggable,
  BlockHandlePopup,
  BlockHandlePositioner,
  BlockHandleRoot,
} from "prosekit/react/block-handle"
import { DropIndicator as DropIndicatorPrimitive } from "prosekit/react/drop-indicator"
import { MenuItem, MenuPopup, MenuPositioner } from "prosekit/react/menu"
import {
  TableHandleColumnMenuRoot,
  TableHandleColumnMenuTrigger,
  TableHandleColumnPopup,
  TableHandleColumnPositioner,
  TableHandleDragPreview,
  TableHandleDropIndicator,
  TableHandleRoot,
  TableHandleRowMenuRoot,
  TableHandleRowMenuTrigger,
  TableHandleRowPopup,
  TableHandleRowPositioner,
} from "prosekit/react/table-handle"
import { GripHorizontalIcon, GripVerticalIcon, PlusIcon } from "lucide-react"
import { cn } from "cn"

import {
  POPUP_CLASS,
  POPUP_ITEM_CLASS,
  POSITIONER_CLASS,
} from "@/components/standard/prosekit/editor-frame"

const HANDLE_POPUP_CLASS =
  "flex origin-(--transform-origin) transition transition-discrete duration-100 data-[state=closed]:scale-95 data-[state=closed]:opacity-0 starting:scale-95 starting:opacity-0 motion-reduce:transition-none"

const HANDLE_BUTTON_CLASS =
  "flex items-center justify-center rounded-sm text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground [&_svg]:size-4"

/** The + and drag grip beside the hovered block. Needs a left gutter of about 3rem. */
export function BlockHandle() {
  return (
    <BlockHandleRoot>
      <BlockHandlePositioner placement="left" className={POSITIONER_CLASS}>
        <BlockHandlePopup className={HANDLE_POPUP_CLASS}>
          <BlockHandleAdd
            aria-label="Add block below"
            className={cn(HANDLE_BUTTON_CLASS, "size-6 cursor-pointer")}
          >
            <PlusIcon />
          </BlockHandleAdd>
          <BlockHandleDraggable
            aria-label="Drag to move block"
            className={cn(HANDLE_BUTTON_CLASS, "h-6 w-5 cursor-grab")}
          >
            <GripVerticalIcon />
          </BlockHandleDraggable>
        </BlockHandlePopup>
      </BlockHandlePositioner>
    </BlockHandleRoot>
  )
}

/** The line that shows where a dragged block will land. */
export function DropIndicator() {
  return <DropIndicatorPrimitive className="z-50 bg-primary transition-all" />
}

function readTableActions(editor: Editor<TableExtension>) {
  const { commands } = editor
  const action = (label: string, command: typeof commands.deleteTable) => ({
    label,
    canExec: command.canExec(),
    run: () => command(),
  })
  return {
    column: [
      action("Insert left", commands.addTableColumnBefore),
      action("Insert right", commands.addTableColumnAfter),
      action("Clear contents", commands.deleteCellSelection),
      action("Delete column", commands.deleteTableColumn),
    ],
    row: [
      action("Insert above", commands.addTableRowAbove),
      action("Insert below", commands.addTableRowBelow),
      action("Clear contents", commands.deleteCellSelection),
      action("Delete row", commands.deleteTableRow),
    ],
    deleteTable: action("Delete table", commands.deleteTable),
  }
}

type TableAction = ReturnType<typeof readTableActions>["deleteTable"]

function TableMenu({ actions }: { actions: TableAction[] }) {
  return (
    <MenuPositioner className={POSITIONER_CLASS}>
      <MenuPopup className={cn(POPUP_CLASS, "min-w-40 outline-none")}>
        {actions
          .filter((action) => action.canExec)
          .map((action) => (
            <MenuItem
              key={action.label}
              onSelect={action.run}
              data-danger={action.label === "Delete table" ? "" : undefined}
              className={POPUP_ITEM_CLASS}
            >
              {action.label}
            </MenuItem>
          ))}
      </MenuPopup>
    </MenuPositioner>
  )
}

const TABLE_TRIGGER_CLASS =
  "flex items-center justify-center overflow-clip rounded-sm border border-border bg-background p-0 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground [&_svg]:size-3.5"

/** Grips on the hovered row and column, each opening an insert/delete menu. */
export function TableHandle() {
  const actions = useEditorDerivedValue(readTableActions)

  return (
    <TableHandleRoot>
      <TableHandleDragPreview />
      <TableHandleDropIndicator />
      <TableHandleColumnPositioner className={POSITIONER_CLASS}>
        <TableHandleColumnPopup
          className={cn(HANDLE_POPUP_CLASS, "translate-y-1/2")}
        >
          <TableHandleColumnMenuRoot>
            <TableHandleColumnMenuTrigger
              aria-label="Column actions"
              className={cn(TABLE_TRIGGER_CLASS, "h-4 w-6")}
            >
              <GripHorizontalIcon />
            </TableHandleColumnMenuTrigger>
            <TableMenu actions={[...actions.column, actions.deleteTable]} />
          </TableHandleColumnMenuRoot>
        </TableHandleColumnPopup>
      </TableHandleColumnPositioner>
      <TableHandleRowPositioner placement="left" className={POSITIONER_CLASS}>
        <TableHandleRowPopup
          className={cn(HANDLE_POPUP_CLASS, "translate-x-1/2")}
        >
          <TableHandleRowMenuRoot>
            <TableHandleRowMenuTrigger
              aria-label="Row actions"
              className={cn(TABLE_TRIGGER_CLASS, "h-6 w-4")}
            >
              <GripVerticalIcon />
            </TableHandleRowMenuTrigger>
            <TableMenu actions={[...actions.row, actions.deleteTable]} />
          </TableHandleRowMenuRoot>
        </TableHandleRowPopup>
      </TableHandleRowPositioner>
    </TableHandleRoot>
  )
}
