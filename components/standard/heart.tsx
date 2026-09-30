"use client"

import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "cn"
import { HeartIcon } from "lucide-react"

import { useControllableState } from "@/hooks/use-controllable-state"

type HeartEffect = "burst" | "pop" | "beat" | "float" | "fill"
type HeartUnlikeEffect = "none" | "break" | "deflate" | "fall" | "drain"
type HeartSize = "sm" | "default" | "lg"

const heartButtonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-1 rounded-md text-muted-foreground tabular-nums transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none",
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

// Burst: seven spokes, each a big dot and a smaller trailing one.
const BURST_DOTS = Array.from({ length: 7 }, (_, i) => i * (360 / 7)).flatMap(
  (angle) => [
    { angle, reach: 1.15, size: 3.5, accent: false },
    { angle: angle + 14, reach: 0.95, size: 2.5, accent: true },
  ]
)

// Float: small hearts drifting up and out at staggered times.
const FLOATERS = [
  { x: -14, rot: -18, delay: 0 },
  { x: 10, rot: 14, delay: 90 },
  { x: -4, rot: -6, delay: 180 },
  { x: 16, rot: 22, delay: 260 },
  { x: -10, rot: -12, delay: 340 },
]

type HeartProps = Omit<
  React.ComponentProps<"button">,
  "defaultValue" | "onChange" | "children" | "value"
> & {
  pressed?: boolean
  defaultPressed?: boolean
  onPressedChange?: (pressed: boolean) => void
  /** The animation played when the heart is liked. */
  effect?: HeartEffect
  /** The animation played when the like is taken back. */
  unlikeEffect?: HeartUnlikeEffect
  size?: HeartSize
  /** Count shown beside the icon. */
  count?: number
}

/**
 * A like toggle. Liking fills the heart and plays one of several effects:
 * a burst of dots, a pop, a heartbeat, floating hearts or a liquid fill.
 * Unliking can play one too: the heart breaks in two, deflates, falls
 * or drains empty.
 * Effects only play on a click, never on mount, and honour reduced motion.
 */
function Heart({
  className,
  pressed,
  defaultPressed,
  onPressedChange,
  effect = "burst",
  unlikeEffect = "none",
  size = "default",
  count,
  disabled = false,
  onClick,
  "aria-label": ariaLabel = "Like",
  ...props
}: HeartProps) {
  const [liked, setLiked] = useControllableState<boolean>({
    value: pressed,
    defaultValue: defaultPressed ?? false,
    onChange: onPressedChange,
  })
  // Bumped on each click so the effect remounts and replays.
  const [play, setPlay] = React.useState(0)
  const animate = play > 0 ? (liked ? "like" : "unlike") : undefined

  return (
    <>
      <style href="standard-heart" precedence="default">
        {heartCss}
      </style>
      <button
        type="button"
        data-slot="heart"
        data-size={size}
        data-effect={effect}
        data-unlike-effect={unlikeEffect}
        aria-label={ariaLabel}
        aria-pressed={liked}
        disabled={disabled}
        className={cn(
          heartButtonVariants({ size }),
          liked && "text-destructive hover:text-destructive",
          className
        )}
        onClick={(event) => {
          onClick?.(event)
          if (event.defaultPrevented) return
          setPlay((n) => n + 1)
          setLiked(!liked)
        }}
        {...props}
      >
        <span
          key={play}
          data-slot="heart-icon"
          data-animate={animate}
        >
          <HeartIcon />
          {liked ? <HeartIcon data-slot="heart-solid" /> : null}
          {animate === "like" ? <HeartEffects effect={effect} /> : null}
          {animate === "unlike" ? (
            <HeartUnlikeEffects effect={unlikeEffect} />
          ) : null}
        </span>
        {count != null ? <span>{count}</span> : null}
      </button>
    </>
  )
}

