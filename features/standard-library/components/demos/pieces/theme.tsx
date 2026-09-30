"use client"

import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

/** Name of the theme declared in globals.css. */
const THEME_NAME = "Minimalist"

const SCOPES = ["light", "dark"] as const

type Token = {
  name: string
  /** Text token drawn as "Aa" on the swatch, usually `<name>-foreground`. */
  on?: string
  /** Drawn as a border (or ring) instead of a fill. */
  line?: "border" | "ring"
}

const SURFACES: Token[] = [
  { name: "background", on: "foreground" },
  { name: "card", on: "card-foreground" },
  { name: "popover", on: "popover-foreground" },
  { name: "primary", on: "primary-foreground" },
  { name: "secondary", on: "secondary-foreground" },
  { name: "muted", on: "muted-foreground" },
  { name: "accent", on: "accent-foreground" },
  { name: "destructive" },
]

const LINES: Token[] = [
  { name: "border", line: "border" },
  { name: "input", line: "border" },
  { name: "ring", line: "ring" },
]

const CHARTS: Token[] = [1, 2, 3, 4, 5].map((n) => ({ name: `chart-${n}` }))

const SIDEBAR: Token[] = [
  { name: "sidebar", on: "sidebar-foreground" },
  { name: "sidebar-primary", on: "sidebar-primary-foreground" },
  { name: "sidebar-accent", on: "sidebar-accent-foreground" },
  { name: "sidebar-border", line: "border" },
  { name: "sidebar-ring", line: "ring" },
]

const SCROLLBAR: Token[] = [
  { name: "scrollbar-thumb" },
  { name: "scrollbar-thumb-hover" },
]

// Full class names so Tailwind finds them in the source.
const RADII = [
  { name: "sm", className: "rounded-sm" },
  { name: "md", className: "rounded-md" },
  { name: "lg", className: "rounded-lg" },
  { name: "xl", className: "rounded-xl" },
  { name: "2xl", className: "rounded-2xl" },
  { name: "3xl", className: "rounded-3xl" },
  { name: "4xl", className: "rounded-4xl" },
] as const

const FONTS = [
  { name: "sans", className: "font-sans" },
  { name: "heading", className: "font-heading" },
  { name: "display", className: "font-display" },
  { name: "mono", className: "font-mono" },
] as const

/**
 * Writes a computed value into the element once it mounts, so the reference
 * always shows what globals.css currently declares.
 */
function readsInto(read: (element: HTMLElement) => string) {
  return (element: HTMLElement | null) => {
    if (element) {
      element.textContent = read(element) || "—"
    }
  }
}

type Matrix = readonly [
  readonly [number, number, number],
  readonly [number, number, number],
  readonly [number, number, number],
]

function multiplies(m: Matrix, [x, y, z]: number[]) {
  return m.map((row) => row[0] * x + row[1] * y + row[2] * z)
}

// CSS Color 4 matrices: Bradford D50 → D65, then XYZ → LMS → Oklab.
const D50_TO_D65: Matrix = [
  [0.955473421488075, -0.02309845494876471, 0.06325924320057072],
  [-0.0283697093338637, 1.0099953980813041, 0.021041441191917323],
  [0.012314014864481998, -0.020507649298898964, 1.330365926242124],
]
const XYZ_TO_LMS: Matrix = [
  [0.819022437996703, 0.3619062600528904, -0.1288737815209879],
  [0.0329836539323885, 0.9292868615863434, 0.0361446663506424],
  [0.0481771893596242, 0.2642395317527308, 0.6335478284694309],
]
const LMS_TO_OKLAB: Matrix = [
  [0.210454268309314, 0.7936177747023054, -0.0040720430116193],
  [1.9779985324311684, -2.4285922420485799, 0.450593709617411],
  [0.0259040424655478, 0.7827717124575296, -0.8086757549230774],
]

const rounds = (value: number, digits: number) =>
  String(Number(value.toFixed(digits)))

/**
 * The build rewrites oklch() tokens as lab(), and that is what the browser
 * reports. Turn them back into oklch() so they read like globals.css.
 */
function formatsColor(raw: string) {
  const match = raw.match(
    /^lab\(\s*([-\d.e]+)%?\s+([-\d.e]+)\s+([-\d.e]+)\s*(?:\/\s*([\d.e]+%?))?\s*\)$/
  )
  if (!match) return raw

  const [lightness, a, b] = match.slice(1, 4).map(Number)
  const fy = (lightness + 16) / 116
  const inverts = (t: number) =>
    t ** 3 > 216 / 24389 ? t ** 3 : (116 * t - 16) / (24389 / 27)
  const xyzD50 = [
    0.96422 * inverts(fy + a / 500),
    lightness > 8 ? fy ** 3 : lightness / (24389 / 27),
    0.82521 * inverts(fy - b / 200),
  ]
  const lms = multiplies(XYZ_TO_LMS, multiplies(D50_TO_D65, xyzD50)).map(
    Math.cbrt
  )
  const [l, okA, okB] = multiplies(LMS_TO_OKLAB, lms)

  const chroma = Math.hypot(okA, okB)
  const grey = chroma < 0.0005
  const hue = (Math.atan2(okB, okA) * 180) / Math.PI
  const alpha = match[4]
    ? ` / ${match[4].endsWith("%") ? match[4] : `${Number(match[4]) * 100}%`}`
    : ""

  return `oklch(${rounds(l, 3)} ${grey ? 0 : rounds(chroma, 3)} ${
    grey ? 0 : rounds((hue + 360) % 360, 1)
  }${alpha})`
}

