"use client"

import {
  ChevronRightIcon,
  FileTextIcon,
  FolderIcon,
  ImageIcon,
  InboxIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
} from "lucide-react"

import { Bar } from "@/components/standard/bar"
import { DropdownMenu, type MenuEntry } from "@/components/standard/menu"
import { MENU_ITEMS_WITH_ICONS } from "@/features/standard-library/components/demos/shared/definesMenuItems"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const NEW_ITEMS: MenuEntry[] = [
  { id: "doc", label: "Document", icon: <FileTextIcon />, shortcut: "Ctrl+D" },
  { id: "folder", label: "Folder", icon: <FolderIcon />, shortcut: "Ctrl+F" },
  { id: "image", label: "Image", icon: <ImageIcon /> },
]

export function RendersBarDemo() {
  return (
    <>
      <RendersDemoCard label="Bar">
        <div className="w-64">
          <Bar icon={<PlusIcon />} label="New" shortcut="Ctrl+N" />
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="tone">
        <div className="flex w-64 flex-col gap-2">
          <Bar icon={<PlusIcon />} label="Ghost" shortcut="Ctrl+N" />
          <Bar
            tone="quiet"
            icon={<PlusIcon />}
            label="Quiet"
            shortcut="Ctrl+N"
          />
          <Bar
            tone="outline"
            icon={<PlusIcon />}
            label="Outline"
            shortcut="Ctrl+N"
          />
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="size">
        <div className="flex w-64 flex-col gap-2">
          <Bar size="sm" icon={<PlusIcon />} label="Small" shortcut="Ctrl+N" />
          <Bar icon={<PlusIcon />} label="Default" shortcut="Ctrl+N" />
          <Bar size="lg" icon={<PlusIcon />} label="Large" shortcut="Ctrl+N" />
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="nav list · active">
        <div className="flex w-64 flex-col gap-0.5">
          <Bar
            icon={<InboxIcon />}
            label="Inbox"
            active
            trailing={<span className="text-xs text-muted-foreground">12</span>}
          />
          <Bar icon={<SearchIcon />} label="Search" shortcut="Ctrl+K" />
          <Bar icon={<SettingsIcon />} label="Settings" shortcut="Ctrl+," />
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="asChild · link · static">
        <div className="flex w-64 flex-col gap-2">
          <Bar asChild icon={<FileTextIcon />} trailing={<ChevronRightIcon />}>
            <a href="#bar">Open as link</a>
          </Bar>
          <Bar
            asChild
            tone="quiet"
            icon={<FolderIcon />}
            trailing={<span className="text-xs text-muted-foreground">4 files</span>}
          >
            <div>Static row</div>
          </Bar>
          <Bar tone="outline" />
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="menu · click">
        <div className="w-64">
          <DropdownMenu
            items={NEW_ITEMS}
            trigger={<Bar icon={<PlusIcon />} label="New" shortcut="Ctrl+N" />}
          />
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="menu · hover">
        <div className="w-64">
          <DropdownMenu
            items={NEW_ITEMS}
            openOn="hover"
            side="right"
            align="start"
            trigger={
              <Bar
                icon={<PlusIcon />}
                label="New"
                trailing={
                  <ChevronRightIcon className="size-4 text-muted-foreground" />
                }
              />
            }
          />
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="menu · actions">
        <div className="w-64">
          <DropdownMenu
            items={MENU_ITEMS_WITH_ICONS}
            align="end"
            trigger={<Bar tone="outline" label="Actions" />}
          />
        </div>
      </RendersDemoCard>
    </>
  )
}
