"use client"

import {
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react"

import {
  Art,
  artEnters,
  artIdles,
  type ArtEnter,
  type ArtIdle,
  type ArtPieceProps,
} from "@/components/standard/art"
import { Badge } from "@/components/standard/badge"
import { Button } from "@/components/standard/button"
import { ColorGrade } from "@/components/standard/color-grade"
import { CopyButton } from "@/components/standard/copy-button"
import { Distort } from "@/components/standard/distort"
import { FlipDots } from "@/components/standard/flip-dots"
import { Gradient } from "@/components/standard/gradient"
import { HeadingHighlight } from "@/components/standard/heading"
import {
  HeroCard,
  heroCardPositions,
  type HeroCardPosition,
} from "@/components/standard/hero-card"
import { ImageShader } from "@/components/standard/image-shader"
import { Mask } from "@/components/standard/mask"
import { Noise } from "@/components/standard/noise"
import { Pattern } from "@/components/standard/pattern"
import { Screentone } from "@/components/standard/screentone"
import { Shader } from "@/components/standard/shader"
import type { SurfaceLayer } from "@/components/standard/surface"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"
import { cn } from "@/lib/utils"

/** Wraps layer children in a filter group that sits behind the content. */
const layerGroup = "absolute inset-0 -z-10 overflow-hidden rounded-xl"

type HeroLook = {
  label: string
  /** Text colour over the layers. */
  ink: "light" | "dark"
  /** Class for the highlighted figure in the title. */
  accent: string
  className?: string
  layers?: SurfaceLayer[]
  children?: ReactNode
  eyebrow: string
  title: [before: string, figure: string, after: string]
  subtitle: string
  position: HeroCardPosition
  subtitlePosition?: HeroCardPosition
  actionsPosition?: HeroCardPosition
  /** A cut-out SVG from /public/hero, placed in the layout as `trailing`. */
  art?: { src: string; className: string }
  /** In-layout art that isn't an image, e.g. a live component. */
  trailing?: ReactNode
  trailingPosition?: HeroCardPosition
  /** Free-floating art pieces that animate in, drawn in an Art layer. */
  scene?: ArtPieceProps[]
}

// Each look stacks a different mix of the Layer set: Surface data in
// `layers`, layer components (and filter groups around them) as children.
const heroLooks = {
  midnight: {
    label: "Midnight grid",
    ink: "light",
    accent: "text-sky-300",
    layers: [
      { type: "gradient", preset: "midnight" },
      { type: "gradient", preset: "primary", blend: "screen" },
      { type: "pattern", kind: "grid", opacity: 0.12 },
    ],
    children: <Noise opacity={0.2} blend="overlay" />,
    eyebrow: "Boilerplate",
    title: ["Ship in ", "7 days", ", not 7 months"],
    subtitle:
      "Auth, payments and email already wired, so you spend the week on the product.",
    position: "start",
    actionsPosition: "bottom-start",
    art: { src: "/hero/prism.svg", className: "w-44 md:w-64" },
    scene: [
      { src: "/hero/ring.svg", x: 94, y: 86, width: 150, depth: 0.5, enter: "zoom", idle: "spin", idleDuration: 40 },
      { src: "/hero/sparkle.svg", x: 70, y: 22, width: 40, depth: 2, enter: "pop", idle: "pulse" },
      { src: "/hero/sparkle.svg", x: 94, y: 30, width: 22, depth: 2, enter: "pop", idle: "pulse", idleDuration: 1.4 },
      { src: "/hero/sparkle.svg", x: 62, y: 80, width: 26, depth: 1.5, enter: "pop", idle: "pulse", idleDuration: 2.6 },
    ],
  },
  aurora: {
    label: "Aurora",
    ink: "light",
    accent: "text-emerald-300",
    children: (
      <>
        <Shader kind="aurora" speed={0.6} />
        <Gradient preset="scrim" />
        <Noise opacity={0.18} blend="overlay" />
      </>
    ),
    eyebrow: "Northern release",
    title: ["", "40%", " faster builds, overnight"],
    subtitle: "A new compiler, the same config. Upgrade in one command.",
    position: "bottom",
    art: { src: "/hero/orb.svg", className: "w-28 md:w-36" },
    trailingPosition: "top",
    scene: [
      { src: "/hero/pill.svg", x: 14, y: 22, width: 96, rotate: -24, depth: 1.5, enter: "spin", idle: "float" },
      { src: "/hero/ring.svg", x: 88, y: 24, width: 110, depth: 1, enter: "zoom", idle: "sway" },
      { src: "/hero/sparkle.svg", x: 76, y: 12, width: 24, depth: 2, enter: "pop", idle: "pulse" },
    ],
  },
  mesh: {
    label: "Grain mesh",
    ink: "light",
    accent: "text-yellow-200",
    children: (
      <>
        <Shader
          kind="mesh-gradient"
          speed={0.3}
          params={{
            colors: ["#ff5e62", "#845ef7", "#339af0", "#ffb86b"],
            distortion: 0.8,
            swirl: 0.4,
          }}
        />
        <Noise kind="grain" opacity={0.45} blend="overlay" />
      </>
    ),
    eyebrow: "Payments",
    title: ["Get paid in ", "135", " currencies"],
    subtitle: "One API for cards, wallets and bank debits.",
    position: "start",
    art: { src: "/hero/coins.svg", className: "w-48 md:w-72" },
    scene: [
      { src: "/hero/toast.svg", x: 76, y: 16, width: 230, depth: 2, enter: "slide-end", idle: "float", idleDuration: 4 },
      { src: "/hero/cursor.svg", x: 56, y: 78, width: 96, depth: 3, enter: "drop", idle: "float" },
    ],
  },
  manga: {
    label: "Manga",
    ink: "dark",
    accent: "text-red-600",
    className: "border-2 border-neutral-900",
    layers: [
      { type: "gradient", preset: "parchment" },
      { type: "pattern", kind: "sunburst", color: "rgb(0 0 0 / 0.08)" },
    ],
    children: (
      <>
        <Screentone kind="dots" tone="bottom" color="#111" opacity={0.3} />
        <Mask kind="fade" direction="top" softness={80} placement="behind">
          <Pattern kind="speed-lines" color="rgb(0 0 0 / 0.3)" />
        </Mask>
      </>
    ),
    eyebrow: "Chapter 1",
    title: ["", "10×", " the output. Zero burnout."],
    subtitle: "The planner that fights for your focus time.",
    position: "top-start",
    actionsPosition: "bottom-start",
    art: { src: "/hero/stickers.svg", className: "w-44 md:w-64" },
    trailingPosition: "bottom-end",
  },
  blueprint: {
    label: "Blueprint",
    ink: "light",
    accent: "text-cyan-200",
    layers: [{ type: "gradient", preset: "ocean" }],
    children: (
      <>
        <Mask kind="vignette" placement="behind">
          <Pattern kind="blueprint" color="rgb(255 255 255 / 0.55)" />
        </Mask>
        <Noise kind="paper" opacity={0.25} blend="soft-light" />
      </>
    ),
    eyebrow: "Infrastructure",
    title: ["Deploy to ", "30", " regions from one file"],
    subtitle: "Drafted once, built everywhere.",
    position: "top-start",
    actionsPosition: "bottom-start",
    scene: [
      { src: "/hero/stat-card.svg", x: 74, y: 70, width: "40%", depth: 1, enter: "rise", duration: 1100 },
      { src: "/hero/toast.svg", x: 84, y: 91, width: "30%", depth: 2, enter: "slide-end", idle: "float", idleDuration: 3.5 },
      { src: "/hero/cursor.svg", x: 56, y: 84, width: 80, depth: 3, enter: "pop", idle: "float", idleDuration: 2.5 },
    ],
  },
  synthwave: {
    label: "Synthwave",
    ink: "light",
    accent: "text-fuchsia-300",
    children: (
      <>
        <Shader kind="synthwave" preset="Outrun" speed={0.8} />
        <Gradient preset="vignette" />
        <Screentone kind="lines" tone="bottom" color="rgb(0 0 0 / 0.5)" />
      </>
    ),
    eyebrow: "Arcade mode",
    title: ["Level up in ", "1985", " style"],
    subtitle: "A retro game engine for the browser.",
    position: "top",
    art: { src: "/hero/neon-glyphs.svg", className: "w-56 md:w-80" },
    trailingPosition: "center",
    scene: [
      { src: "/hero/sparkle.svg", x: 12, y: 18, width: 30, enter: "pop", idle: "pulse" },
      { src: "/hero/sparkle.svg", x: 88, y: 14, width: 22, enter: "pop", idle: "pulse", idleDuration: 1.5 },
      { src: "/hero/sparkle.svg", x: 82, y: 58, width: 16, enter: "pop", idle: "pulse", idleDuration: 2.2 },
    ],
  },
  duotone: {
    label: "Duotone photo",
    ink: "light",
    accent: "text-orange-300",
    children: (
      <>
        <div className={layerGroup}>
          <ColorGrade
            preset="duotone"
            duotone={["#0b1a3a", "#ff9f6b"]}
            className="size-full"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/samples/sample-video-poster.jpg"
              alt=""
              className="size-full object-cover"
            />
          </ColorGrade>
        </div>
        <Gradient preset="scrim" />
        <Noise opacity={0.25} blend="overlay" />
      </>
    ),
    eyebrow: "Studio",
    title: ["", "4K", " renders in the browser"],
    subtitle: "Colour-grade, key and export without leaving the tab.",
    position: "bottom-start",
  },
  liquid: {
    label: "Liquid",
    ink: "light",
    accent: "text-amber-200",
    children: (
      <>
        {/* Oversized so the warp never pulls the card's edges in. */}
        <Distort
          kind="warp"
          strength={60}
          animate
          className="absolute -inset-20 -z-10"
        >
          <Gradient preset="sunset" />
          <Pattern kind="waves" color="rgb(255 255 255 / 0.25)" />
        </Distort>
        <Noise kind="grain" opacity={0.3} blend="overlay" />
      </>
    ),
    eyebrow: "Design tools",
    title: ["Shapes that ", "flow", ", not snap"],
    subtitle: "Vector editing with physics built in.",
    position: "end",
    scene: [
      { src: "/hero/blob.svg", x: 16, y: 50, width: 150, depth: 1, enter: "blur", idle: "float", idleDuration: 5 },
      { src: "/hero/orb.svg", x: 36, y: 20, width: 70, depth: 2, enter: "drop", idle: "float" },
      { src: "/hero/pill.svg", x: 10, y: 84, width: 90, rotate: 18, depth: 2.5, enter: "slide-start", idle: "sway" },
    ],
  },
  sakura: {
    label: "Sakura",
    ink: "dark",
    accent: "text-rose-600",
    layers: [
      { type: "gradient", preset: "peach" },
      { type: "pattern", kind: "sakura", opacity: 0.8 },
    ],
    children: (
      <Mask kind="fade" direction="top" softness={70} placement="behind">
        <Pattern kind="seigaiha" color="rgb(255 255 255 / 0.7)" />
      </Mask>
    ),
    eyebrow: "Spring collection",
    title: ["", "12", " new templates, freshly bloomed"],
    subtitle: "Soft palettes for journals, menus and invitations.",
    position: "top-start",
    scene: [
      { src: "/hero/blob.svg", x: 90, y: 88, width: 220, depth: 0.6, enter: "zoom", idle: "float", idleDuration: 6 },
      { src: "/hero/pill.svg", x: 84, y: 22, width: 92, rotate: 30, depth: 2, enter: "spin", idle: "sway" },
      { src: "/hero/sparkle.svg", x: 70, y: 70, width: 30, depth: 3, enter: "pop", idle: "pulse" },
    ],
  },
  terminal: {
    label: "Terminal",
    ink: "light",
    accent: "text-green-400",
    className: "font-mono",
    children: (
      <>
        <Shader kind="matrix" speed={0.6} />
        <Mask kind="spotlight" at="25% 35%" placement="behind">
          <div className="absolute inset-0 bg-black/80" />
        </Mask>
        <Gradient preset="vignette" />
      </>
    ),
    eyebrow: "$ npx create",
    title: ["Zero to prod in ", "1", " command"],
    subtitle: "Scaffold, test and deploy from your terminal.",
    position: "start",
    actionsPosition: "bottom-start",
    art: { src: "/hero/phone.svg", className: "w-28 md:w-40" },
  },
  chrome: {
    label: "Liquid metal",
    ink: "light",
    accent: "text-indigo-300",
    layers: [
      { type: "gradient", preset: "midnight" },
      { type: "pattern", kind: "dots", opacity: 0.15 },
    ],
    children: (
      <>
        {/* The shader reads the prism's silhouette and pours metal into it. */}
        <ImageShader
          kind="liquid-metal"
          src="/hero/prism.svg"
          params={{ colorBack: "#00000000", colorTint: "#c7d2fe", scale: 0.9 }}
          className="bottom-3/10 left-2/5"
        />
        <Gradient preset="spotlight" />
        <Noise opacity={0.15} blend="overlay" />
      </>
    ),
    eyebrow: "Hardware",
    title: ["Forged in ", "one", " piece of aluminium"],
    subtitle: "Liquid Metal on the Image Shader, reading an SVG's silhouette.",
    position: "bottom-start",
  },
  halftone: {
    label: "Halftone",
    ink: "light",
    accent: "text-yellow-300",
    children: (
      <>
        <ImageShader kind="halftone-dots" src="/fx/sample-scene.svg" speed={0} />
        <Gradient preset="scrim" />
      </>
    ),
    eyebrow: "Print",
    title: ["Posters in ", "3", " clicks"],
    subtitle: "Halftone, risograph and screen-print effects for any photo.",
    position: "bottom-start",
    actionsPosition: "top-end",
  },
  flipdots: {
    label: "Flip-Dots",
    ink: "light",
    accent: "text-amber-300",
    children: (
      <>
        {/* A tall board, cropped by the card, so tiny discs fill it edge to edge. */}
        <div
          aria-hidden
          className={cn(layerGroup, "flex items-center bg-neutral-950 opacity-45")}
        >
          <FlipDots
            cols={112}
            rows={96}
            pattern="ripple"
            sweep="none"
            variant="flat"
            color="oklch(0.8 0.17 70)"
            bare
          />
        </div>
        <Gradient preset="vignette" />
        <Gradient preset="scrim" opacity={0.7} />
      </>
    ),
    eyebrow: "Live status",
    title: ["", "99.99%", " uptime, on the board"],
    subtitle: "A status page that flips in real time when anything changes.",
    position: "start",
    actionsPosition: "bottom-start",
    trailing: (
      <FlipDots
        cols={56}
        rows={9}
        pattern="marquee"
        text="ALL SYSTEMS GO"
        interval={80}
        color="oklch(0.8 0.17 70)"
        className="w-56 md:w-80"
      />
    ),
  },
} satisfies Record<string, HeroLook>

type HeroLookName = keyof typeof heroLooks

const heroLookNames = Object.keys(heroLooks) as HeroLookName[]

function RendersHeroLook({
  name,
  size,
  position,
  subtitlePosition,
  actionsPosition,
  trailingPosition,
  scene,
  parallax = 12,
  overlay,
}: {
  name: HeroLookName
  size?: "sm" | "default" | "lg"
  position?: HeroCardPosition
  subtitlePosition?: HeroCardPosition
  actionsPosition?: HeroCardPosition
  trailingPosition?: HeroCardPosition
  /** Overrides the look's scene, for the editor. */
  scene?: ArtPieceProps[]
  parallax?: number
  /** Drawn on top of everything, for editing handles. */
  overlay?: ReactNode
}) {
  const look: HeroLook = heroLooks[name]
  const light = look.ink === "light"
  const [before, figure, after] = look.title

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-xl",
        light ? "text-white" : "text-neutral-900",
        look.className
      )}
    >
      <HeroCard
        tone="ghost"
        size={size}
        layers={look.layers}
        position={position ?? look.position}
        subtitlePosition={subtitlePosition ?? look.subtitlePosition}
        actionsPosition={actionsPosition ?? look.actionsPosition}
        trailing={
          look.trailing ??
          (look.art ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={look.art.src}
              alt=""
              className={cn("h-auto max-w-full", look.art.className)}
            />
          ) : undefined)
        }
        trailingPosition={trailingPosition ?? look.trailingPosition}
        leading={
          <Badge appearance="outline" tone="inverse">
            {look.eyebrow}
          </Badge>
        }
        title={
          <>
            {before}
            <HeadingHighlight>
              <span className={look.accent}>{figure}</span>
            </HeadingHighlight>
            {after}
          </>
        }
        subtitle={look.subtitle}
        actions={
          <>
            <Button size={size === "sm" ? "default" : "lg"} tone="inverse">
              Get started
            </Button>
            <Button
              size={size === "sm" ? "default" : "lg"}
              tone="inverse-outline"
            >
              Learn more
            </Button>
          </>
        }
      >
        {look.children}
        {(scene ?? look.scene) ? (
          <Art items={scene ?? look.scene} parallax={parallax} />
        ) : null}
        {overlay}
      </HeroCard>
    </div>
  )
}

