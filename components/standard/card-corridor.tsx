"use client"

import * as React from "react"
import { cn } from "cn"

/**
 * Two walls of cards that meet in the middle. Cards start small and
 * overlapping at the center, fan out into a wall on each side, then run
 * toward you and grow until they leave past the edges, while new ones keep
 * coming in behind them. Cards face you at the back and turn along the wall
 * as they come forward. Each card swaps in the next item every time it goes
 * round, so a long `items` list keeps changing.
 *
 * Everything is sized from the frame's width, so the corridor keeps its
 * shape at any size. Put a headline or buttons in `children` to sit over it.
 * The cards pause while the frame is off screen, and reduced motion holds
 * them still in place.
 *
 * <CardCorridor className="h-[30rem]" items={shots}>
 *   <h1>The picture in your head</h1>
 * </CardCorridor>
 */

type CardCorridorItem = React.ReactNode

type CardCorridorProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Card faces. A string is shown as an image URL. */
  items: CardCorridorItem[]
  /** Content over the corridor. */
  children?: React.ReactNode
  /** Cards on each wall. */
  count?: number
  /** Seconds for one card to travel from the center to the edge. */
  duration?: number
  /** `out` comes toward you from the center, `in` goes away into it. */
  direction?: "out" | "in"
  /** Distance from the center to each wall, as a share of the width. */
  spread?: number
  /** How far back the walls meet, in frame widths. */
  depth?: number
  /** How far cards on the walls turn toward the middle, in degrees. */
  angle?: number
  /** Share of the trip spent fanning out from the center to the wall. */
  bend?: number
  pauseOnHover?: boolean
  /** Size and shape of every card. */
  cardClassName?: string
}

// The camera sits this far in front of the frame, and cards travel until
// they are this close, well past the edges.
const perspective = 80
const exitDepth = 25
const stops = 32

/**
 * Traces one card's trip from above as keyframes: x fans out from the center
 * to the wall over the first `bend` of the trip, z comes forward evenly, and
 * the card turns to lie along its path, up to `angle`.
 */
function buildsKeyframes(
  name: string,
  {
    spread,
    depth,
    angle,
    bend,
  }: { spread: number; depth: number; angle: number; bend: number }
) {
  const wall = spread * 100
  const back = depth * 100
  const frames: string[] = []

  for (let index = 0; index <= stops; index++) {
    const progress = index / stops
    const fan = Math.min(1, progress / bend)
    const x = wall * Math.sin((fan * Math.PI) / 2)
    const z = -back + (back + exitDepth) * progress
    const dx =
      fan < 1
        ? ((wall * Math.PI) / 2 / bend) * Math.cos((fan * Math.PI) / 2)
        : 0
    const along = (Math.atan2(back + exitDepth, dx) * 180) / Math.PI
    const turn = Math.min(angle, along)
    const opacity = Math.min(1, progress / 0.04, (1 - progress) / 0.04)

    frames.push(
      `${(progress * 100).toFixed(2)}%{opacity:${opacity.toFixed(2)};transform:translate(-50%,-50%) translate3d(calc(var(--card-corridor-side)*${x.toFixed(2)}cqw),0,${z.toFixed(2)}cqw) rotateY(calc(var(--card-corridor-side)*${(-turn).toFixed(2)}deg))}`
    )
  }

  return `@keyframes ${name}{${frames.join("")}}`
}

const corridorStyles = `
[data-slot=card-corridor-card]{animation:var(--card-corridor-name) var(--card-corridor-duration) linear infinite var(--card-corridor-direction)}
[data-slot=card-corridor][data-paused] [data-slot=card-corridor-card],
[data-slot=card-corridor][data-pause-on-hover]:hover [data-slot=card-corridor-card]{animation-play-state:paused}
@media (prefers-reduced-motion:reduce){[data-slot=card-corridor-card]{animation-play-state:paused!important}}
`

function CardCorridorCard({
  items,
  slot,
  slots,
  side,
  delay,
  className,
}: {
  items: CardCorridorItem[]
  slot: number
  slots: number
  side: -1 | 1
  delay: number
  className?: string
}) {
  // Each lap shows the item one full set of cards further along.
  const [lap, setLap] = React.useState(0)
  const item = items.length ? items[(slot + lap * slots) % items.length] : null

  return (
    <div
      aria-hidden
      data-slot="card-corridor-card"
      onAnimationIteration={() => setLap((current) => current + 1)}
      style={
        {
          "--card-corridor-side": side,
          animationDelay: `${delay}s`,
        } as React.CSSProperties
      }
      className={cn(
        "absolute top-1/2 left-1/2 aspect-3/4 w-(--card-corridor-card-width) overflow-hidden rounded-lg bg-muted shadow-lg will-change-transform",
        className
      )}
    >
      {typeof item === "string" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item}
          alt=""
          draggable={false}
          className="size-full object-cover"
        />
      ) : (
        item
      )}
    </div>
  )
}

function CardCorridor({
  items,
  children,
  count = 18,
  duration = 30,
  direction = "out",
  spread = 0.5,
  depth = 2.2,
  angle = 65,
  bend = 0.65,
  pauseOnHover = false,
  cardClassName,
  className,
  style,
  ...props
}: CardCorridorProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [visible, setVisible] = React.useState(true)

  React.useEffect(() => {
    const node = ref.current
    if (!node || typeof IntersectionObserver === "undefined") return

    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry?.isIntersecting ?? true)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  // Corridors with the same shape share one set of keyframes.
  const name = `card-corridor-${[spread, depth, angle, bend].join("-").replace(/\./g, "_")}`
  const keyframes = React.useMemo(
    () => buildsKeyframes(name, { spread, depth, angle, bend }),
    [name, spread, depth, angle, bend]
  )

  const step = duration / count
  const cards = Array.from({ length: count }, (_, index) =>
    ([-1, 1] as const).map((side) => ({
      side,
      slot: index * 2 + (side === 1 ? 1 : 0),
      // Negative delays start every card part way along, so the walls are
      // full on the first frame. The right wall runs half a step behind.
      delay: -(index * step + (side === 1 ? step / 2 : 0)),
    }))
  ).flat()

  return (
    <div
      ref={ref}
      data-slot="card-corridor"
      data-paused={visible ? undefined : true}
      data-pause-on-hover={pauseOnHover || undefined}
      style={
        {
          "--card-corridor-card-width": "15cqw",
          "--card-corridor-name": name,
          "--card-corridor-duration": `${duration}s`,
          "--card-corridor-direction":
            direction === "in" ? "reverse" : "normal",
          ...style,
        } as React.CSSProperties
      }
      className={cn(
        "@container relative isolate flex h-96 items-center justify-center overflow-hidden",
        className
      )}
      {...props}
    >
      <style href="standard-card-corridor" precedence="default">
        {corridorStyles}
      </style>
      <style href={name} precedence="default">
        {keyframes}
      </style>
      <div
        data-slot="card-corridor-stage"
        style={{ perspective: `${perspective}cqw` }}
        className="pointer-events-none absolute inset-0 -z-10 transform-3d"
      >
        {cards.map((card) => (
          <CardCorridorCard
            key={card.slot}
            items={items}
            slots={cards.length}
            className={cardClassName}
            {...card}
          />
        ))}
      </div>
      {children}
    </div>
  )
}

export { CardCorridor, type CardCorridorItem, type CardCorridorProps }
