import { cn } from "cn"
import { Loader2Icon } from "lucide-react"

type SpinnerVariant = "ring" | "orbit" | "dots" | "bars" | "pulse" | "burst" | "grid" | "triangle"

type SpinnerProps = React.ComponentProps<"svg"> & {
  variant?: SpinnerVariant
}

function Spinner({ variant = "ring", className, ...props }: SpinnerProps) {
  const shared = {
    "data-slot": "spinner",
    "data-variant": variant,
    role: "status",
    "aria-label": "Loading",
    className: cn("size-4", variant === "ring" && "animate-spin", className),
    ...props,
  }

  if (variant === "ring") {
    return <Loader2Icon {...shared} />
  }

  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...shared}>
      {variant === "orbit" && <OrbitFrames />}
      {variant === "dots" && <DotsFrames />}
      {variant === "bars" && <BarsFrames />}
      {variant === "pulse" && <PulseFrames />}
      {variant === "burst" && <BurstFrames />}
      {variant === "grid" && <GridFrames />}
      {variant === "triangle" && <TriangleFrames />}
    </svg>
  )
}

function OrbitFrames() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" opacity="0.2" />
      <circle cx="12" cy="12" r="9" strokeDasharray="14 43">
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 12 12"
          to="360 12 12"
          dur="0.9s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="stroke-dasharray"
          values="4 53;28 29;4 53"
          dur="1.8s"
          repeatCount="indefinite"
        />
      </circle>
    </g>
  )
}

function DotsFrames() {
  return (
    <>
      {[4, 12, 20].map((cx, index) => (
        <circle key={cx} cx={cx} cy="12" r="2.5">
          <animate
            attributeName="cy"
            values="12;6;12;12"
            keyTimes="0;0.25;0.5;1"
            dur="1s"
            begin={`${index * 0.15}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="1;0.4;1;1"
            keyTimes="0;0.25;0.5;1"
            dur="1s"
            begin={`${index * 0.15}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </>
  )
}

function BarsFrames() {
  return (
    <>
      {[3, 9, 15, 21].map((x, index) => (
        <rect key={x} x={x - 1.5} y="6" width="3" height="12" rx="1.5">
          <animate
            attributeName="height"
            values="12;20;6;12"
            dur="1s"
            begin={`${index * 0.12}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="y"
            values="6;2;9;6"
            dur="1s"
            begin={`${index * 0.12}s`}
            repeatCount="indefinite"
          />
        </rect>
      ))}
    </>
  )
}

function BurstFrames() {
  return (
    <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      {Array.from({ length: 12 }, (_, index) => (
        <line key={index} x1="12" y1="2.5" x2="12" y2="7" opacity="0.25" transform={`rotate(${index * 30} 12 12)`}>
          <animate
            attributeName="opacity"
            values="1;0.25"
            dur="1.2s"
            begin={`${(index - 12) * 0.1}s`}
            repeatCount="indefinite"
          />
        </line>
      ))}
    </g>
  )
}

function GridFrames() {
  // Clockwise from top-left so the bright tile walks around the square.
  const tiles = [
    [3, 3],
    [13, 3],
    [13, 13],
    [3, 13],
  ]

  return (
    <>
      {tiles.map(([x, y], index) => (
        <rect key={index} x={x} y={y} width="8" height="8" rx="1.5" opacity="0.3">
          <animate
            attributeName="opacity"
            values="1;0.3;0.3;0.3"
            dur="1.2s"
            begin={`${(index - 4) * 0.3}s`}
            repeatCount="indefinite"
          />
        </rect>
      ))}
    </>
  )
}

function TriangleFrames() {
  // Triforce order: top, bottom-right, bottom-left. Each piece is shrunk
  // around its centroid so the three read as separate shards.
  const pieces = [
    { points: "12,2.5 7,11.5 17,11.5", center: [12, 8.5] },
    { points: "17,11.5 12,20.5 22,20.5", center: [17, 17.5] },
    { points: "7,11.5 2,20.5 12,20.5", center: [7, 17.5] },
  ]

  return (
    <>
      {pieces.map(({ points, center: [cx, cy] }, index) => (
        <polygon
          key={points}
          points={points}
          strokeLinejoin="round"
          opacity="0.3"
          transform={`translate(${cx} ${cy}) scale(0.86) translate(${-cx} ${-cy})`}
        >
          <animate
            attributeName="opacity"
            values="1;0.3;0.3"
            dur="1.2s"
            begin={`${(index - 3) * 0.4}s`}
            repeatCount="indefinite"
          />
        </polygon>
      ))}
    </>
  )
}

function PulseFrames() {
  return (
    <>
      <circle cx="12" cy="12" r="3" />
      {[0, 0.6].map((begin) => (
        <circle key={begin} cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.5">
          <animate attributeName="r" values="3;11" dur="1.2s" begin={`${begin}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0" dur="1.2s" begin={`${begin}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </>
  )
}

export { Spinner, type SpinnerVariant }