// Tiny previews for the look picker, so each swatch hints at its layers.
const heroSwatches: Record<HeroLookName, string> = {
  midnight: "linear-gradient(180deg, #4b5280, #0b1026)",
  aurora: "linear-gradient(180deg, #020617 20%, #22e3a1 60%, #a855f7)",
  mesh: "linear-gradient(135deg, #ff5e62, #845ef7, #339af0, #ffb86b)",
  manga:
    "radial-gradient(#111 1px, transparent 1.2px) 0 0 / 5px 5px, linear-gradient(#fffef0, #e9dcc0)",
  blueprint:
    "linear-gradient(rgb(255 255 255 / .35) 1px, transparent 1px) 0 0 / 8px 8px, linear-gradient(135deg, #7dd3e0, #1e3a8a)",
  synthwave:
    "linear-gradient(180deg, #060016 45%, #ff3864 45% 58%, #060016 58%)",
  duotone: "linear-gradient(135deg, #0b1a3a, #ff9f6b)",
  liquid: "linear-gradient(135deg, #f6c26b, #e0455e, #7a2b8c)",
  sakura: "linear-gradient(135deg, #fde7d8, #f9b9a8)",
  terminal:
    "repeating-linear-gradient(90deg, #000 0 6px, #0a3d1a 6px 7px), #000",
  chrome: "radial-gradient(circle at 70% 35%, #c7d2fe, #1e1b4b 60%)",
  halftone:
    "radial-gradient(#ddd 1.2px, transparent 1.6px) 0 0 / 5px 5px, #333",
  flipdots:
    "radial-gradient(oklch(0.8 0.17 70) 1.3px, transparent 1.7px) 0 0 / 5px 5px, #0a0a0a",
}

