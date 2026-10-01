"use client"

import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "cn"
import { StarIcon } from "lucide-react"

import { FieldLabel } from "@/components/standard/field-label"
import { useControllableState } from "@/hooks/use-controllable-state"

type RaterTone =
  "default" | "quiet" | "outline" | "success" | "warning" | "info" | "danger"
type RaterSize = "xs" | "sm" | "default" | "lg" | "xl"
type RaterEffect =
  | "none"
  | "pop"
  | "bounce"
  | "wiggle"
  | "spin"
  | "jelly"
  | "flip"
  | "drop"
  | "heartbeat"
  | "tada"
  | "glow"
  | "burst"
  | "ripple"
  | "sparkle"
  | "cascade"
  | "wave"

type EffectContext = { color: string; size: number }

type EffectSpec = {
  keyframes: Keyframe[] | ((context: EffectContext) => Keyframe[])
  options: KeyframeAnimationOptions
  /** target: the chosen icon. new: each newly filled icon. all: every filled icon. */
  spread?: "target" | "new" | "all"
  /** Decoration drawn around the chosen icon, in the tone colour. */
  flourish?: (host: HTMLElement, context: EffectContext) => void
}

const POP_KEYFRAMES: Keyframe[] = [
  { transform: "scale(1)" },
  { transform: "scale(1.4)", offset: 0.4 },
  { transform: "scale(0.9)", offset: 0.7 },
  { transform: "scale(1)" },
]

// Draws a throwaway node centred on the icon, animates it, then removes it.
function spawn(
  host: HTMLElement,
  style: Partial<CSSStyleDeclaration>,
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions
) {
  const node = document.createElement("span")
  node.setAttribute("aria-hidden", "true")
  Object.assign(node.style, {
    position: "absolute",
    left: "50%",
    top: "50%",
    pointerEvents: "none",
    ...style,
  })
  host.append(node)
  const remove = () => node.remove()
  node
    .animate(keyframes, { fill: "both", ...options })
    .finished.then(remove, remove)
}

function ring(
  host: HTMLElement,
  { color, size }: EffectContext,
  shape: { from: number; to: number; opacity: number; width: number },
  options: KeyframeAnimationOptions
) {
  spawn(
    host,
    {
      width: `${size}px`,
      height: `${size}px`,
      margin: `${-size / 2}px`,
      borderRadius: "50%",
      border: `${Math.max(1, size * shape.width)}px solid ${color}`,
    },
    [
      { transform: `scale(${shape.from})`, opacity: shape.opacity },
      { transform: `scale(${shape.to})`, opacity: 0 },
    ],
    options
  )
}

// A four-point star, for sparkle.
const SPARKLE_SHAPE =
  "polygon(50% 0, 61% 39%, 100% 50%, 61% 61%, 50% 100%, 39% 61%, 0 50%, 39% 39%)"

const SPARKLE_POINTS = [
  { angle: -60, distance: 0.8, scale: 0.4 },
  { angle: 20, distance: 0.75, scale: 0.28 },
  { angle: 130, distance: 0.8, scale: 0.34 },
  { angle: 215, distance: 0.7, scale: 0.24 },
]