function HeartEffects({ effect }: { effect: HeartEffect }) {
  if (effect === "burst") {
    return (
      <span data-slot="heart-fx" aria-hidden>
        <span data-slot="heart-ring" />
        {BURST_DOTS.map((dot, i) => (
          <span
            key={i}
            data-slot="heart-dot"
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
      <span data-slot="heart-fx" aria-hidden>
        {FLOATERS.map((f, i) => (
          <HeartIcon
            key={i}
            data-slot="heart-floater"
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

function HeartUnlikeEffects({ effect }: { effect: HeartUnlikeEffect }) {
  if (effect === "none") return null
  if (effect === "break") {
    return (
      <span data-slot="heart-fx" aria-hidden>
        <HeartIcon data-slot="heart-shard" data-side="left" />
        <HeartIcon data-slot="heart-shard" data-side="right" />
      </span>
    )
  }
  return (
    <span data-slot="heart-fx" aria-hidden>
      <HeartIcon data-slot="heart-ghost" />
    </span>
  )
}

const heartCss = `
[data-slot=heart]{--heart-size:16px}
[data-slot=heart][data-size=sm]{--heart-size:14px}
[data-slot=heart][data-size=lg]{--heart-size:20px}
[data-slot=heart-icon]{position:relative;display:inline-grid;place-items:center;width:var(--heart-size);height:var(--heart-size)}
[data-slot=heart-icon]>svg{grid-area:1/1;width:100%;height:100%}
[data-slot=heart-icon]>[data-slot=heart-solid]{fill:currentColor}
[data-effect=burst] [data-animate=like]>[data-slot=heart-solid]{animation:heart-grow .5s .12s cubic-bezier(.2,.8,.3,1.4) both}
[data-effect=burst] [data-animate=like]>svg:first-child{animation:heart-vanish .5s both}
[data-effect=pop] [data-animate=like]>[data-slot=heart-solid]{animation:heart-pop .45s cubic-bezier(.3,.7,.4,1) both}
[data-effect=beat] [data-animate=like]>[data-slot=heart-solid]{animation:heart-beat .8s ease-in-out both}
[data-effect=float] [data-animate=like]>[data-slot=heart-solid]{animation:heart-pop .4s ease-out both}
[data-effect=fill] [data-animate=like]>[data-slot=heart-solid]{animation:heart-fill .6s cubic-bezier(.5,0,.3,1) both,heart-settle .35s .55s ease-out both}
[data-slot=heart-fx]{position:absolute;inset:0;pointer-events:none}
[data-slot=heart-ring]{position:absolute;inset:0;border-radius:50%;border:calc(var(--heart-size) / 2) solid currentColor;opacity:.5;animation:heart-ring .4s ease-out both}
[data-slot=heart-dot]{position:absolute;left:50%;top:50%;width:var(--dot);height:var(--dot);margin:calc(var(--dot) / -2);border-radius:50%;background:currentColor;opacity:0;animation:heart-dot .6s .15s cubic-bezier(.2,.7,.3,1) both}
[data-slot=heart-dot][data-accent]{background:var(--primary)}
[data-slot=heart-icon] [data-slot=heart-floater]{position:absolute;left:50%;top:50%;width:calc(var(--heart-size) * .55);height:calc(var(--heart-size) * .55);margin:calc(var(--heart-size) * -.275);fill:currentColor;stroke:none;opacity:0;animation:heart-float .9s var(--d) ease-out both}
[data-slot=heart-icon][data-animate=unlike]>svg:first-child{animation:heart-return .3s var(--heart-return,0s) ease-out both}
[data-unlike-effect=break]{--heart-return:.55s}
[data-unlike-effect=deflate]{--heart-return:.35s}
[data-unlike-effect=fall]{--heart-return:.2s}
[data-slot=heart-shard],[data-slot=heart-ghost]{position:absolute;inset:0;width:100%;height:100%;color:var(--destructive);fill:currentColor;stroke:currentColor}
[data-slot=heart-shard][data-side=left]{clip-path:polygon(0 0,52% 0,44% 32%,58% 50%,44% 70%,50% 100%,0 100%);animation:heart-crack .2s ease-in-out,heart-split-left .5s .2s cubic-bezier(.5,0,.8,.6) both}
[data-slot=heart-shard][data-side=right]{clip-path:polygon(52% 0,100% 0,100% 100%,50% 100%,44% 70%,58% 50%,44% 32%);animation:heart-crack .2s ease-in-out,heart-split-right .5s .2s cubic-bezier(.5,0,.8,.6) both}
[data-unlike-effect=deflate] [data-slot=heart-ghost]{animation:heart-deflate .45s cubic-bezier(.5,0,.7,.4) both}
[data-unlike-effect=drain] [data-animate=unlike]>svg:first-child{animation:none}
[data-unlike-effect=drain] [data-slot=heart-ghost]{animation:heart-drain .6s cubic-bezier(.5,0,.3,1) both}
[data-unlike-effect=fall] [data-slot=heart-ghost]{animation:heart-fall .6s cubic-bezier(.5,0,.9,.5) both}
@keyframes heart-return{from{transform:scale(.5);opacity:0}to{transform:scale(1);opacity:1}}
@keyframes heart-crack{0%,100%{translate:0}25%{translate:-1px}75%{translate:1px}}
@keyframes heart-split-left{0%{transform:none;opacity:1}100%{transform:translate(calc(var(--heart-size) * -.35),calc(var(--heart-size) * .5)) rotate(-28deg);opacity:0}}
@keyframes heart-split-right{0%{transform:none;opacity:1}100%{transform:translate(calc(var(--heart-size) * .35),calc(var(--heart-size) * .5)) rotate(28deg);opacity:0}}
@keyframes heart-deflate{0%{transform:scale(1)}30%{transform:scale(1.12,.9)}100%{transform:scale(0) rotate(-40deg);opacity:.4}}
@keyframes heart-drain{from{clip-path:inset(0)}to{clip-path:inset(100% 0 0 0)}}
@keyframes heart-fall{0%{transform:none;opacity:1}100%{transform:translateY(calc(var(--heart-size) * 1.4)) rotate(24deg);opacity:0}}
@keyframes heart-vanish{0%{transform:scale(1)}30%,100%{transform:scale(0)}}
@keyframes heart-grow{0%{transform:scale(0)}60%{transform:scale(1.25)}100%{transform:scale(1)}}
@keyframes heart-pop{0%{transform:scale(.6)}45%{transform:scale(1.3)}70%{transform:scale(.92)}100%{transform:scale(1)}}
@keyframes heart-beat{0%{transform:scale(.7)}18%{transform:scale(1.25)}34%{transform:scale(.95)}50%{transform:scale(1.18)}72%,100%{transform:scale(1)}}
@keyframes heart-fill{from{clip-path:inset(100% 0 0 0)}to{clip-path:inset(0)}}
@keyframes heart-settle{0%{transform:scale(1)}40%{transform:scale(1.15,.9)}70%{transform:scale(.95,1.06)}100%{transform:scale(1)}}
@keyframes heart-ring{0%{transform:scale(0)}70%{border-width:calc(var(--heart-size) / 2)}100%{transform:scale(1.5);border-width:0;opacity:0}}
@keyframes heart-dot{0%{transform:rotate(var(--a)) translateY(calc(var(--heart-size) * -.45)) scale(1);opacity:1}100%{transform:rotate(var(--a)) translateY(calc(var(--heart-size) * var(--reach) * -1)) scale(0);opacity:1}}
@keyframes heart-float{0%{transform:translate(0,0) scale(.3);opacity:0}20%{opacity:1}100%{transform:translate(var(--x),calc(var(--heart-size) * -1.9)) rotate(var(--rot)) scale(1);opacity:0}}
@media (prefers-reduced-motion:reduce){[data-slot=heart] *{animation:none!important}[data-slot=heart-fx]{display:none}}
`

export { Heart, heartButtonVariants }
export type { HeartEffect, HeartProps, HeartSize, HeartUnlikeEffect }