type EditablePart = "title" | "subtitle" | "actions" | "trailing"

const editableParts: { id: EditablePart; label: string; dot: string }[] = [
  { id: "title", label: "Title", dot: "bg-sky-400" },
  { id: "subtitle", label: "Subtitle", dot: "bg-violet-400" },
  { id: "actions", label: "Actions", dot: "bg-amber-400" },
  { id: "trailing", label: "Art", dot: "bg-emerald-400" },
]

type EditorLayout = Record<EditablePart, HeroCardPosition>

function layoutOf(look: HeroLook): EditorLayout {
  return {
    title: look.position,
    subtitle: look.subtitlePosition ?? look.position,
    actions: look.actionsPosition ?? look.position,
    trailing: look.trailingPosition ?? "end",
  }
}

function pieceName(piece: ArtPieceProps) {
  return piece.src?.split("/").pop()?.replace(/\.svg$/, "") ?? "piece"
}

function InspectorSection({
  title,
  aside,
  children,
}: {
  title: string
  aside?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="flex min-w-0 flex-col gap-2.5 rounded-xl border border-border bg-background/60 p-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {title}
        </h3>
        {aside}
      </div>
      {children}
    </section>
  )
}

/** Every part's dot in its cell; clicking a cell moves the selected part. */
function PositionPad({
  layout,
  part,
  onPlace,
}: {
  layout: EditorLayout
  part: EditablePart
  onPlace: (position: HeroCardPosition) => void
}) {
  return (
    <div
      role="radiogroup"
      aria-label={`${editableParts.find((p) => p.id === part)?.label} position`}
      className="grid aspect-16/10 grid-cols-3 grid-rows-3 gap-1 rounded-lg border border-border bg-muted/30 p-1"
    >
      {heroCardPositions.map((position) => {
        const here = editableParts.filter((p) => layout[p.id] === position)
        const selected = layout[part] === position

        return (
          <button
            key={position}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={position}
            title={position}
            onClick={() => onPlace(position)}
            className={cn(
              "flex items-center justify-center gap-1 rounded-md transition-colors hover:bg-muted",
              selected && "bg-muted ring-1 ring-ring"
            )}
          >
            {here.map((p) => (
              <span
                key={p.id}
                className={cn(
                  "size-2 rounded-full",
                  p.dot,
                  p.id === part && "size-2.5 ring-2 ring-background"
                )}
              />
            ))}
          </button>
        )
      })}
    </div>
  )
}

