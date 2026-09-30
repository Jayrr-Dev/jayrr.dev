"use client"

import { useState } from "react"
import {
  AppleIcon,
  AxeIcon,
  CoinsIcon,
  CrownIcon,
  FileIcon,
  FileTextIcon,
  FlaskConicalIcon,
  GemIcon,
  HardHatIcon,
  ImageIcon,
  KeyIcon,
  MusicIcon,
  ShieldIcon,
  ShirtIcon,
  SwordIcon,
  TrashIcon,
  WandIcon,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/standard/button"
import {
  ArrangeableGrid,
  ArrangeableGridRoot,
  ArrangeableGridSource,
  ArrangeableGridTarget,
  useArrangeableGrid,
  type ArrangeableSlots,
} from "@/components/standard/arrangeable-grid"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

type Gear = "head" | "body" | "weapon" | "offhand"

type Kind = {
  name: string
  icon: LucideIcon
  color: string
  stack?: number
  gear?: Gear
}

const KINDS = {
  sword: {
    name: "Sword",
    icon: SwordIcon,
    color: "text-sky-500",
    gear: "weapon",
  },
  axe: { name: "Axe", icon: AxeIcon, color: "text-orange-500", gear: "weapon" },
  wand: {
    name: "Wand",
    icon: WandIcon,
    color: "text-violet-500",
    gear: "weapon",
  },
  shield: {
    name: "Shield",
    icon: ShieldIcon,
    color: "text-amber-600",
    gear: "offhand",
  },
  helmet: {
    name: "Helmet",
    icon: HardHatIcon,
    color: "text-slate-400",
    gear: "head",
  },
  crown: {
    name: "Crown",
    icon: CrownIcon,
    color: "text-yellow-500",
    gear: "head",
  },
  tunic: {
    name: "Tunic",
    icon: ShirtIcon,
    color: "text-emerald-500",
    gear: "body",
  },
  potion: {
    name: "Potion",
    icon: FlaskConicalIcon,
    color: "text-rose-500",
    stack: 10,
  },
  apple: { name: "Apple", icon: AppleIcon, color: "text-red-500", stack: 20 },
  gem: { name: "Gem", icon: GemIcon, color: "text-cyan-400", stack: 5 },
  coins: {
    name: "Coins",
    icon: CoinsIcon,
    color: "text-yellow-600",
    stack: 99,
  },
  key: { name: "Key", icon: KeyIcon, color: "text-amber-400" },
} satisfies Record<string, Kind>

type KindId = keyof typeof KINDS

type Item = { id: string; kind: KindId; count: number }

let nextId = 0
function make(kind: KindId, count = 1): Item {
  return { id: `${kind}-${nextId++}`, kind, count }
}

const getId = (item: Item) => item.id

function labelOf(item: Item) {
  const kind = KINDS[item.kind]
  return item.count > 1 ? `${kind.name} ×${item.count}` : kind.name
}

// Same stackable kind: fill the target up to its limit, refuse otherwise.
function stack(target: Item, incoming: Item): Item | null {
  const limit = (KINDS[target.kind] as Kind).stack
  if (!limit || target.kind !== incoming.kind) return null
  if (target.count + incoming.count > limit) return null
  return { ...target, count: target.count + incoming.count }
}

function RendersItem({ item }: { item: Item }) {
  const kind = KINDS[item.kind]
  const Icon = kind.icon
  return (
    <span className="relative flex size-full items-center justify-center">
      <Icon className={`size-11/20 ${kind.color}`} strokeWidth={2.25} />
      {item.count > 1 ? (
        <span className="absolute right-0.5 bottom-0 text-2xs font-bold text-foreground tabular-nums text-shadow-2xs text-shadow-background">
          {item.count}
        </span>
      ) : null}
    </span>
  )
}

const renderItem = (item: Item) => <RendersItem item={item} />

const PALETTE: KindId[] = ["sword", "shield", "potion", "apple", "gem", "coins"]

function RendersInventory() {
  const backpack = useArrangeableGrid<Item>({
    columns: 4,
    rows: 4,
    getId,
    defaultValue: [
      make("sword"),
      make("helmet"),
      make("tunic"),
      null,
      make("shield"),
      make("potion", 3),
      make("axe"),
      null,
      make("wand"),
      make("gem", 2),
      make("apple", 6),
    ],
  })
  const hotbar = useArrangeableGrid<Item>({
    columns: 8,
    getId,
    defaultValue: [make("potion", 5), make("key"), null, make("coins", 42)],
  })

  return (
    <ArrangeableGridRoot>
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-wrap items-end justify-center gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-muted-foreground">
              Backpack · {backpack.count}/{backpack.capacity}
            </span>
            <ArrangeableGrid
              {...backpack.gridProps}
              label="Backpack"
              removable
              merge={stack}
              renderItem={renderItem}
              getItemLabel={labelOf}
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs text-muted-foreground">Drag in</span>
            <div className="grid grid-cols-2 gap-1">
              {PALETTE.map((kind) => (
                <div
                  key={kind}
                  className="size-12 rounded-md border border-dashed hover:bg-muted"
                >
                  <ArrangeableGridSource
                    label={`Add ${KINDS[kind].name}`}
                    create={() => make(kind)}
                    className="size-full"
                  >
                    <RendersItem item={{ id: kind, kind, count: 1 }} />
                  </ArrangeableGridSource>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ArrangeableGrid
            {...hotbar.gridProps}
            label="Hotbar"
            merge={stack}
            slotSize="sm"
            renderItem={renderItem}
            getItemLabel={labelOf}
          />
          <ArrangeableGridTarget>
            {({ isDragging, isOver }) => (
              <span
                className={
                  isDragging
                    ? "inline-flex scale-110 transition-transform"
                    : "inline-flex transition-transform"
                }
              >
                <Button
                  tone={isOver ? "danger" : "outline"}
                  size="sm"
                  iconOnly
                  aria-label="Drop here to delete"
                >
                  <TrashIcon />
                </Button>
              </span>
            )}
          </ArrangeableGridTarget>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Button size="sm" tone="outline" onClick={backpack.compact}>
            Sort backpack
          </Button>
          <Button
            size="sm"
            tone="outline"
            disabled={backpack.isFull}
            onClick={() => backpack.add(make("gem"))}
          >
            Add gem from code
          </Button>
          <Button size="sm" tone="ghost" onClick={backpack.clear}>
            Clear
          </Button>
        </div>
        <p className="max-w-sm text-center text-xs text-muted-foreground">
          Drag between the backpack and hotbar, onto a matching stack, out of
          the backpack to drop it, or onto the trash.
        </p>
      </div>
    </ArrangeableGridRoot>
  )
}

const GEAR_SLOTS: { gear: Gear; label: string; icon: LucideIcon }[] = [
  { gear: "head", label: "Head", icon: HardHatIcon },
  { gear: "body", label: "Body", icon: ShirtIcon },
  { gear: "weapon", label: "Weapon", icon: SwordIcon },
  { gear: "offhand", label: "Off hand", icon: ShieldIcon },
]

function RendersEquipment() {
  const [worn, setWorn] = useState<ArrangeableSlots<Item>>([
    make("helmet"),
    null,
    make("sword"),
    null,
  ])
  const [bag, setBag] = useState<ArrangeableSlots<Item>>([
    make("crown"),
    make("tunic"),
    make("axe"),
    make("shield"),
    make("apple", 4),
  ])

  return (
    <ArrangeableGridRoot>
      <div className="flex flex-wrap items-start justify-center gap-6">
        <div className="relative">
          <ArrangeableGrid
            columns={1}
            rows={4}
            label="Equipment"
            slotSize="lg"
            value={worn}
            onValueChange={setWorn}
            getId={getId}
            getItemLabel={labelOf}
            renderItem={renderItem}
            accept={(item, index) =>
              (KINDS[item.kind] as Kind).gear === GEAR_SLOTS[index].gear
            }
          />
          {/* Ghost icons mark what each empty slot takes. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 grid gap-1"
          >
            {GEAR_SLOTS.map(({ gear, icon: Icon }, index) => (
              <span
                key={gear}
                className="flex size-16 items-center justify-center"
              >
                {worn[index] ? null : (
                  <Icon className="size-7 text-muted-foreground/30" />
                )}
              </span>
            ))}
          </div>
        </div>
        <ArrangeableGrid
          columns={3}
          rows={3}
          label="Bag"
          value={bag}
          onValueChange={setBag}
          getId={getId}
          getItemLabel={labelOf}
          renderItem={renderItem}
          merge={stack}
        />
      </div>
    </ArrangeableGridRoot>
  )
}

type Upload = { id: string; name: string; type: string }

function iconFor(type: string) {
  if (type.startsWith("image/")) return ImageIcon
  if (type.startsWith("audio/")) return MusicIcon
  if (type.startsWith("text/") || type.includes("pdf")) return FileTextIcon
  return FileIcon
}

function RendersFileShelf() {
  const [files, setFiles] = useState<ArrangeableSlots<Upload>>([
    { id: "readme", name: "README.md", type: "text/markdown" },
    { id: "logo", name: "logo.png", type: "image/png" },
  ])

  return (
    <div className="flex flex-col items-center gap-2">
      <ArrangeableGrid
        columns={10}
        label="Shelf"
        removable
        value={files}
        onValueChange={setFiles}
        getId={(file) => file.id}
        getItemLabel={(file) => file.name}
        onDropData={(data) =>
          Array.from(data.files).map((file) => ({
            id: crypto.randomUUID(),
            name: file.name,
            type: file.type,
          }))
        }
        renderItem={(file) => {
          const Icon = iconFor(file.type)
          return (
            <span
              title={file.name}
              className="flex flex-col items-center gap-0.5"
            >
              <Icon className="size-5 text-muted-foreground" />
              <span className="max-w-11 truncate text-[9px] leading-none">
                {file.name}
              </span>
            </span>
          )
        }}
      />
      <p className="text-xs text-muted-foreground">
        Drop files from your computer onto a slot. Drag one off the shelf to
        remove it.
      </p>
    </div>
  )
}

const LETTERS = "ARRANGEABLE".split("")

function RendersLetterGrid() {
  return (
    <div className="flex flex-col items-center gap-2">
      <ArrangeableGrid<string>
        columns={5}
        rows={5}
        label="Letters"
        defaultValue={LETTERS.flatMap((letter, index) =>
          index % 2 ? [letter] : [letter, null]
        )}
        getItemLabel={(letter) => `letter ${letter}`}
        renderItem={(letter, { isOverlay }) => (
          <span
            className={`flex size-4/5 items-center justify-center rounded-sm bg-primary font-mono text-sm font-bold text-primary-foreground ${isOverlay ? "rotate-6" : ""}`}
          >
            {letter}
          </span>
        )}
      />
      <p className="text-xs text-muted-foreground">
        Tab in, then Enter to pick up, arrows to move, Enter to drop.
      </p>
    </div>
  )
}

export function RendersArrangeableGridDemo() {
  return (
    <div className="flex w-full flex-col gap-4">
      <RendersDemoCard
        label="inventory · linked grids, stacking, trash, drag in"
        fill
      >
        <RendersInventory />
      </RendersDemoCard>
      <RendersDemoCard label="equipment · slot rules" fill>
        <RendersEquipment />
      </RendersDemoCard>
      <RendersDemoCard label="1 × 10 · drop files in" fill>
        <RendersFileShelf />
      </RendersDemoCard>
      <RendersDemoCard label="5 × 5 · keyboard" fill>
        <RendersLetterGrid />
      </RendersDemoCard>
    </div>
  )
}