// Played with the Web Animations API when a rating is chosen.
const EFFECTS: Record<Exclude<RaterEffect, "none">, EffectSpec> = {
  pop: {
    keyframes: POP_KEYFRAMES,
    options: { duration: 380, easing: "ease-out" },
  },
  bounce: {
    keyframes: [
      { transform: "translateY(0)" },
      { transform: "translateY(-45%)", offset: 0.3, easing: "ease-in" },
      { transform: "translateY(0) scale(1.1, 0.9)", offset: 0.55 },
      { transform: "translateY(-15%)", offset: 0.75, easing: "ease-in" },
      { transform: "translateY(0)" },
    ],
    options: { duration: 550, easing: "ease-out" },
  },
  wiggle: {
    keyframes: [
      { transform: "rotate(0deg)" },
      { transform: "rotate(-18deg) scale(1.15)", offset: 0.2 },
      { transform: "rotate(14deg) scale(1.15)", offset: 0.4 },
      { transform: "rotate(-9deg)", offset: 0.6 },
      { transform: "rotate(5deg)", offset: 0.8 },
      { transform: "rotate(0deg)" },
    ],
    options: { duration: 500, easing: "ease-in-out" },
  },
  spin: {
    keyframes: [
      { transform: "rotate(0deg) scale(1)" },
      { transform: "rotate(200deg) scale(1.3)", offset: 0.5 },
      { transform: "rotate(360deg) scale(1)" },
    ],
    options: { duration: 550, easing: "cubic-bezier(.3,.7,.4,1)" },
  },
  jelly: {
    keyframes: [
      { transform: "scale(1, 1)" },
      { transform: "scale(1.35, 0.7)", offset: 0.25 },
      { transform: "scale(0.8, 1.25)", offset: 0.45 },
      { transform: "scale(1.12, 0.9)", offset: 0.65 },
      { transform: "scale(0.96, 1.04)", offset: 0.82 },
      { transform: "scale(1, 1)" },
    ],
    options: { duration: 600, easing: "ease-out" },
  },
  flip: {
    keyframes: [
      { transform: "perspective(400px) rotateY(0deg) scale(1)" },
      {
        transform: "perspective(400px) rotateY(180deg) scale(1.25)",
        offset: 0.5,
      },
      { transform: "perspective(400px) rotateY(360deg) scale(1)" },
    ],
    options: { duration: 600, easing: "cubic-bezier(.4,0,.2,1)" },
  },
  drop: {
    keyframes: [
      {
        transform: "translateY(-130%) scale(0.8)",
        opacity: 0,
        easing: "ease-in",
      },
      { transform: "translateY(0) scale(1.2, 0.75)", opacity: 1, offset: 0.45 },
      { transform: "translateY(-14%) scale(0.95, 1.06)", offset: 0.7 },
      { transform: "translateY(0) scale(1)" },
    ],
    options: { duration: 560, easing: "ease-out" },
  },
  heartbeat: {
    keyframes: [
      { transform: "scale(1)" },
      { transform: "scale(1.3)", offset: 0.14 },
      { transform: "scale(1)", offset: 0.28 },
      { transform: "scale(1.3)", offset: 0.42 },
      { transform: "scale(1)", offset: 0.7 },
      { transform: "scale(1)" },
    ],
    options: { duration: 850, easing: "ease-in-out" },
  },
  tada: {
    keyframes: [
      { transform: "scale(1) rotate(0deg)" },
      { transform: "scale(0.85) rotate(-6deg)", offset: 0.15 },
      { transform: "scale(1.25) rotate(8deg)", offset: 0.3 },
      { transform: "scale(1.25) rotate(-8deg)", offset: 0.45 },
      { transform: "scale(1.25) rotate(8deg)", offset: 0.6 },
      { transform: "scale(1.25) rotate(-8deg)", offset: 0.75 },
      { transform: "scale(1) rotate(0deg)" },
    ],
    options: { duration: 800, easing: "ease-in-out" },
  },
  glow: {
    keyframes: ({ color, size }) => [
      { transform: "scale(1)", filter: `drop-shadow(0 0 0 ${color})` },
      {
        transform: "scale(1.2)",
        filter: `drop-shadow(0 0 ${size * 0.35}px ${color})`,
        offset: 0.35,
      },
      { transform: "scale(1)", filter: "drop-shadow(0 0 0 transparent)" },
    ],
    options: { duration: 700, easing: "ease-out" },
  },
  burst: {
    keyframes: POP_KEYFRAMES,
    options: { duration: 420, easing: "ease-out" },
    flourish(host, context) {
      const { color, size } = context
      ring(
        host,
        context,
        { from: 0.3, to: 1.7, opacity: 0.6, width: 0.1 },
        { duration: 450, easing: "ease-out" }
      )
      const dot = Math.max(2, size * 0.16)
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + Math.PI / 8
        const distance = size * (i % 2 ? 0.75 : 1)
        const x = Math.cos(angle) * distance
        const y = Math.sin(angle) * distance
        spawn(
          host,
          {
            width: `${dot}px`,
            height: `${dot}px`,
            margin: `${-dot / 2}px`,
            borderRadius: "50%",
            background: color,
          },
          [
            { transform: "translate(0, 0) scale(1)", opacity: 1 },
            { transform: `translate(${x}px, ${y}px) scale(0)`, opacity: 0.6 },
          ],
          { duration: 550, delay: 60, easing: "cubic-bezier(.2,.7,.3,1)" }
        )
      }
    },
  },
  ripple: {
    keyframes: [
      { transform: "scale(1)" },
      { transform: "scale(1.15)", offset: 0.3 },
      { transform: "scale(1)" },
    ],
    options: { duration: 400, easing: "ease-out" },
    flourish(host, context) {
      for (const delay of [0, 180, 360]) {
        ring(
          host,
          context,
          { from: 0.6, to: 2.2, opacity: 0.5, width: 0.06 },
          { duration: 800, delay, easing: "cubic-bezier(.2,.6,.4,1)" }
        )
      }
    },
  },
  sparkle: {
    keyframes: [
      { transform: "scale(1)" },
      { transform: "scale(1.2)", offset: 0.35 },
      { transform: "scale(1)" },
    ],
    options: { duration: 450, easing: "ease-out" },
    flourish(host, { color, size }) {
      SPARKLE_POINTS.forEach(({ angle, distance, scale }, i) => {
        const radians = (angle * Math.PI) / 180
        const star = size * scale
        const at = `translate(${Math.cos(radians) * size * distance}px, ${
          Math.sin(radians) * size * distance
        }px)`
        spawn(
          host,
          {
            width: `${star}px`,
            height: `${star}px`,
            margin: `${-star / 2}px`,
            background: color,
            clipPath: SPARKLE_SHAPE,
          },
          [
            { transform: `${at} scale(0) rotate(0deg)` },
            { transform: `${at} scale(1) rotate(90deg)`, offset: 0.45 },
            { transform: `${at} scale(0) rotate(180deg)` },
          ],
          { duration: 650, delay: i * 90, easing: "ease-in-out" }
        )
      })
    },
  },
  cascade: {
    keyframes: [
      { transform: "scale(1)" },
      { transform: "scale(1.35)", offset: 0.45 },
      { transform: "scale(1)" },
    ],
    options: { duration: 320, easing: "ease-out" },
    spread: "new",
  },
  wave: {
    keyframes: [
      { transform: "translateY(0) scale(1)" },
      { transform: "translateY(-35%) scale(1.15)", offset: 0.4 },
      { transform: "translateY(0) scale(1)" },
    ],
    options: { duration: 420, easing: "ease-in-out" },
    spread: "all",
  },
}