/**
 * Editing handles over the card: a 3×3 grid that places the selected part,
 * and a draggable dot per art piece.
 */
function EditorOverlay({
  layout,
  part,
  onPlace,
  scene,
  selectedPiece,
  onSelectPiece,
  onMovePiece,
}: {
  layout: EditorLayout
  part: EditablePart
  onPlace: (position: HeroCardPosition) => void
  scene: ArtPieceProps[]
  selectedPiece: number
  onSelectPiece: (index: number) => void
  onMovePiece: (index: number, x: number, y: number) => void
}) {
  const [dragging, setDragging] = useState<number | null>(null)

  function drags(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragging === null) return
    const box = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - box.left) / box.width) * 100
    const y = ((event.clientY - box.top) / box.height) * 100
    onMovePiece(
      dragging,
      Math.round(Math.min(100, Math.max(0, x))),
      Math.round(Math.min(100, Math.max(0, y)))
    )
  }

  const dot = editableParts.find((p) => p.id === part)?.dot

  return (
    <div
      className="absolute inset-0 z-30 grid grid-cols-3 grid-rows-3 rounded-xl outline-2 -outline-offset-2 outline-white/60 outline-dashed"
      onPointerMove={drags}
      onPointerUp={() => setDragging(null)}
      onPointerCancel={() => setDragging(null)}
    >
      {heroCardPositions.map((position) => (
        <button
          key={position}
          type="button"
          aria-label={`Place ${part} ${position}`}
          onClick={() => onPlace(position)}
          className={cn(
            "border border-dashed border-white/15 transition-colors hover:bg-white/10",
            layout[part] === position && "bg-white/10"
          )}
        >
          {layout[part] === position ? (
            <span className={cn("mx-auto block size-3 rounded-full", dot)} />
          ) : null}
        </button>
      ))}
      {scene.map((piece, index) => (
        <button
          key={index}
          type="button"
          aria-label={`Move ${pieceName(piece)}`}
          onPointerDown={(event) => {
            event.currentTarget.parentElement?.setPointerCapture(event.pointerId)
            onSelectPiece(index)
            setDragging(index)
          }}
          className={cn(
            "absolute top-(--piece-y) left-(--piece-x) flex -translate-x-1/2 -translate-y-1/2 cursor-grab items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs font-medium text-white shadow-lg ring-1 ring-white/30 backdrop-blur active:cursor-grabbing",
            index === selectedPiece && "bg-success text-success-foreground ring-white"
          )}
          style={
            {
              "--piece-x": `${piece.x ?? 50}%`,
              "--piece-y": `${piece.y ?? 50}%`,
            } as CSSProperties
          }
        >
          <span className="size-1.5 rounded-full bg-current" />
          {pieceName(piece)}
        </button>
      ))}
    </div>
  )
}