function RendersTokenValue({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  return (
    <code
      ref={readsInto((element) =>
        formatsColor(
          getComputedStyle(element).getPropertyValue(`--${name}`).trim()
        )
      )}
      className={`truncate font-mono text-[11px] text-muted-foreground ${className ?? ""}`}
    />
  )
}

function RendersSwatch({ token }: { token: Token }) {
  const fill = `var(--${token.name})`

  if (token.line) {
    return (
      <div
        className="h-9 rounded-md bg-background"
        style={
          token.line === "ring"
            ? { boxShadow: `0 0 0 3px ${fill}` }
            : { border: `2px solid ${fill}` }
        }
      />
    )
  }

  return (
    <div
      className="flex h-9 items-center rounded-md border border-border px-2.5 text-sm font-medium"
      style={{
        background: fill,
        color: token.on ? `var(--${token.on})` : undefined,
      }}
    >
      {token.on ? "Aa" : null}
    </div>
  )
}

/** One row per token: its name, then a swatch and value in each scope. */
function RendersTokenTable({ tokens }: { tokens: Token[] }) {
  return (
    <div className="grid w-full grid-cols-[minmax(7rem,auto)_1fr_1fr] items-center gap-x-3 gap-y-2">
      <span />
      {SCOPES.map((scope) => (
        <span
          key={scope}
          className="font-mono text-[11px] text-muted-foreground uppercase"
        >
          {scope}
        </span>
      ))}
      {tokens.map((token) => (
        <RendersTokenRow key={token.name} token={token} />
      ))}
    </div>
  )
}

function RendersTokenRow({ token }: { token: Token }) {
  return (
    <>
      <div className="flex min-w-0 flex-col">
        <code className="font-mono text-xs">--{token.name}</code>
        {token.on ? (
          <code className="font-mono text-[11px] text-muted-foreground">
            on --{token.on}
          </code>
        ) : null}
      </div>
      {SCOPES.map((scope) => (
        // The .light / .dark class re-declares every token for this cell.
        <div
          key={scope}
          className={`${scope} flex min-w-0 flex-col gap-1 rounded-lg bg-background p-1.5 text-foreground`}
        >
          <RendersSwatch token={token} />
          <RendersTokenValue name={token.name} />
          {token.on ? (
            <RendersTokenValue name={token.on} className="opacity-70" />
          ) : null}
        </div>
      ))}
    </>
  )
}

function RendersRadiusScale() {
  return (
    <div className="flex flex-wrap items-end gap-3">
      {RADII.map((radius) => (
        <div key={radius.name} className="flex flex-col items-center gap-1.5">
          <div
            className={`size-14 border border-border bg-muted ${radius.className}`}
          />
          <code className="font-mono text-xs">{radius.className}</code>
          <code
            ref={readsInto((element) => {
              const box = element.previousElementSibling
                ?.previousElementSibling as HTMLElement | null
              return box ? getComputedStyle(box).borderTopLeftRadius : ""
            })}
            className="font-mono text-[11px] text-muted-foreground"
          />
        </div>
      ))}
    </div>
  )
}

function RendersFontSamples() {
  return (
    <div className="flex w-full flex-col gap-3">
      {FONTS.map((font) => (
        <div key={font.name} className="flex flex-col gap-0.5">
          <span className={`${font.className} text-xl`}>
            The quick brown fox jumps over the lazy dog
          </span>
          <code className="font-mono text-[11px] text-muted-foreground">
            {font.className} ·{" "}
            <span
              ref={readsInto((element) => {
                const sample = element.parentElement
                  ?.previousElementSibling as HTMLElement | null
                return sample
                  ? getComputedStyle(sample).fontFamily.split(",")[0]
                  : ""
              })}
            />
          </code>
        </div>
      ))}
    </div>
  )
}

export function RendersThemeDemo() {
  return (
    <div data-fill className="flex w-full flex-col gap-3">
      <RendersDemoCard label="theme">
        <div className="flex flex-col gap-0.5">
          <span className="text-lg font-medium tracking-tight">
            {THEME_NAME}
          </span>
          <span className="text-sm text-muted-foreground">
            Neutral greys with no hue, a red destructive and a 0.625rem
            radius. Light and dark share every token name.
          </span>
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="surfaces · bg-<token> text-<token>-foreground">
        <RendersTokenTable tokens={SURFACES} />
      </RendersDemoCard>
      <RendersDemoCard label="lines · border-border border-input ring-ring">
        <RendersTokenTable tokens={LINES} />
      </RendersDemoCard>
      <RendersDemoCard label="charts · chart-1 … chart-5">
        <RendersTokenTable tokens={CHARTS} />
      </RendersDemoCard>
      <RendersDemoCard label="sidebar">
        <RendersTokenTable tokens={SIDEBAR} />
      </RendersDemoCard>
      <RendersDemoCard label="scrollbar">
        <RendersTokenTable tokens={SCROLLBAR} />
      </RendersDemoCard>
      <RendersDemoCard label="radius · --radius scale">
        <RendersRadiusScale />
      </RendersDemoCard>
      <RendersDemoCard label="fonts">
        <RendersFontSamples />
      </RendersDemoCard>
    </div>
  )
}