const EFFECT_STAGGER = 60

type EffectPlay = { effect: RaterEffect; previous: number; next: number }

function playEffect(
  { effect, previous, next }: EffectPlay,
  glyphs: (HTMLSpanElement | null)[]
) {
  if (
    effect === "none" ||
    next <= 0 ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return
  }
  const spec = EFFECTS[effect]
  const target = Math.ceil(next) - 1
  // new runs across the icons that just filled, a partial one included.
  const first =
    spec.spread === "all"
      ? 0
      : spec.spread === "new" && next > previous
        ? Math.floor(previous)
        : target
  for (let index = first; index <= target; index++) {
    const glyph = glyphs[index]
    const host = glyph?.parentElement
    if (!glyph || !host) {
      continue
    }
    const tinted = host.querySelector<HTMLElement>("[data-slot=rater-fill]")
    const context = {
      color: getComputedStyle(tinted ?? host).color,
      size: glyph.offsetWidth,
    }
    const keyframes =
      typeof spec.keyframes === "function"
        ? spec.keyframes(context)
        : spec.keyframes
    glyph.animate(keyframes, {
      ...spec.options,
      delay: (index - first) * EFFECT_STAGGER,
    })
    if (index === target) {
      spec.flourish?.(host, context)
    }
  }
}

// Filled icons take the tone colour; outline draws strokes only.
const FILLED_TONE_CLASSES: Record<RaterTone, string> = {
  default: "text-primary [&_svg]:fill-current",
  quiet: "text-muted-foreground [&_svg]:fill-current",
  outline: "text-foreground",
  success: "text-success [&_svg]:fill-current",
  warning: "text-warning [&_svg]:fill-current",
  info: "text-info [&_svg]:fill-current",
  danger: "text-destructive [&_svg]:fill-current",
}

const raterItemVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center leading-none whitespace-nowrap [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      size: {
        xs: "text-sm [&_svg]:size-3",
        sm: "text-base [&_svg]:size-4",
        default: "text-xl [&_svg]:size-5",
        lg: "text-2xl [&_svg]:size-6",
        xl: "text-3xl [&_svg]:size-8",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

type RaterProps = Omit<
  React.ComponentProps<"div">,
  "defaultValue" | "onChange" | "children"
> & {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  /** Number of icons. */
  max?: number
  /** Smallest change: 1 for whole icons, 0.5 for halves. */
  step?: number
  size?: RaterSize
  tone?: RaterTone
  /** The icon to repeat, or one per position (0-based) for e.g. emoji faces. */
  icon?: React.ReactNode | ((index: number) => React.ReactNode)
  /**
   * The animation played when a rating is chosen by click or keyboard. It
   * never plays on mount or on outside value changes, and honours reduced
   * motion. burst, ripple and sparkle draw in the tone colour around the
   * icon; cascade pops each newly filled icon in turn and wave lifts them all.
   */
  effect?: RaterEffect
  /** range: fill every icon up to the value. single: highlight only the chosen icon. */
  highlight?: "range" | "single"
  /** Shows the value without letting it change. */
  readOnly?: boolean
  disabled?: boolean
  /** Visible label above the icons. */
  label?: React.ReactNode
  /** Submits the value with a form under this name. */
  name?: string
  /** Screen-reader text for a value. Defaults to "3 out of 5". */
  getValueText?: (value: number, max: number) => string
}

function defaultValueText(value: number, max: number) {
  return `${value} out of ${max}`
}

function Rater({
  className,
  value,
  defaultValue,
  onValueChange,
  max = 5,
  step = 1,
  size = "default",
  tone = "default",
  icon = <StarIcon />,
  effect = "none",
  highlight = "range",
  readOnly = false,
  disabled = false,
  label,
  name,
  getValueText = defaultValueText,
  id,
  onKeyDown,
  onPointerLeave,
  ...props
}: RaterProps) {
  const [current, setCurrent] = useControllableState({
    value,
    defaultValue: defaultValue ?? 0,
    onChange: onValueChange,
  })
  const [hovered, setHovered] = React.useState<number | null>(null)
  const autoId = React.useId()
  const labelId = label != null ? `${autoId}-label` : undefined
  const raterId = id ?? autoId
  const rootRef = React.useRef<HTMLDivElement>(null)
  const glyphRefs = React.useRef<(HTMLSpanElement | null)[]>([])
  const [play, setPlay] = React.useState<EffectPlay | null>(null)

  // Runs after the commit and before paint, so the effect reads the new fill
  // and colour without a frame of the icon at rest.
  React.useLayoutEffect(() => {
    if (play) {
      playEffect(play, glyphRefs.current)
    }
  }, [play])

  const interactive = !readOnly && !disabled
  const shown = interactive && hovered != null ? hovered : current

  function clamp(next: number) {
    return Math.min(max, Math.max(0, Math.round(next / step) * step))
  }

  // Value under the pointer: the icon's index plus the part of it covered,
  // rounded up to the step so the hovered icon always counts.
  function valueAt(
    event: React.PointerEvent | React.MouseEvent,
    index: number
  ) {
    const rect = event.currentTarget.getBoundingClientRect()
    const ratio = rect.width > 0 ? (event.clientX - rect.left) / rect.width : 1
    const part = Math.max(step, Math.ceil(ratio / step) * step)
    return clamp(index + Math.min(1, part))
  }

  function commit(next: number) {
    const clamped = clamp(next)
    setCurrent(clamped)
    // A fresh object each time, so a repeat pick replays too.
    setPlay({ effect, previous: current, next: clamped })
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event)
    if (event.defaultPrevented || !interactive) {
      return
    }
    const moves: Record<string, number> = {
      ArrowRight: current + step,
      ArrowUp: current + step,
      ArrowLeft: current - step,
      ArrowDown: current - step,
      PageUp: current + 1,
      PageDown: current - 1,
      Home: 0,
      End: max,
    }
    if (!(event.key in moves)) {
      return
    }
    event.preventDefault()
    setHovered(null)
    commit(moves[event.key])
  }

  const valueText = getValueText(current, max)
  const selectedIndex = Math.ceil(shown) - 1

  const items = Array.from({ length: max }, (_, index) => {
    const glyph = typeof icon === "function" ? icon(index) : icon
    const fill = Math.min(1, Math.max(0, shown - index))
    const single = highlight === "single"
    const active = single ? index === selectedIndex : fill > 0

    return (
      <span
        key={index}
        data-slot="rater-item"
        data-active={active || undefined}
        className={cn(
          raterItemVariants({ size }),
          interactive && "cursor-pointer",
          single && "transition-transform",
          single && active && "scale-110"
        )}
        onPointerMove={
          interactive ? (event) => setHovered(valueAt(event, index)) : undefined
        }
        onClick={
          interactive
            ? (event) => {
                commit(valueAt(event, index))
                rootRef.current?.focus()
              }
            : undefined
        }
      >
        <span
          ref={(node) => {
            glyphRefs.current[index] = node
          }}
          data-slot="rater-glyph"
          className="relative inline-flex items-center justify-center"
        >
          {single ? (
            <span
              data-slot={active ? "rater-fill" : undefined}
              className={cn(
                "transition-[opacity,filter]",
                active
                  ? FILLED_TONE_CLASSES[tone]
                  : "text-muted-foreground opacity-40 grayscale"
              )}
            >
              {glyph}
            </span>
          ) : (
            <>
              <span
                className={cn(
                  tone === "outline"
                    ? "text-muted-foreground/40"
                    : "text-muted-foreground/20 [&_svg]:fill-current"
                )}
              >
                {glyph}
              </span>
              <span
                data-slot="rater-fill"
                className={cn(
                  "absolute inset-y-0 left-0 flex items-center overflow-hidden",
                  FILLED_TONE_CLASSES[tone]
                )}
                style={{ width: `${fill * 100}%` }}
              >
                {glyph}
              </span>
            </>
          )}
        </span>
      </span>
    )
  })

  const control = (
    <div
      ref={rootRef}
      data-slot="rater"
      data-size={size}
      data-tone={tone}
      data-readonly={readOnly || undefined}
      data-disabled={disabled || undefined}
      id={raterId}
      {...(readOnly
        ? { role: "img", "aria-label": props["aria-label"] ?? valueText }
        : {
            role: "slider",
            tabIndex: disabled ? -1 : 0,
            "aria-valuemin": 0,
            "aria-valuemax": max,
            "aria-valuenow": current,
            "aria-valuetext": valueText,
            "aria-disabled": disabled || undefined,
          })}
      // A read-only rater names itself by the label followed by its value.
      aria-labelledby={labelId && readOnly ? `${labelId} ${raterId}` : labelId}
      {...props}
      className={cn(
        "inline-flex w-fit items-center gap-0.5 rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        disabled && "cursor-not-allowed opacity-50",
        label == null && className
      )}
      onKeyDown={handleKeyDown}
      onPointerLeave={(event) => {
        onPointerLeave?.(event)
        setHovered(null)
      }}
    >
      {items}
      {name ? <input type="hidden" name={name} value={current} /> : null}
    </div>
  )

  if (label == null) {
    return control
  }

  return (
    <div
      data-slot="rater-field"
      className={cn("flex flex-col gap-2", className)}
    >
      <FieldLabel
        id={labelId}
        className={cn(disabled && "opacity-50")}
        onClick={() => rootRef.current?.focus()}
      >
        {label}
      </FieldLabel>
      {control}
    </div>
  )
}

export { Rater, raterItemVariants }
export type { RaterEffect, RaterProps, RaterSize, RaterTone }