function sceneCode(scene: ArtPieceProps[]) {
  return scene
    .map((piece) => {
      const props = Object.entries(piece)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) =>
          typeof value === "string" && key !== "width"
            ? `${key}="${value}"`
            : `${key}={${JSON.stringify(value)}}`
        )
        .join(" ")
      return `    <ArtPiece ${props} />`
    })
    .join("\n")
}

function heroCode(
  look: HeroLook,
  layout: EditorLayout,
  scene: ArtPieceProps[],
  parallax: number
) {
  const lines = [
    "<HeroCard",
    `  position="${layout.title}"`,
    layout.subtitle !== layout.title && `  subtitlePosition="${layout.subtitle}"`,
    layout.actions !== layout.title && `  actionsPosition="${layout.actions}"`,
    (look.art || look.trailing) && `  trailingPosition="${layout.trailing}"`,
    `  title="${look.title.join("")}"`,
    `  subtitle="${look.subtitle}"`,
    "  actions={<Button>Get started</Button>}",
    ">",
    `  {/* ${look.label} layers */}`,
    scene.length > 0 &&
      [`  <Art parallax={${parallax}}>`, sceneCode(scene), "  </Art>"].join("\n"),
    "</HeroCard>",
  ]
  return lines.filter(Boolean).join("\n")
}

