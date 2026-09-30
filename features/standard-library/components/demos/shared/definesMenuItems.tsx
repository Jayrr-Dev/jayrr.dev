import {
  ArchiveIcon,
  CopyIcon,
  PencilIcon,
  ShareIcon,
  Trash2Icon,
} from "lucide-react"

import type { MenuEntry, MenuItem } from "@/components/standard/menu"

/** Menu items shared by the Dropdown Menu and Context Menu demos. */
export const MENU_ITEMS = [
  { id: "archive", label: "Archive" },
  { id: "delete", label: "Delete", tone: "danger" as const },
]

/** Items with leading icons and shortcut hints. */
export const MENU_ITEMS_WITH_ICONS: MenuItem[] = [
  { id: "edit", label: "Edit", icon: <PencilIcon />, shortcut: "⌘E" },
  { id: "duplicate", label: "Duplicate", icon: <CopyIcon />, shortcut: "⌘D" },
  { id: "archive", label: "Archive", icon: <ArchiveIcon />, shortcut: "⌘A" },
  {
    id: "delete",
    label: "Delete",
    tone: "danger",
    icon: <Trash2Icon />,
    shortcut: "⌫",
  },
]

/** Items where some are disabled. */
export const MENU_ITEMS_DISABLED: MenuItem[] = [
  { id: "edit", label: "Edit" },
  { id: "share", label: "Share", disabled: true },
  { id: "archive", label: "Archive" },
  { id: "delete", label: "Delete", tone: "danger", disabled: true },
]

/** Labelled groups split by separators. */
export const MENU_GROUPED_ENTRIES: MenuEntry[] = [
  {
    type: "group",
    id: "file",
    label: "File",
    items: [
      { id: "edit", label: "Edit", icon: <PencilIcon /> },
      { id: "duplicate", label: "Duplicate", icon: <CopyIcon /> },
    ],
  },
  { type: "separator", id: "sep-share" },
  {
    type: "group",
    id: "share",
    label: "Share",
    items: [{ id: "share", label: "Share link", icon: <ShareIcon /> }],
  },
  { type: "separator", id: "sep-danger" },
  {
    id: "delete",
    label: "Delete",
    tone: "danger",
    icon: <Trash2Icon />,
  },
]
