"use client"

import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "cn"
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react"

import { useControllableState } from "@/hooks/use-controllable-state"

type ThumbsValue = "up" | "down" | null
type ThumbsSize = "sm" | "default" | "lg"
type ThumbsEffect = "none" | "tilt" | "pop" | "burst" | "float"

const thumbsButtonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-1 rounded-md text-muted-foreground tabular-nums transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      size: {
        sm: "h-7 min-w-7 px-1.5 text-xs",
        default: "h-8 min-w-8 px-2 text-sm",
        lg: "h-9 min-w-9 px-2.5 text-sm",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

// A chosen thumb fills its icon: up in the primary colour, down in danger.
const ACTIVE_CLASSES = {
  up: "text-primary hover:text-primary [&_svg]:fill-current",
  down: "text-destructive hover:text-destructive [&_svg]:fill-current",
} as const

// Burst: six spokes, each a big dot and a smaller trailing one.
const BURST_DOTS = Array.from({ length: 6 }, (_, i) => i * 60).flatMap(
  (angle) => [
    { angle, reach: 1.15, size: 3, accent: false },
    { angle: angle + 18, reach: 0.95, size: 2, accent: true },
  ]
)

// Float: small thumbs drifting away at staggered times.
const FLOATERS = [
  { x: -12, rot: -16, delay: 0 },
  { x: 9, rot: 12, delay: 110 },
  { x: -3, rot: -4, delay: 220 },
  { x: 14, rot: 20, delay: 320 },
]

type ThumbsProps = Omit<
  React.ComponentProps<"div">,
  "defaultValue" | "onChange" | "children"
> & {
  value?: ThumbsValue
  defaultValue?: ThumbsValue
  /** Clicking the chosen thumb again clears it to `null`. */
  onValueChange?: (value: ThumbsValue) => void
  /** Optional animation played when a thumb is picked. Defaults to `none`. */
  effect?: ThumbsEffect
  size?: ThumbsSize
  disabled?: boolean
  /** Counts shown beside each icon. */
  counts?: { up?: number; down?: number }
  /** Accessible names for the two buttons. */
  upLabel?: string
  downLabel?: string
}

/**
 * Thumbs up / thumbs down feedback. Each thumb is a pressed-state toggle;
 * picking one clears the other and can play an optional effect: a tilt, a pop, a burst
 * of dots or floating thumbs. Up moves upward, down moves downward. Effects
 * only play on a click, never on mount, and honour reduced motion.
 */
function Thumbs({
  className,
  value,
  defaultValue,
  onValueChange,
  effect = "none",
  size = "default",
  disabled = false,
  counts,
  upLabel = "Thumbs up",
  downLabel = "Thumbs down",
  ...props
}: ThumbsProps) {
  const [current, setCurrent] = useControllableState<ThumbsValue>({
    value,
    defaultValue: defaultValue ?? null,
    onChange: onValueChange,
  })
  // Bumped on each pick so the effect remounts and replays.
  const [play, setPlay] = React.useState(0)

  const thumbs = [
    { key: "up", Icon: ThumbsUpIcon, label: upLabel },
    { key: "down", Icon: ThumbsDownIcon, label: downLabel },
  ] as const

  return (
    <div
      role="group"
      data-slot="thumbs"
      data-size={size}
      data-effect={effect}
      data-value={current ?? undefined}
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    >
      <style href="standard-thumbs" precedence="default">
        {thumbsCss}
      </style>
      {thumbs.map(({ key, Icon, label }) => {
        const pressed = current === key
        const count = counts?.[key]
        const animate = pressed && play > 0 && effect !== "none"
        return (
          <button
            key={key}
            type="button"
            data-slot={`thumbs-${key}`}
            aria-label={label}
            aria-pressed={pressed}
            disabled={disabled}
            className={cn(
              thumbsButtonVariants({ size }),
              pressed && ACTIVE_CLASSES[key]
            )}
            onClick={() => {
              if (!pressed) setPlay((n) => n + 1)
              setCurrent(pressed ? null : key)
            }}
          >
            <span
              key={pressed ? play : 0}
              data-slot="thumbs-icon"
              data-dir={key}
              data-animate={animate || undefined}
            >
              <Icon />
              {animate ? <ThumbsEffects effect={effect} Icon={Icon} /> : null}
            </span>
            {count != null ? <span>{count}</span> : null}
          </button>
        )
      })}
    </div>
  )
}

function ThumbsEffects({
  effect,
  Icon,
}: {
  effect: ThumbsEffect
  Icon: typeof ThumbsUpIcon
}) {
  if (effect === "burst") {
    return (
      <span data-slot="thumbs-fx" aria-hidden>
        <span data-slot="thumbs-ring" />
        {BURST_DOTS.map((dot, i) => (
          <span
            key={i}
            data-slot="thumbs-dot"
            data-accent={dot.accent || undefined}
            style={
              {
                "--a": `${dot.angle}deg`,
                "--reach": dot.reach,
                "--dot": `${dot.size}px`,
              } as React.CSSProperties
            }
          />
        ))}
      </span>
    )
  }
  if (effect === "float") {
    return (
      <span data-slot="thumbs-fx" aria-hidden>
        {FLOATERS.map((f, i) => (
          <Icon
            key={i}
            data-slot="thumbs-floater"
            style={
              {
                "--x": `${f.x}px`,
                "--rot": `${f.rot}deg`,
                "--d": `${f.delay}ms`,
              } as React.CSSProperties
            }
          />
        ))}
      </span>
    )
  }
  return null
}

const thumbsCss = `
[data-slot=thumbs]{--thumbs-size:16px}
[data-slot=thumbs][data-size=sm]{--thumbs-size:14px}
[data-slot=thumbs][data-size=lg]{--thumbs-size:20px}
[data-slot=thumbs-icon]{position:relative;display:inline-grid;place-items:center;width:var(--thumbs-size);height:var(--thumbs-size)}
[data-slot=thumbs-icon]>svg{grid-area:1/1;width:100%;height:100%}
[data-slot=thumbs-icon][data-dir=up]{--dir:-1}
[data-slot=thumbs-icon][data-dir=down]{--dir:1}
[data-slot=thumbs-icon][data-dir=up]>svg:first-child{transform-origin:30% 85%}
[data-slot=thumbs-icon][data-dir=down]>svg:first-child{transform-origin:70% 15%}
[data-effect=tilt] [data-animate]>svg:first-child{animation:thumbs-tilt .6s cubic-bezier(.3,.7,.4,1) both}
[data-effect=pop] [data-animate]>svg:first-child{animation:thumbs-pop .45s cubic-bezier(.3,.7,.4,1) both}
[data-effect=burst] [data-animate]>svg:first-child{animation:thumbs-grow .5s .1s cubic-bezier(.2,.8,.3,1.4) both}
[data-effect=float] [data-animate]>svg:first-child{animation:thumbs-pop .4s ease-out both}
[data-slot=thumbs-fx]{position:absolute;inset:0;pointer-events:none}
[data-slot=thumbs-ring]{position:absolute;inset:0;border-radius:50%;border:calc(var(--thumbs-size) / 2) solid currentColor;opacity:.4;animation:thumbs-ring .4s ease-out both}
[data-slot=thumbs-dot]{position:absolute;left:50%;top:50%;width:var(--dot);height:var(--dot);margin:calc(var(--dot) / -2);border-radius:50%;background:currentColor;opacity:0;animation:thumbs-dot .6s .12s cubic-bezier(.2,.7,.3,1) both}
[data-slot=thumbs-icon] [data-slot=thumbs-floater]{position:absolute;left:50%;top:50%;width:calc(var(--thumbs-size) * .55);height:calc(var(--thumbs-size) * .55);margin:calc(var(--thumbs-size) * -.275);fill:currentColor;stroke:none;opacity:0;animation:thumbs-float .9s var(--d) ease-out both}
@keyframes thumbs-tilt{0%{transform:rotate(0) translateY(0) scale(1)}30%{transform:rotate(-22deg) translateY(calc(var(--dir) * 3px)) scale(1.2)}55%{transform:rotate(8deg) translateY(0) scale(.95)}75%{transform:rotate(-4deg) translateY(0) scale(1)}100%{transform:rotate(0) translateY(0) scale(1)}}
@keyframes thumbs-pop{0%{transform:scale(.6)}45%{transform:scale(1.3)}70%{transform:scale(.92)}100%{transform:scale(1)}}
@keyframes thumbs-grow{0%{transform:scale(0)}60%{transform:scale(1.25)}100%{transform:scale(1)}}
@keyframes thumbs-ring{0%{transform:scale(0)}70%{border-width:calc(var(--thumbs-size) / 2)}100%{transform:scale(1.5);border-width:0;opacity:0}}
@keyframes thumbs-dot{0%{transform:rotate(var(--a)) translateY(calc(var(--thumbs-size) * -.45)) scale(1);opacity:1}100%{transform:rotate(var(--a)) translateY(calc(var(--thumbs-size) * var(--reach) * -1)) scale(0);opacity:1}}
@keyframes thumbs-dot-accent{0%{transform:rotate(var(--a)) translateY(calc(var(--thumbs-size) * -.45)) scale(1);opacity:.5}100%{transform:rotate(var(--a)) translateY(calc(var(--thumbs-size) * var(--reach) * -1)) scale(0);opacity:.5}}
[data-slot=thumbs-dot][data-accent]{animation-name:thumbs-dot-accent}
@keyframes thumbs-float{0%{transform:translate(0,0) scale(.3);opacity:0}20%{opacity:1}100%{transform:translate(var(--x),calc(var(--thumbs-size) * 1.9 * var(--dir))) rotate(var(--rot)) scale(1);opacity:0}}
@media (prefers-reduced-motion:reduce){[data-slot=thumbs] *{animation:none!important}[data-slot=thumbs-fx]{display:none}}
`

export { Thumbs, thumbsButtonVariants }
export type { ThumbsEffect, ThumbsProps, ThumbsSize, ThumbsValue }