function RendersHeroCardEditor() {
  const [name, setName] = useState<HeroLookName>("midnight")
  const look: HeroLook = heroLooks[name]
  const [layout, setLayout] = useState<EditorLayout>(() => layoutOf(look))
  const [part, setPart] = useState<EditablePart>("title")
  const [scene, setScene] = useState<ArtPieceProps[]>(look.scene ?? [])
  const [selectedPiece, setSelectedPiece] = useState(0)
  const [editing, setEditing] = useState(false)
  const [parallax, setParallax] = useState(true)
  // Bumped to remount the card, which plays the scene's entrance again.
  const [plays, setPlays] = useState(0)

  const piece = scene[selectedPiece]
  const parts = look.art || look.trailing
    ? editableParts
    : editableParts.filter((p) => p.id !== "trailing")

  // A new look starts from its own layout and scene.
  function picksLook(next: HeroLookName) {
    const nextLook: HeroLook = heroLooks[next]
    setName(next)
    setLayout(layoutOf(nextLook))
    setScene(nextLook.scene ?? [])
    setSelectedPiece(0)
    if (!nextLook.art && !nextLook.trailing && part === "trailing") setPart("title")
  }

  function places(position: HeroCardPosition) {
    setLayout((current) => ({ ...current, [part]: position }))
  }

  function updatesPiece(index: number, patch: Partial<ArtPieceProps>) {
    setScene((current) =>
      current.map((item, i) => (i === index ? { ...item, ...patch } : item))
    )
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <RendersHeroLook
        key={`${name}-${plays}`}
        name={name}
        position={layout.title}
        subtitlePosition={layout.subtitle}
        actionsPosition={layout.actions}
        trailingPosition={layout.trailing}
        scene={scene}
        parallax={parallax && !editing ? 12 : 0}
        overlay={
          editing ? (
            <EditorOverlay
              layout={layout}
              part={part}
              onPlace={places}
              scene={scene}
              selectedPiece={selectedPiece}
              onSelectPiece={setSelectedPiece}
              onMovePiece={(index, x, y) => updatesPiece(index, { x, y })}
            />
          ) : null
        }
      />

      <aside className="grid items-start gap-3 md:grid-cols-2 xl:grid-cols-4">
        <InspectorSection title="Look" aside={<span className="text-xs">{look.label}</span>}>
          <div className="grid grid-cols-6 gap-1.5">
            {heroLookNames.map((option) => (
              <button
                key={option}
                type="button"
                title={heroLooks[option].label}
                aria-label={heroLooks[option].label}
                aria-pressed={option === name}
                onClick={() => picksLook(option)}
                className={cn(
                  "aspect-square rounded-md ring-1 ring-border transition-transform hover:scale-105",
                  option === name && "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                )}
                style={{ background: heroSwatches[option] }}
              />
            ))}
          </div>
        </InspectorSection>

        <InspectorSection
          title="Layout"
          aside={
            <Button
              size="xs"
              tone={editing ? "default" : "outline"}
              onClick={() => setEditing((on) => !on)}
            >
              {editing ? "Done" : "Edit on card"}
            </Button>
          }
        >
          <div className="flex flex-wrap gap-1">
            {parts.map((p) => (
              <button
                key={p.id}
                type="button"
                aria-pressed={p.id === part}
                onClick={() => setPart(p.id)}
                className={cn(
                  "flex h-7 items-center gap-1.5 rounded-md border border-transparent px-2 text-xs text-muted-foreground transition-colors hover:text-foreground",
                  p.id === part && "border-border bg-muted text-foreground"
                )}
              >
                <span className={cn("size-2 rounded-full", p.dot)} />
                {p.label}
              </button>
            ))}
          </div>
          <PositionPad layout={layout} part={part} onPlace={places} />
          <p className="text-xs text-muted-foreground">
            {editableParts.find((p) => p.id === part)?.label} ·{" "}
            <span className="font-mono">{layout[part]}</span>
          </p>
        </InspectorSection>

        {scene.length > 0 ? (
          <InspectorSection title="Scene" aside={<span className="text-xs">{scene.length} pieces</span>}>
            <div className="flex flex-wrap gap-1">
              {scene.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  aria-pressed={index === selectedPiece}
                  onClick={() => setSelectedPiece(index)}
                  className={cn(
                    "flex h-7 items-center gap-1.5 rounded-md border border-border px-1.5 text-xs text-muted-foreground",
                    index === selectedPiece && "border-foreground/40 bg-muted text-foreground"
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.src} alt="" className="size-4 object-contain" />
                  {pieceName(item)}
                </button>
              ))}
            </div>
            {piece ? (
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <label className="flex flex-col gap-1">
                  Enter
                  <NativeSelect
                    size="sm"
                    value={piece.enter ?? "rise"}
                    onChange={(event) =>
                      updatesPiece(selectedPiece, { enter: event.target.value as ArtEnter })
                    }
                  >
                    {artEnters.map((enter) => (
                      <NativeSelectOption key={enter} value={enter}>
                        {enter}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </label>
                <label className="flex flex-col gap-1">
                  Idle
                  <NativeSelect
                    size="sm"
                    value={piece.idle ?? "none"}
                    onChange={(event) =>
                      updatesPiece(selectedPiece, { idle: event.target.value as ArtIdle })
                    }
                  >
                    {artIdles.map((idle) => (
                      <NativeSelectOption key={idle} value={idle}>
                        {idle}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </label>
                <label className="col-span-2 flex items-center gap-2">
                  <span className="w-10">Depth</span>
                  <input
                    type="range"
                    min={0.2}
                    max={4}
                    step={0.1}
                    value={piece.depth ?? 1}
                    onChange={(event) =>
                      updatesPiece(selectedPiece, { depth: Number(event.target.value) })
                    }
                    className="flex-1 accent-foreground"
                  />
                  <span className="w-7 text-right font-mono">{(piece.depth ?? 1).toFixed(1)}</span>
                </label>
                {typeof (piece.width ?? 120) === "number" ? (
                  <label className="col-span-2 flex items-center gap-2">
                    <span className="w-10">Size</span>
                    <input
                      type="range"
                      min={16}
                      max={360}
                      step={2}
                      value={Number(piece.width ?? 120)}
                      onChange={(event) =>
                        updatesPiece(selectedPiece, { width: Number(event.target.value) })
                      }
                      className="flex-1 accent-foreground"
                    />
                    <span className="w-7 text-right font-mono">{piece.width ?? 120}</span>
                  </label>
                ) : null}
                <p className="col-span-2 font-mono">
                  x {piece.x ?? 50}% · y {piece.y ?? 50}%
                  {editing ? "" : " — Edit on card to drag"}
                </p>
              </div>
            ) : null}
          </InspectorSection>
        ) : null}

        <InspectorSection title="Motion">
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" tone="outline" onClick={() => setPlays((n) => n + 1)}>
              Replay
            </Button>
            <Button
              size="sm"
              tone={parallax ? "default" : "outline"}
              aria-pressed={parallax}
              onClick={() => setParallax((on) => !on)}
            >
              Parallax {parallax ? "on" : "off"}
            </Button>
          </div>
          <CopyButton
            size="sm"
            tone="outline"
            className="self-start"
            value={() => heroCode(look, layout, scene, parallax ? 12 : 0)}
          >
            Copy JSX
          </CopyButton>
          <p className="text-xs text-muted-foreground">
            Copies the layout and scene as JSX.
          </p>
        </InspectorSection>
      </aside>
    </div>
  )
}

export function RendersHeroCardDemo() {
  return (
    <div data-fill className="flex w-full flex-col gap-3">
      <RendersDemoCard label="editor">
        <RendersHeroCardEditor />
      </RendersDemoCard>
      <RendersDemoCard label="looks">
        <div className="grid w-full gap-3 md:grid-cols-2">
          {heroLookNames
            .filter((name) => name !== "midnight")
            .map((name) => (
              <RendersHeroLook key={name} name={name} size="sm" />
            ))}
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="tone outline · no layers">
        <HeroCard
          tone="outline"
          position="center"
          level={1}
          title="One board for every crew and job"
          subtitle="Hours, jobs and payroll in one place."
          actions={<Button size="lg">Start free</Button>}
        />
      </RendersDemoCard>
    </div>
  )
}
