"use client"

import { useState } from "react"
import {
  ArrowDownWideNarrowIcon,
  CheckIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
  EllipsisIcon,
  FileTextIcon,
  FolderIcon,
  ImageIcon,
  InboxIcon,
  LogOutIcon,
  PlusIcon,
  SettingsIcon,
  StarIcon,
  UserIcon,
} from "lucide-react"

import { Bar } from "@/components/standard/bar"
import { DropdownMenu, type MenuEntry } from "@/components/standard/menu"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"
import {
  MENU_GROUPED_ENTRIES,
  MENU_ITEMS,
  MENU_ITEMS_DISABLED,
  MENU_ITEMS_WITH_ICONS,
} from "@/features/standard-library/components/demos/shared/definesMenuItems"

function RendersDropdownSelectDemo() {
  const [picked, setPicked] = useState("Nothing yet")

  return (
    <div className="flex flex-col items-center gap-2">
      <DropdownMenu
        label="Pick one"
        items={MENU_ITEMS_WITH_ICONS.map((item) => ({
          ...item,
          onSelect: () => setPicked(item.label),
        }))}
      />
      <span className="text-xs text-muted-foreground">Picked: {picked}</span>
    </div>
  )
}

const NEW_ITEMS: MenuEntry[] = [
  { id: "doc", label: "Document", icon: <FileTextIcon />, shortcut: "Ctrl+D" },
  { id: "folder", label: "Folder", icon: <FolderIcon />, shortcut: "Ctrl+F" },
  { id: "image", label: "Image", icon: <ImageIcon /> },
]

const WORKSPACE_ITEMS: MenuEntry[] = [
  {
    type: "group",
    id: "workspaces",
    label: "Workspaces",
    items: [
      { id: "acme", label: "Acme Inc.", icon: <CheckIcon /> },
      { id: "personal", label: "Personal", icon: <span className="size-4" /> },
    ],
  },
  { type: "separator", id: "sep-account" },
  { id: "profile", label: "Profile", icon: <UserIcon /> },
  {
    id: "settings",
    label: "Settings",
    icon: <SettingsIcon />,
    shortcut: "Ctrl+,",
  },
  { type: "separator", id: "sep-out" },
  { id: "logout", label: "Log out", icon: <LogOutIcon />, tone: "danger" },
]

function rowMenu(name: string): MenuEntry[] {
  return [
    { id: `${name}-open`, label: `Open ${name}` },
    { id: `${name}-pin`, label: "Pin to top" },
    { type: "separator", id: `${name}-sep` },
    { id: `${name}-hide`, label: "Hide", tone: "danger" },
  ]
}

const SORTS = ["Newest", "Oldest", "Name", "Size"]

/** A bar that shows the picked value, like a compact select. */
function RendersBarPickerDemo() {
  const [sort, setSort] = useState(SORTS[0])

  return (
    <div className="w-56">
      <DropdownMenu
        align="start"
        items={SORTS.map((option) => ({
          id: option,
          label: option,
          icon: option === sort ? <CheckIcon /> : <span className="size-4" />,
          onSelect: () => setSort(option),
        }))}
        trigger={
          <Bar
            tone="outline"
            icon={<ArrowDownWideNarrowIcon />}
            label={
              <>
                <span className="text-muted-foreground">Sort: </span>
                {sort}
              </>
            }
            trailing={
              <ChevronsUpDownIcon className="size-3.5 text-muted-foreground" />
            }
          />
        }
      />
    </div>
  )
}

export function RendersDropdownMenuDemo() {
  return (
    <>
      <RendersDemoCard label="Dropdown menu">
        <DropdownMenu label="Actions" items={MENU_ITEMS} />
      </RendersDemoCard>
      <RendersDemoCard label="trigger">
        <DropdownMenu
          items={MENU_ITEMS}
          align="end"
          trigger={
            <button
              type="button"
              aria-label="More actions"
              className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <EllipsisIcon aria-hidden className="size-4" />
            </button>
          }
        />
      </RendersDemoCard>
      <RendersDemoCard label="icon · shortcut">
        <DropdownMenu label="Edit" items={MENU_ITEMS_WITH_ICONS} />
      </RendersDemoCard>
      <RendersDemoCard label="disabled">
        <DropdownMenu label="Actions" items={MENU_ITEMS_DISABLED} />
      </RendersDemoCard>
      <RendersDemoCard label="groups · separators">
        <DropdownMenu label="File" items={MENU_GROUPED_ENTRIES} />
      </RendersDemoCard>
      <RendersDemoCard label="onSelect">
        <RendersDropdownSelectDemo />
      </RendersDemoCard>
      <RendersDemoCard label="bar trigger">
        <div className="w-56">
          <DropdownMenu
            items={NEW_ITEMS}
            align="start"
            trigger={<Bar icon={<PlusIcon />} label="New" shortcut="Ctrl+N" />}
          />
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="bar · workspace switcher">
        <div className="w-56">
          <DropdownMenu
            items={WORKSPACE_ITEMS}
            align="start"
            trigger={
              <Bar
                size="lg"
                icon={
                  <span className="grid size-6 place-items-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
                    A
                  </span>
                }
                label="Acme Inc."
                trailing={
                  <ChevronsUpDownIcon className="size-3.5 text-muted-foreground" />
                }
              />
            }
          />
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="bar · value picker">
        <RendersBarPickerDemo />
      </RendersDemoCard>
      <RendersDemoCard label="bar · hover to open">
        <div className="flex w-56 flex-col gap-0.5">
          {[
            { name: "Inbox", icon: <InboxIcon /> },
            { name: "Starred", icon: <StarIcon /> },
            { name: "Files", icon: <FolderIcon /> },
          ].map(({ name, icon }) => (
            <DropdownMenu
              key={name}
              items={rowMenu(name)}
              openOn="hover"
              side="right"
              align="start"
              trigger={
                <Bar
                  icon={icon}
                  label={name}
                  trailing={
                    <ChevronRightIcon className="size-3.5 text-muted-foreground" />
                  }
                />
              }
            />
          ))}
        </div>
      </RendersDemoCard>
    </>
  )
}
