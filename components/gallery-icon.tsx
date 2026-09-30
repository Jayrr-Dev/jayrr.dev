import type { ReactNode } from "react"

/** Five-point star path centered on (cx, cy). */
function starPath(cx: number, cy: number, outer: number, inner: number) {
  const points = Array.from({ length: 10 }, (_, i) => {
    const radius = i % 2 ? inner : outer
    const angle = (Math.PI / 5) * i - Math.PI / 2
    return `${(cx + radius * Math.cos(angle)).toFixed(2)} ${(cy + radius * Math.sin(angle)).toFixed(2)}`
  })
  return `M${points.join("L")}Z`
}

/** Fixed scatter of grain specks inside the 12..52 frame. */
const noiseSpecks = Array.from({ length: 42 }, (_, i) => ({
  x: 14 + ((i * 17 + 11) % 37),
  y: 16 + ((i * 53 + 7) % 33),
  r: 0.9 + ((i * 7) % 3) * 0.45,
  opacity: [0.25, 0.55, 1, 0.4, 0.75][i % 5],
}))

const icons = {
  Heading: (
    <>
      <path d="M15 23v18m16-18v18M15 32h16M39 28l5-3v16m-5 0h10" />
    </>
  ),
  Headline: (
    <>
      {/* Centred landing section: eyebrow, two-line title, copy, one CTA. */}
      <rect x="25" y="11" width="14" height="5" rx="2.5" opacity=".5" />
      <path d="M15 24h34M20 32h24" strokeWidth="3.5" />
      <path d="M18 40h28" opacity=".45" />
      <rect
        x="24"
        y="46"
        width="16"
        height="7"
        rx="3.5"
        fill="currentColor"
        stroke="none"
      />
    </>
  ),
  Paragraph: (
    <>
      <path d="M12 22h40M12 29h40M12 36h40M12 43h26" />
    </>
  ),
  Caption: (
    <>
      <rect x="14" y="15" width="36" height="24" rx="3" opacity=".35" />
      <path d="M21 45h22M26 50h12" />
    </>
  ),
  Code: (
    <>
      <rect x="8" y="14" width="48" height="36" rx="5" opacity=".35" />
      <path d="m23 26-6 6 6 6m18-12 6 6-6 6m-6-15-6 22" />
    </>
  ),
  Symbol: (
    <path d="m32 13 5.8 11.8L51 27l-9.5 9.3L43.8 49 32 43l-11.8 6 2.3-12.7L13 27l13.2-2.2Z" />
  ),
  Status: (
    <>
      <circle cx="32" cy="32" r="18" opacity=".35" />
      <path d="m24 32 5 5 11-11" />
      <circle cx="47" cy="18" r="4" fill="currentColor" stroke="none" />
    </>
  ),
  Image: (
    <>
      <rect x="10" y="14" width="44" height="36" rx="4" opacity=".5" />
      <circle cx="23" cy="25" r="4" />
      <path d="m11 44 13-12 9 8 8-7 12 11" />
    </>
  ),
  "Comparison Slider": (
    <>
      <rect x="10" y="14" width="44" height="36" rx="4" opacity=".5" />
      <path
        d="M32 14h18a4 4 0 0 1 4 4v28a4 4 0 0 1-4 4H32Z"
        fill="currentColor"
        fillOpacity=".25"
        stroke="none"
      />
      <path d="M32 10v44" />
      <circle cx="32" cy="32" r="5" fill="var(--background, #fff)" />
      <path d="M30.5 30v4M33.5 30v4" strokeWidth="1.5" />
    </>
  ),
  Avatar: (
    <>
      <circle cx="32" cy="32" r="21" opacity=".35" />
      <circle cx="32" cy="26" r="7" />
      <path d="M18 46a14 14 0 0 1 28 0" />
    </>
  ),
  Button: (
    <>
      <rect
        x="8"
        y="20"
        width="48"
        height="24"
        rx="8"
        fill="currentColor"
        fillOpacity=".1"
      />
      <path d="M18 32h16m8-4 5 4-5 4" />
    </>
  ),
  "Button Array": (
    <>
      <rect
        x="6"
        y="22"
        width="16"
        height="20"
        rx="5"
        fill="currentColor"
        fillOpacity=".14"
      />
      <rect x="24" y="22" width="16" height="20" rx="5" />
      <rect x="42" y="22" width="16" height="20" rx="5" opacity=".45" />
    </>
  ),
  "Refresh Button": (
    <>
      <rect x="12" y="12" width="40" height="40" rx="10" opacity=".4" />
      <path d="M22 26a12 12 0 0 1 20 4" />
      <path d="M42 22v8h-8" />
      <path d="M42 38a12 12 0 0 1-20-4" />
      <path d="M22 42v-8h8" />
    </>
  ),
  Link: (
    <>
      {/* A line of text with one underlined word, and a pointer on it. */}
      <path d="M8 20h48M8 30h8m30 0h10M8 40h14" opacity=".3" />
      <path d="M21 30h20" />
      <path d="M21 34.5h20" strokeWidth="2.5" />
      {/* Pointing hand */}
      <path
        d="M34 38a2 2 0 0 1 4 0v8l1-.4a2 2 0 0 1 2.6 1.2l.3.9 1-.3a2 2 0 0 1 2.5 1.4l.2.7.6-.1a2 2 0 0 1 2.3 1.7l.5 3.6a6 6 0 0 1-4.7 6.7l-3 .6a6 6 0 0 1-6.1-2.6l-4.4-6.6a1.8 1.8 0 0 1 2.8-2.3l2.4 2.4z"
        fill="var(--card, #111)"
        strokeWidth="1.5"
      />
    </>
  ),
  "Text field": (
    <>
      <rect x="7" y="21" width="50" height="25" rx="4" opacity=".5" />
      <path d="M14 16h17M15 33h15" opacity=".4" />
      <path d="M36 27v13m-3-13h6m-6 13h6" />
    </>
  ),
  Search: (
    <>
      <rect x="7" y="20" width="50" height="24" rx="12" opacity=".4" />
      <circle cx="21" cy="31" r="5" />
      <path d="m25 35 4 4M36 32h12" />
    </>
  ),
  Checkbox: (
    <>
      <rect
        x="13"
        y="23"
        width="18"
        height="18"
        rx="4"
        fill="currentColor"
        fillOpacity=".1"
      />
      <path d="m18 32 3 3 5-6M39 29h12m-12 6h8" />
    </>
  ),
  Toggle: (
    <>
      <rect
        x="10"
        y="21"
        width="44"
        height="22"
        rx="11"
        fill="currentColor"
        fillOpacity=".12"
      />
      <circle cx="42" cy="32" r="7" fill="currentColor" stroke="none" />
    </>
  ),
  Theme: (
    <>
      <rect
        x="10"
        y="14"
        width="20"
        height="16"
        rx="4"
        fill="currentColor"
        fillOpacity=".12"
      />
      <rect
        x="34"
        y="14"
        width="20"
        height="16"
        rx="4"
        fill="currentColor"
        stroke="none"
      />
      <rect x="10" y="34" width="20" height="16" rx="4" opacity=".45" />
      <rect
        x="34"
        y="34"
        width="20"
        height="16"
        rx="4"
        fill="currentColor"
        fillOpacity=".35"
      />
    </>
  ),
  "Mode Toggle": (
    <>
      <path d="M32 18a14 14 0 0 1 0 28Z" fill="currentColor" stroke="none" />
      <circle cx="32" cy="32" r="14" />
      <path
        d="M32 10v3M32 51v3M10 32h3M51 32h3M16.4 16.4l2.1 2.1M45.5 45.5l2.1 2.1M16.4 47.6l2.1-2.1M45.5 18.5l2.1-2.1"
        opacity=".45"
      />
    </>
  ),
  Increment: (
    <>
      <rect x="8" y="23" width="18" height="18" rx="5" opacity=".45" />
      <rect x="38" y="23" width="18" height="18" rx="5" opacity=".45" />
      <path d="M13 32h8M42 32h10M47 27v10" />
      <path d="m29.5 29 3-2v10m-3 0h6" />
    </>
  ),
  Badge: (
    <>
      <rect
        x="10"
        y="23"
        width="44"
        height="18"
        rx="9"
        fill="currentColor"
        fillOpacity=".08"
      />
      <circle cx="20" cy="32" r="2" fill="currentColor" stroke="none" />
      <path d="M28 32h16" />
    </>
  ),
  Progress: (
    <>
      <path d="M12 23h14m19 0h7" opacity=".4" />
      <rect x="10" y="31" width="44" height="9" rx="4.5" opacity=".3" />
      <rect
        x="10"
        y="31"
        width="29"
        height="9"
        rx="4.5"
        fill="currentColor"
        stroke="none"
      />
    </>
  ),
  Bar: (
    <>
      <rect x="8" y="24" width="48" height="16" rx="4" />
      <path d="M15 32h6M18 29v6" />
      <path d="M25 32h12" opacity=".6" />
      <path d="M44 32h6" opacity=".35" />
    </>
  ),
  Array: (
    <>
      <path d="M10 44C20 16 44 16 54 44" strokeDasharray="3 4" opacity=".35" />
      <g fill="currentColor" stroke="none">
        <circle cx="12" cy="40" r="4" />
        <circle cx="21" cy="27" r="4" opacity=".8" />
        <circle cx="32" cy="23" r="4" opacity=".65" />
        <circle cx="43" cy="27" r="4" opacity=".8" />
        <circle cx="52" cy="40" r="4" />
      </g>
    </>
  ),
  "Card Corridor": (
    <>
      <path d="M4 14l10 5v26l-10 5Z" fill="currentColor" fillOpacity=".16" />
      <path d="M17 21l6 3v16l-6 3Z" opacity=".7" />
      <path d="M25.5 25.5l3 1.5v10l-3 1.5Z" opacity=".4" />
      <path d="M60 14l-10 5v26l10 5Z" fill="currentColor" fillOpacity=".16" />
      <path d="M47 21l-6 3v16l6 3Z" opacity=".7" />
      <path d="M38.5 25.5l-3 1.5v10l3 1.5Z" opacity=".4" />
    </>
  ),
  Planetary: (
    <>
      <circle cx="32" cy="32" r="11" opacity=".35" />
      <circle cx="32" cy="32" r="22" opacity=".35" />
      <circle cx="32" cy="32" r="5" />
      <g fill="currentColor" stroke="none">
        <circle cx="43" cy="32" r="3" />
        <circle cx="21" cy="32" r="3" opacity=".7" />
        <circle cx="16.4" cy="16.4" r="3.5" opacity=".8" />
        <circle cx="47.6" cy="47.6" r="3.5" />
      </g>
    </>
  ),
  "Progress Ring": (
    <>
      <circle cx="32" cy="32" r="16" strokeWidth="5" opacity=".3" />
      <path d="M32 16a16 16 0 0 1 13.86 24" strokeWidth="5" />
      <path d="M28 32h8" opacity=".5" />
    </>
  ),
  Skeleton: (
    <g fill="currentColor" stroke="none">
      <circle cx="19" cy="24" r="7" opacity=".3" />
      <rect x="31" y="19" width="21" height="5" rx="2.5" opacity=".25" />
      <rect x="31" y="28" width="14" height="4" rx="2" opacity=".15" />
      <rect x="12" y="39" width="40" height="5" rx="2.5" opacity=".2" />
      <rect x="12" y="48" width="28" height="4" rx="2" opacity=".1" />
    </g>
  ),
  Card: (
    <>
      <rect x="13" y="10" width="38" height="44" rx="5" opacity=".45" />
      <path d="M21 20h13M21 28h22m-22 6h16" />
      <rect
        x="21"
        y="42"
        width="14"
        height="5"
        rx="2"
        fill="currentColor"
        stroke="none"
        opacity=".5"
      />
    </>
  ),
  "Hero Card": (
    <>
      {/* Wide layered card: copy on the left, cut-out art on the right. */}
      <rect
        x="6"
        y="12"
        width="52"
        height="40"
        rx="6"
        fill="currentColor"
        fillOpacity=".1"
      />
      <path d="m34 50 20-20M42 50l12-12M50 50l4-4" opacity=".2" />
      <path d="M13 21h7" opacity=".5" />
      <path d="M13 28h18M13 35h13" strokeWidth="3" />
      <rect
        x="13"
        y="42"
        width="11"
        height="5"
        rx="2.5"
        fill="currentColor"
        stroke="none"
      />
      <path d="m45 19 8 14H37Z" fill="currentColor" fillOpacity=".25" />
      <path d="M45 19v14" opacity=".5" />
    </>
  ),
  Dialog: (
    <>
      <rect x="7" y="10" width="50" height="44" rx="5" opacity=".2" />
      <rect x="13" y="20" width="38" height="29" rx="4" fill="var(--card)" />
      <path d="M20 28h11m11-3 4 4m0-4-4 4M20 35h24" />
      <path d="M36 42h8" strokeWidth="3" />
    </>
  ),
  Stack: (
    <>
      <rect x="15" y="10" width="34" height="11" rx="3" />
      <rect x="15" y="27" width="34" height="10" rx="3" opacity=".6" />
      <rect x="15" y="43" width="34" height="11" rx="3" opacity=".3" />
    </>
  ),
  Kbd: (
    <>
      <rect x="16" y="16" width="32" height="32" rx="6" />
      <path d="M26 40V28l6 6 6-6v12" />
    </>
  ),
  "Text Effect": (
    <>
      <path d="M12 24h8m-4 0v16M24 32h8m-4-6v14" />
      <path d="M38 26v14" opacity=".35" />
      <path d="M46 22v12m0 5v1" />
    </>
  ),
  "Number Effect": (
    <>
      <path d="M14 26l4-3v18" />
      <path d="M26 27a5 5 0 0 1 10 0c0 5-10 9-10 14h10" />
      <path d="M44 32h10M47 38h7" opacity=".35" />
    </>
  ),
  "Mood Text": (
    <>
      <path d="M10 40h10" opacity=".35" />
      <path d="M24 38c2-6 4-6 6 0s4 6 6 0 4-6 6 0" />
      <path d="M46 40h8" opacity=".35" />
      <path d="M27 26l1.5-4M33 24l1.5-4M39 26l1.5-4" opacity=".6" />
    </>
  ),
  "Text Highlight": (
    <>
      <rect
        x="18"
        y="25"
        width="28"
        height="14"
        rx="2"
        fill="currentColor"
        stroke="none"
        opacity=".25"
      />
      <path d="M8 32h6M20 32h24M50 32h6" />
      <path d="M8 46h40" opacity=".35" />
      <path d="M8 18h30" opacity=".35" />
    </>
  ),
  Spinner: (
    <>
      <path d="M32 14a18 18 0 1 1-12.7 5.3" opacity=".35" />
      <path d="M32 14a18 18 0 0 1 12 6" />
    </>
  ),
  Marker: (
    <>
      <path d="M32 12c-8 0-14 6-14 14 0 10 14 26 14 26s14-16 14-26c0-8-6-14-14-14Z" />
      <circle cx="32" cy="26" r="4" />
    </>
  ),
  "Aspect Ratio": (
    <>
      <rect x="8" y="18" width="48" height="28" rx="3" />
      <path d="M14 24h8M14 40h8m28-16h-8m8 16h-8" />
    </>
  ),
  Reel: (
    <>
      {/* Items riding a wave, with a dashed path behind them. */}
      <path
        d="M6 40c10-20 20-20 26 0s16 20 26 0"
        strokeDasharray="3 4"
        opacity=".4"
      />
      <rect x="9" y="24" width="10" height="10" rx="2.5" opacity=".45" />
      <rect
        x="27"
        y="35"
        width="10"
        height="10"
        rx="2.5"
        fill="currentColor"
        fillOpacity=".15"
      />
      <rect x="45" y="24" width="10" height="10" rx="2.5" opacity=".45" />
    </>
  ),
  Carousel: (
    <>
      <rect x="4" y="18" width="10" height="22" rx="2" opacity=".35" />
      <rect x="50" y="18" width="10" height="22" rx="2" opacity=".35" />
      <rect
        x="19"
        y="12"
        width="26"
        height="34"
        rx="3"
        fill="currentColor"
        fillOpacity=".1"
      />
      <circle cx="26" cy="54" r="2" fill="currentColor" stroke="none" />
      <circle cx="32" cy="54" r="2" opacity=".4" />
      <circle cx="38" cy="54" r="2" opacity=".4" />
    </>
  ),
  Chart: (
    <>
      <path d="M12 50h40" />
      <rect x="16" y="32" width="8" height="18" rx="1" />
      <rect x="28" y="20" width="8" height="30" rx="1" opacity=".7" />
      <rect x="40" y="26" width="8" height="24" rx="1" opacity=".4" />
    </>
  ),
  "Button Group": (
    <>
      <rect x="8" y="20" width="48" height="24" rx="8" />
      <path d="M32 20v24" />
      <rect
        x="10"
        y="22"
        width="20"
        height="20"
        rx="6"
        fill="currentColor"
        stroke="none"
        opacity=".18"
      />
    </>
  ),
  Breadcrumb: (
    <>
      <path d="M6 32h8m12 0h8" opacity=".5" />
      <path d="m18 28 4 4-4 4m20-8 4 4-4 4" opacity=".5" />
      <rect
        x="46"
        y="26"
        width="14"
        height="12"
        rx="3"
        fill="currentColor"
        fillOpacity=".1"
      />
    </>
  ),
  "Navigation Menu": (
    <>
      <rect x="8" y="10" width="48" height="12" rx="3" />
      <path d="M14 16h8m3-1 2 2 2-2" />
      <path d="M36 16h6m4 0h6" opacity=".5" />
      <rect
        x="8"
        y="26"
        width="48"
        height="28"
        rx="3"
        fill="currentColor"
        fillOpacity=".1"
      />
      <rect x="13" y="31" width="18" height="18" rx="2" opacity=".5" />
      <path d="M36 34h14m-14 7h10m-10 7h12" opacity=".5" />
    </>
  ),
  Pagination: (
    <>
      <path d="m10 28-4 4 4 4m44-8 4 4-4 4" />
      <rect x="15" y="27" width="10" height="10" rx="2" opacity=".4" />
      <rect
        x="27"
        y="27"
        width="10"
        height="10"
        rx="2"
        fill="currentColor"
        fillOpacity=".15"
      />
      <rect x="39" y="27" width="10" height="10" rx="2" opacity=".4" />
    </>
  ),
  Menubar: (
    <>
      <rect x="8" y="10" width="48" height="10" rx="2" />
      <path d="M13 15h7" />
      <path d="M26 15h7m6 0h7" opacity=".5" />
      <rect
        x="10"
        y="24"
        width="26"
        height="28"
        rx="3"
        fill="currentColor"
        fillOpacity=".1"
      />
      <path d="M15 31h14m-14 6h10m-14 10h12" opacity=".5" />
      <path d="M13 42h20" opacity=".25" />
    </>
  ),
  Sidebar: (
    <>
      <rect x="8" y="12" width="48" height="40" rx="4" opacity=".3" />
      <path d="M24 12v40" />
      <path d="M13 22h6m-6 6h6m-6 6h4" />
    </>
  ),
  Input: (
    <>
      <rect x="8" y="22" width="48" height="20" rx="4" />
      <path d="M16 32h16" />
    </>
  ),
  "Number Input": (
    <>
      <rect x="8" y="20" width="48" height="24" rx="4" opacity=".5" />
      <path d="m15 27 3-2v14" />
      <path d="M23 28a3.5 3.5 0 0 1 7 0c0 3-7 6-7 11h7" />
      <path d="M35 25h7l-4 5.5a4.2 4.2 0 1 1-3.5 7" />
      <path d="M49 26v12" opacity=".45" />
    </>
  ),
  "Input Calculator": (
    <>
      <rect x="6" y="20" width="36" height="24" rx="4" opacity=".5" />
      <path d="M12 29h5M12 35h5" />
      <path d="M22 28c-2 2-2 6 0 8M34 28c2 2 2 6 0 8M25 28l6 8M31 28l-6 8" />
      <rect x="45" y="24" width="13" height="16" rx="3" />
      <path d="M49 32h5" opacity=".6" />
    </>
  ),
  "Input Fill": (
    <>
      <rect x="8" y="22" width="48" height="20" rx="4" />
      <path d="M14 32h4m3 0h4m6 0h4" />
      <path d="M39 32h4m3 0h4" opacity=".35" />
      <path d="M28 27v10" opacity=".6" />
    </>
  ),
  Textarea: (
    <>
      <rect x="10" y="12" width="44" height="40" rx="4" />
      <path d="M18 22h28M18 30h28M18 38h16" />
    </>
  ),
  "Input OTP": (
    <>
      <rect x="8" y="22" width="10" height="20" rx="2" />
      <rect x="21" y="22" width="10" height="20" rx="2" />
      <rect x="34" y="22" width="10" height="20" rx="2" />
      <rect x="47" y="22" width="10" height="20" rx="2" opacity=".4" />
    </>
  ),
  "Input Group": (
    <>
      <rect x="8" y="22" width="48" height="20" rx="4" />
      <path d="M22 22v20" />
      <path d="M12 32h6m16 0h14" />
    </>
  ),
  Select: (
    <>
      <rect x="8" y="22" width="48" height="20" rx="4" />
      <path d="M16 32h16m10-4 4 4-4 4" />
    </>
  ),
  "Filter Select": (
    <>
      <rect x="8" y="22" width="48" height="20" rx="4" opacity=".5" />
      <path d="M14 27h10l-4 5v5l-2-1v-4Z" />
      <path d="M29 32h8" opacity=".5" />
      <path d="m44 30 3 3 3-3" />
    </>
  ),
  "Column Filter": (
    <>
      <rect x="8" y="10" width="48" height="10" rx="2" opacity=".5" />
      <path d="M12 15h14" />
      <path d="M43 12.5h9l-3.5 4v3l-2-1v-2Z" />
      <path d="M12 28h6M12 36h6M12 44h6M12 52h6" opacity=".3" />
      <rect x="22" y="24" width="34" height="30" rx="3" />
      <path d="M28 28v6m-2-2 2 2 2-2" />
      <path d="M34 31h16" opacity=".6" />
      <path d="M22 38h34" opacity=".3" />
      <rect
        x="27"
        y="41"
        width="4"
        height="4"
        rx="1"
        fill="currentColor"
        stroke="none"
      />
      <path d="M35 43h14" opacity=".6" />
      <rect x="27" y="47" width="4" height="4" rx="1" />
      <path d="M35 49h10" opacity=".6" />
    </>
  ),
  "Native Select": (
    <>
      <rect x="8" y="22" width="48" height="20" rx="3" />
      <path d="M40 28v8m-3-3 3 3 3-3" />
      <path d="M16 32h14" opacity=".5" />
    </>
  ),
  Combobox: (
    <>
      <rect x="10" y="12" width="44" height="16" rx="3" />
      <path d="M18 20h16m12-3 3 3-3 3" />
      <rect x="10" y="32" width="44" height="20" rx="3" opacity=".4" />
      <path d="M18 39h20m-20 6h12" />
    </>
  ),
  Command: (
    <>
      <rect x="10" y="12" width="44" height="40" rx="5" />
      <path d="M18 22h20m-24 8h36M18 38h16" />
      <circle cx="44" cy="22" r="2" fill="currentColor" stroke="none" />
    </>
  ),
  Field: (
    <>
      <path d="M12 16h16" />
      <rect x="12" y="24" width="40" height="16" rx="3" />
      <path d="M12 48h24" opacity=".4" />
    </>
  ),
  Slider: (
    <>
      <path d="M10 32h44" />
      <circle cx="38" cy="32" r="6" fill="currentColor" stroke="none" />
    </>
  ),
  Calendar: (
    <>
      <rect x="10" y="14" width="44" height="36" rx="4" />
      <path d="M10 24h44M22 10v8m20-8v8" />
      <path d="M20 32h4m8 0h4m8 0h4M20 40h4m8 0h4" />
    </>
  ),
  "Radio Group": (
    <>
      <circle cx="18" cy="24" r="6" />
      <circle cx="18" cy="24" r="2.5" fill="currentColor" stroke="none" />
      <circle cx="18" cy="40" r="6" opacity=".45" />
      <path d="M30 24h18M30 40h14" opacity=".45" />
    </>
  ),
  "Toggle Group": (
    <>
      <rect x="8" y="22" width="48" height="20" rx="5" />
      <path d="M32 22v20" />
      <rect
        x="10"
        y="24"
        width="20"
        height="16"
        rx="3"
        fill="currentColor"
        stroke="none"
        opacity=".18"
      />
    </>
  ),
  Switch: (
    <>
      <rect x="14" y="22" width="36" height="20" rx="10" />
      <circle cx="26" cy="32" r="6" />
    </>
  ),
  Label: (
    <>
      <path d="M14 20h22M14 32h36M14 44h18" />
    </>
  ),
  Item: (
    <>
      <rect x="8" y="16" width="48" height="32" rx="4" />
      <rect x="14" y="24" width="10" height="10" rx="2" />
      <path d="M30 26h16M30 34h10" />
    </>
  ),
  List: (
    <>
      {/* Grouped rows: app tile, label and chevron, split by inset rules. */}
      <rect x="9" y="10" width="46" height="44" rx="6" opacity=".45" />
      <rect
        x="15"
        y="16"
        width="7"
        height="7"
        rx="2"
        fill="currentColor"
        stroke="none"
      />
      <rect
        x="15"
        y="29"
        width="7"
        height="7"
        rx="2"
        fill="currentColor"
        stroke="none"
        opacity=".6"
      />
      <rect
        x="15"
        y="42"
        width="7"
        height="7"
        rx="2"
        fill="currentColor"
        stroke="none"
        opacity=".35"
      />
      <path d="M27 19.5h14M27 32.5h10M27 45.5h12" />
      <path
        d="m47 17 2.5 2.5L47 22m0 8 2.5 2.5L47 35m0 8 2.5 2.5L47 48"
        opacity=".5"
      />
      <path d="M27 26h28M27 39h28" opacity=".2" />
    </>
  ),
  Sonner: (
    <>
      <rect x="14" y="16" width="36" height="16" rx="4" opacity=".35" />
      <rect x="10" y="28" width="44" height="18" rx="4" />
      <circle cx="20" cy="37" r="2" fill="currentColor" stroke="none" />
      <path d="M26 37h18" />
    </>
  ),
  Empty: (
    <>
      <rect x="12" y="14" width="40" height="36" rx="4" strokeDasharray="4 3" />
      <path d="M26 32h12" opacity=".5" />
    </>
  ),
  Alert: (
    <>
      <rect x="10" y="16" width="44" height="32" rx="4" />
      <path d="M32 24v10" />
      <circle cx="32" cy="40" r="1.5" fill="currentColor" stroke="none" />
    </>
  ),
  Banner: (
    <>
      <rect x="8" y="24" width="48" height="16" rx="4" />
      <path d="M16 32h6m6 0h8m6 0h6" />
      <path d="M8 16h48M8 48h48" opacity=".35" />
    </>
  ),
  "Alert Dialog": (
    <>
      <rect x="4" y="8" width="56" height="48" rx="4" opacity=".2" />
      <rect x="12" y="14" width="40" height="36" rx="4" />
      <path d="M32 18.5l6.5 11h-13Z" />
      <path d="M32 22.5v3" />
      <circle cx="32" cy="27.6" r="0.9" fill="currentColor" stroke="none" />
      <path d="M22 34h20" opacity=".45" />
      <rect x="18" y="39" width="12" height="6" rx="2" opacity=".45" />
      <rect x="34" y="39" width="12" height="6" rx="2" fill="currentColor" />
    </>
  ),
  "Confirm Dialog": (
    <>
      <rect x="4" y="8" width="56" height="48" rx="4" opacity=".2" />
      <rect x="12" y="16" width="40" height="32" rx="4" />
      <path d="M19 24h14" />
      <path d="M19 30h22" opacity=".45" />
      <rect x="19" y="37" width="11" height="6" rx="2" opacity=".45" />
      <rect x="34" y="37" width="11" height="6" rx="2" fill="currentColor" />
    </>
  ),
  Sheet: (
    <>
      <rect x="8" y="10" width="48" height="44" rx="4" opacity=".2" />
      <rect x="28" y="10" width="28" height="44" rx="4" />
      <path d="M36 22h12M36 30h12" />
    </>
  ),
  Drawer: (
    <>
      <rect x="8" y="10" width="48" height="44" rx="4" opacity=".2" />
      <rect x="8" y="34" width="48" height="20" rx="4" />
      <path d="M28 40h8" />
    </>
  ),
  Popover: (
    <>
      <rect x="10" y="8" width="44" height="30" rx="4" />
      <path d="M28 38l4 5 4-5" />
      <path d="M16 16h18" />
      <rect x="16" y="23" width="32" height="8" rx="2" opacity=".5" />
      <rect x="22" y="47" width="20" height="10" rx="3" opacity=".45" />
    </>
  ),
  "Floating Window": (
    <>
      <rect x="6" y="10" width="52" height="44" rx="4" opacity=".2" />
      {[0, 1, 2].map((col) =>
        [0, 1, 2].map((row) => (
          <circle
            key={`${col}-${row}`}
            cx={16 + col * 16}
            cy={20 + row * 12}
            r="1.4"
            fill="currentColor"
            stroke="none"
            opacity=".45"
          />
        ))
      )}
      <rect x="34" y="36" width="18" height="12" rx="2.5" />
      <path d="M26 28l6 6M32 30v4h-4" opacity=".6" />
    </>
  ),
  "Hover Card": (
    <>
      <rect x="10" y="6" width="44" height="32" rx="4" />
      <path d="M28 38l4 5 4-5" />
      <circle cx="20" cy="16" r="4" />
      <path d="M28 14h18" />
      <path d="M28 20h12M16 30h32" opacity=".5" />
      <path d="M18 52h28" opacity=".45" strokeDasharray="2 3" />
      <path d="M36 48l9 7-4 1 2 5-2 1-2-5-3 3z" />
    </>
  ),
  Tooltip: (
    <>
      <rect x="14" y="12" width="36" height="14" rx="4" />
      <path d="M21 19h22" opacity=".6" />
      <path d="M28 26l4 5 4-5" />
      <rect x="23" y="37" width="18" height="18" rx="4" opacity=".45" />
      <circle
        cx="32"
        cy="46"
        r="1.5"
        fill="currentColor"
        stroke="none"
        opacity=".6"
      />
    </>
  ),
  "Responsive Tooltip": (
    <>
      <rect x="8" y="12" width="26" height="12" rx="3" />
      <path d="M17 24l4 4 4-4" />
      <rect x="14" y="34" width="14" height="10" rx="2" opacity=".45" />
      <rect x="38" y="10" width="18" height="32" rx="3" />
      <rect x="41" y="16" width="12" height="10" rx="2" opacity=".6" />
      <path d="M47 26v4" opacity=".6" />
      <circle cx="47" cy="36" r="2" opacity=".45" />
      <path d="M21 50h26" opacity=".35" strokeDasharray="2 3" />
    </>
  ),
  "Dropdown Menu": (
    <>
      <rect x="16" y="10" width="32" height="12" rx="3" />
      <path d="M38 16h4" />
      <rect x="20" y="28" width="28" height="24" rx="3" opacity=".45" />
      <path d="M26 36h14M26 42h10" />
    </>
  ),
  "Context Menu": (
    <>
      <path d="m18 16 4 22 6-6 8 10 4-3-8-10 8-2Z" />
      <rect x="34" y="30" width="20" height="18" rx="2" opacity=".4" />
    </>
  ),
  Accordion: (
    <>
      <rect x="12" y="12" width="40" height="12" rx="2" />
      <path d="M44 18h4" />
      <rect x="12" y="28" width="40" height="24" rx="2" opacity=".4" />
      <path d="M20 36h20M20 42h14" />
    </>
  ),
  Collapsible: (
    <>
      <rect x="12" y="16" width="40" height="14" rx="3" />
      <path d="m30 21 4 4 4-4" />
      <rect x="16" y="36" width="32" height="12" rx="2" opacity=".35" />
    </>
  ),
  Tabs: (
    <>
      <path d="M10 26h18V16h16v10h10" />
      <rect x="10" y="26" width="44" height="24" rx="3" />
      <path d="M18 36h20" opacity=".5" />
    </>
  ),
  "Dynamic Tabs": (
    <>
      {/* Closable tabs with an add button at the end of the strip. */}
      <rect x="8" y="26" width="48" height="26" rx="3" />
      <path
        d="M10 26v-8a3 3 0 0 1 3-3h15a3 3 0 0 1 3 3v8"
        fill="currentColor"
        fillOpacity=".12"
      />
      <path d="M14 20.5h5m5-1.5 3 3m0-3-3 3" />
      <path d="M34 26v-6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v6" opacity=".4" />
      <path d="M51 17.5v6m-3-3h6" />
      <path d="M16 36h22M16 43h14" opacity=".45" />
    </>
  ),
  Table: (
    <>
      <rect x="10" y="14" width="44" height="36" rx="3" />
      <path d="M10 26h44M10 38h44M26 14v36" />
    </>
  ),
  Bubble: (
    <>
      <path d="M14 16h28a6 6 0 0 1 6 6v12a6 6 0 0 1-6 6H24l-8 8v-8h-2a6 6 0 0 1-6-6V22a6 6 0 0 1 6-6Z" />
    </>
  ),
  Message: (
    <>
      <circle cx="16" cy="24" r="5" />
      <rect x="26" y="16" width="26" height="16" rx="4" />
      <path d="M26 40h18" opacity=".4" />
    </>
  ),
  Attachment: (
    <>
      <path d="M28 40V22a6 6 0 0 1 12 0v16a10 10 0 0 1-20 0V24" />
      <rect x="36" y="14" width="14" height="18" rx="2" opacity=".35" />
    </>
  ),
  Questionnaire: (
    <>
      <rect x="14" y="10" width="36" height="44" rx="4" />
      <path d="m22 22 3 3 6-6M22 34l3 3 6-6" />
      <path d="M36 24h8M36 36h8" opacity=".4" />
    </>
  ),
  Separator: (
    <>
      <rect x="10" y="16" width="18" height="32" rx="3" opacity=".3" />
      <path d="M32 14v36" />
      <rect x="36" y="16" width="18" height="32" rx="3" opacity=".3" />
    </>
  ),
  Resizable: (
    <>
      <rect x="8" y="16" width="48" height="32" rx="3" />
      <path d="M32 16v32" />
      <path d="M29 29v6m6-6v6" />
    </>
  ),
  "Scroll Area": (
    <>
      <rect x="10" y="12" width="44" height="40" rx="3" />
      <path d="M18 22h22M18 30h22M18 38h16" opacity=".45" />
      <rect
        x="46"
        y="18"
        width="3"
        height="14"
        rx="1.5"
        fill="currentColor"
        stroke="none"
      />
    </>
  ),
  Direction: (
    <>
      <path d="M12 32h40" />
      <path d="m20 24-8 8 8 8m24-16 8 8-8 8" />
    </>
  ),
  "Message Scroller": (
    <>
      <rect x="16" y="10" width="28" height="10" rx="3" opacity=".3" />
      <rect x="16" y="24" width="32" height="12" rx="3" />
      <path d="M32 44v8m-4-4 4 4 4-4" />
    </>
  ),
  "Autocomplete Input": (
    <>
      <rect x="8" y="10" width="48" height="16" rx="4" />
      <path d="M16 18h18m14-3 3 3-3 3" />
      <rect x="8" y="30" width="48" height="24" rx="4" opacity=".4" />
      <path d="M16 38h22M16 46h14" />
    </>
  ),
  Form: (
    <>
      <path d="M12 14h16" />
      <rect x="12" y="20" width="40" height="10" rx="3" />
      <path d="M12 36h16" />
      <rect x="12" y="42" width="40" height="10" rx="3" opacity=".45" />
    </>
  ),
  "Image Upload": (
    <>
      <rect x="10" y="14" width="44" height="36" rx="4" />
      <path d="M32 24v16m-6-10 6-6 6 6" />
    </>
  ),
  "Lexical Editor": (
    <>
      <rect x="8" y="10" width="48" height="44" rx="4" />
      <path d="M16 20h20M16 28h28M16 36h16" />
      <path d="M36 36v10" />
    </>
  ),
  "Block Editor": (
    <>
      <rect x="8" y="10" width="48" height="44" rx="4" />
      <path d="M24 22h22M24 32h18M24 42h22" />
      <path d="M15 20v4m3-4v4M15 30v4m3-4v4" opacity=".45" />
    </>
  ),
  "Inline Editor": (
    <>
      <rect x="18" y="10" width="28" height="12" rx="3" />
      <path d="M24 16h4m4 0h4m4 0h2" opacity=".5" />
      <path d="M8 34h48M8 44h36" />
      <rect x="20" y="30" width="24" height="8" rx="1" opacity=".45" />
    </>
  ),
  "Markdown Editor": (
    <>
      <rect x="8" y="10" width="48" height="44" rx="4" />
      <path d="M32 10v44" />
      <path d="M14 26v12l4-5 4 5V26" />
      <path d="M38 24h12M38 32h8M38 40h12" opacity=".45" />
    </>
  ),
  "Mention Composer": (
    <>
      <rect x="6" y="22" width="52" height="20" rx="6" />
      <circle cx="17" cy="32" r="3" />
      <path d="M20 32v1.5a2 2 0 0 0 4 0V32a7 7 0 1 0-3 5.7" />
      <path d="M30 32h12" opacity=".45" />
      <path d="m48 28 5 4-5 4z" />
    </>
  ),
  "Date Picker": (
    <>
      <rect x="8" y="22" width="48" height="20" rx="4" />
      <rect x="40" y="26" width="12" height="12" rx="2" opacity=".5" />
      <path d="M16 32h16" />
    </>
  ),
  "Time Picker": (
    <>
      <circle cx="32" cy="32" r="22" />
      <path d="M32 18v14l9 6" />
      <circle cx="41" cy="38" r="3" opacity=".5" />
    </>
  ),
  Dialslide: (
    <>
      <path d="m10 22-5 6 5 6m44-12 5 6-5 6" />
      <rect x="14" y="20" width="10" height="16" rx="3" opacity=".45" />
      <rect
        x="27"
        y="20"
        width="10"
        height="16"
        rx="3"
        fill="currentColor"
        fillOpacity=".2"
      />
      <rect x="40" y="20" width="10" height="16" rx="3" opacity=".45" />
      <path
        d="M16 44v4m4-4v4m4-4v4m4-4v4m8-4v4m4-4v4m4-4v4m4-4v4"
        opacity=".45"
      />
      <path d="M32 42v8" />
    </>
  ),
  Pill: (
    <>
      <rect x="8" y="22" width="48" height="20" rx="10" />
      <path
        d="M32 22h14a10 10 0 0 1 0 20H32z"
        fill="currentColor"
        fillOpacity=".25"
      />
      <path d="M16 32h8m14 0h8" />
    </>
  ),
  "Badge Select": (
    <>
      <rect x="8" y="22" width="48" height="20" rx="10" />
      <path d="M16 32h18m12-4 4 4-4 4" />
    </>
  ),
  Chip: (
    <>
      <rect
        x="6"
        y="22"
        width="26"
        height="20"
        rx="10"
        fill="currentColor"
        fillOpacity=".16"
      />
      <path d="m12 32 3 3 6-6" />
      <rect x="36" y="22" width="22" height="20" rx="10" opacity=".45" />
    </>
  ),
  "Notification Badge": (
    <>
      <path d="M20 42V31a12 12 0 0 1 24 0v11l4 4H16l4-4Z" opacity=".55" />
      <path d="M28 50a4 4 0 0 0 8 0" opacity=".55" />
      <circle
        cx="45"
        cy="19"
        r="9"
        fill="currentColor"
        stroke="var(--card)"
        strokeWidth="3"
      />
      <path d="m43 16.5 2.5-2V24" stroke="var(--card)" strokeWidth="2" />
    </>
  ),
  Indicator: (
    <>
      <circle cx="30" cy="30" r="18" opacity=".45" />
      <circle cx="30" cy="25" r="6" opacity=".45" />
      <path d="M19 42a13 13 0 0 1 22 0" opacity=".45" />
      <circle cx="44" cy="44" r="6" fill="currentColor" stroke="none" />
    </>
  ),
  "Toolbar Count": (
    <>
      <rect x="6" y="20" width="52" height="24" rx="6" opacity=".4" />
      <path d="M11 32h7" opacity=".5" />
      <rect
        x="21"
        y="26"
        width="20"
        height="12"
        rx="6"
        fill="currentColor"
        fillOpacity=".18"
        stroke="none"
      />
      <path d="M25 32h5m4-2 3 3m0-3-3 3" />
      <rect x="44" y="26" width="10" height="12" rx="3" />
      <circle
        cx="54"
        cy="25"
        r="4"
        fill="currentColor"
        stroke="var(--card)"
        strokeWidth="2"
      />
    </>
  ),
  "Action Wheel": (
    <>
      <circle cx="32" cy="32" r="5" fill="currentColor" fillOpacity=".16" />
      <circle cx="32" cy="12" r="5" />
      <circle cx="46" cy="18" r="5" opacity=".4" />
      <circle cx="52" cy="32" r="5" />
      <circle cx="46" cy="46" r="5" opacity=".4" />
      <circle cx="32" cy="52" r="5" />
      <circle cx="18" cy="46" r="5" opacity=".4" />
      <circle cx="12" cy="32" r="5" />
      <circle cx="18" cy="18" r="5" opacity=".4" />
    </>
  ),
  "Floating Action Button": (
    <>
      <rect x="8" y="10" width="48" height="44" rx="6" opacity=".4" />
      <path d="M16 20h20M16 26h14" opacity=".4" />
      <rect
        x="34"
        y="32"
        width="16"
        height="16"
        rx="5"
        fill="currentColor"
        fillOpacity=".16"
      />
      <path d="M42 36v8M38 40h8" />
    </>
  ),
  Toolbar: (
    <>
      <rect x="6" y="22" width="52" height="20" rx="5" />
      <path d="M13 28h4a2 2 0 0 1 0 4h-4Zm0 4h4.5a2 2 0 0 1 0 4H13Z" />
      <path d="M27 28h4M29 28l-2 8M25 36h4" />
      <path d="M36 26v12" opacity=".4" />
      <path d="M42 29h10M42 32h7M42 35h10" />
    </>
  ),
  "Info Icon": (
    <>
      <circle cx="32" cy="32" r="18" />
      <path d="M32 28v12" />
      <circle cx="32" cy="22" r="1.5" fill="currentColor" stroke="none" />
    </>
  ),
  "Bento Grid": (
    <>
      <rect x="8" y="8" width="28" height="28" rx="4" />
      <rect x="40" y="8" width="16" height="16" rx="3" />
      <rect x="40" y="28" width="16" height="28" rx="3" opacity=".5" />
      <rect x="8" y="40" width="28" height="16" rx="3" opacity=".35" />
    </>
  ),
  Parallax: (
    <>
      <rect x="8" y="12" width="48" height="40" rx="5" opacity=".35" />
      <path d="M8 44l14-12 10 8 10-14 14 12" opacity=".6" />
      <path d="M8 50l18-8 14 6 16-8" />
      <circle cx="44" cy="22" r="4" />
    </>
  ),
  "Scroll Track": (
    <>
      <path d="M8 40c8-12 14-12 20 0s12 12 20 0" opacity=".3" />
      <path d="M8 40c8-12 14-12 20 0" />
      <circle cx="28" cy="40" r="4" fill="currentColor" />
      <path d="M8 18h48" opacity=".3" strokeWidth="4" />
      <path d="M8 18h30" strokeWidth="4" />
    </>
  ),
  "Scroll Mask": (
    <>
      <rect x="8" y="10" width="48" height="44" rx="5" opacity=".3" />
      <circle cx="32" cy="32" r="13" />
      <path d="M22 36l6-6 5 5 4-4 5 5" opacity=".45" />
    </>
  ),
  Reveal: (
    <>
      <rect x="12" y="10" width="40" height="10" rx="3" />
      <rect x="12" y="27" width="40" height="10" rx="3" opacity=".55" />
      <rect x="12" y="46" width="40" height="10" rx="3" opacity=".2" />
      <path d="M32 40v-2m0 4v2" opacity=".55" />
    </>
  ),
  "Infinite Scroll": (
    <>
      <rect x="14" y="8" width="36" height="10" rx="3" />
      <rect x="14" y="22" width="36" height="10" rx="3" opacity=".6" />
      <rect x="14" y="36" width="36" height="10" rx="3" opacity=".35" />
      <path d="M26 52h2m3 0h2m3 0h2" opacity=".6" />
    </>
  ),
  "Card Grid": (
    <>
      <rect x="8" y="12" width="48" height="40" rx="6" />
      {[0, 1, 2, 3].map((col) =>
        [0, 1, 2].map((row) => (
          <rect
            key={`${col}-${row}`}
            x={14 + col * 10}
            y={18 + row * 10}
            width="6"
            height="6"
            rx="1.5"
            opacity=".5"
          />
        ))
      )}
    </>
  ),
  "App Grid": (
    <>
      <rect x="8" y="8" width="22" height="22" rx="4" />
      <rect x="34" y="8" width="22" height="22" rx="4" />
      <rect x="8" y="34" width="22" height="22" rx="4" opacity=".6" />
      <rect x="34" y="34" width="9" height="9" rx="2" opacity=".45" />
      <rect x="47" y="34" width="9" height="9" rx="2" opacity=".45" />
      <rect x="34" y="47" width="9" height="9" rx="2" opacity=".45" />
      <rect x="47" y="47" width="9" height="9" rx="2" opacity=".45" />
    </>
  ),
  "Infinite Canvas": (
    <>
      {/* Dot grid running off every edge, two cards, and a pan cursor. */}
      {[0, 1, 2, 3, 4, 5].map((col) =>
        [0, 1, 2, 3, 4, 5].map((row) => (
          <circle
            key={`${col}-${row}`}
            cx={7 + col * 10}
            cy={7 + row * 10}
            r="1"
            fill="currentColor"
            stroke="none"
            opacity=".35"
          />
        ))
      )}
      <rect x="12" y="14" width="18" height="13" rx="2.5" />
      <rect x="34" y="30" width="18" height="13" rx="2.5" opacity=".6" />
      <path d="M30 20.5h4v16" strokeDasharray="1.5 1.5" opacity=".6" />
      <path d="M40 48l4 9 1.6-3.9L49.5 51.5z" fill="currentColor" />
    </>
  ),
  "Cell Grid": (
    <>
      {[0, 1, 2, 3, 4].map((col) =>
        [0, 1, 2, 3, 4].map((row) => (
          <rect
            key={`${col}-${row}`}
            x={9 + col * 10}
            y={9 + row * 10}
            width="7"
            height="7"
            rx="1.5"
            opacity={col === 3 && row === 1 ? 1 : 0.35}
            fill={col === 3 && row === 1 ? "currentColor" : "none"}
          />
        ))
      )}
    </>
  ),
  Heatmap: (
    <>
      {[0, 1, 2, 3, 4].map((col) =>
        [0, 1, 2, 3].map((row) => (
          <rect
            key={`${col}-${row}`}
            x={9 + col * 10}
            y={14 + row * 10}
            width="7"
            height="7"
            rx="1.5"
            fill="currentColor"
            stroke="none"
            opacity={[0.15, 0.35, 0.6, 1][(col * 3 + row * 2) % 4]}
          />
        ))
      )}
    </>
  ),
  "Calendar Heatmap": (
    <>
      <path d="M12 12h6M28 12h6M44 12h6" opacity=".45" />
      {[0, 1, 2, 3, 4, 5].map((col) =>
        [0, 1, 2, 3, 4, 5, 6].map((row) => (
          <rect
            key={`${col}-${row}`}
            x={12 + col * 7}
            y={18 + row * 6}
            width="4.5"
            height="4.5"
            rx="1"
            fill="currentColor"
            stroke="none"
            opacity={
              col === 5 && row > 3
                ? 0
                : [0.15, 0.4, 0.15, 0.7, 1, 0.4][(col * 5 + row * 3) % 6]
            }
          />
        ))
      )}
    </>
  ),
  "Activity Overview": (
    <>
      <rect x="6" y="8" width="52" height="48" rx="5" opacity=".35" />
      <path d="M12 16h16" />
      <path d="M12 22h10M26 22h10M40 22h10" opacity=".45" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((col) =>
        [0, 1, 2, 3].map((row) => (
          <rect
            key={`${col}-${row}`}
            x={12 + col * 5.25}
            y={30 + row * 5.25}
            width="3.5"
            height="3.5"
            rx=".75"
            fill="currentColor"
            stroke="none"
            opacity={[0.15, 0.45, 1, 0.3][(col * 3 + row) % 4]}
          />
        ))
      )}
    </>
  ),
  "Flip-Dots": (
    <>
      <rect x="8" y="14" width="48" height="36" rx="4" opacity=".35" />
      {[0, 1, 2, 3, 4].map((col) =>
        [0, 1, 2].map((row) => (
          <circle
            key={`${col}-${row}`}
            cx={16 + col * 8}
            cy={24 + row * 8}
            r="2.6"
            fill="currentColor"
            stroke="none"
            opacity={(col + row) % 2 ? 0.25 : 1}
          />
        ))
      )}
    </>
  ),
  "Atom Grid": (
    <>
      {[0, 1, 2, 3, 4].map((col) =>
        [0, 1, 2, 3, 4].map((row) => {
          const rim = col === 0 || row === 0 || col === 4 || row === 4
          // A comet running clockwise along the rim, brightest at the top right.
          const lit =
            row === 0 && col > 0 ? [0.3, 0.45, 0.7, 1][col - 1] : null
          return (
            <circle
              key={`${col}-${row}`}
              cx={16 + col * 8}
              cy={16 + row * 8}
              r="2.6"
              fill="currentColor"
              stroke="none"
              opacity={lit ?? (rim ? 0.2 : 0.1)}
            />
          )
        })
      )}
    </>
  ),
  Timeline: (
    <>
      <path d="M32 8v48" opacity=".35" />
      <circle cx="32" cy="16" r="3.5" fill="currentColor" stroke="none" />
      <circle cx="32" cy="32" r="3.5" />
      <circle cx="32" cy="48" r="3.5" fill="currentColor" stroke="none" />
      <path d="M36 16h4M24 32h4M36 48h4" strokeDasharray="1.5 1.5" />
      <path
        d="M44 14h12M44 19h8M8 30h12M12 35h8M44 46h12M44 51h8"
        opacity=".5"
      />
    </>
  ),
  Comments: (
    <>
      <path d="M8 12h18M44 12h12" opacity=".5" />
      <rect x="8" y="18" width="48" height="20" rx="3" opacity=".4" />
      <rect
        x="42"
        y="30"
        width="10"
        height="5"
        rx="1.5"
        fill="currentColor"
        stroke="none"
      />
      <circle cx="12" cy="47" r="3.5" />
      <path d="M20 45h16M20 50h28" opacity=".5" />
    </>
  ),
  "Chat Card": (
    <>
      <rect x="8" y="10" width="48" height="44" rx="4" opacity=".35" />
      <path
        d="M15 17h26a3 3 0 0 1 3 3v3a3 3 0 0 1-3 3H15a3 3 0 0 1-3-3v-3a3 3 0 0 1 3-3Z"
        opacity=".6"
      />
      <path
        d="M26 30h23a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3H26a3 3 0 0 1-3-3v-2a3 3 0 0 1 3-3Z"
        fill="currentColor"
        fillOpacity=".2"
      />
      <rect x="12" y="44" width="40" height="6" rx="3" opacity=".6" />
      <circle cx="48" cy="47" r="1.5" fill="currentColor" stroke="none" />
    </>
  ),
  "Character Chat": (
    <>
      <circle cx="16" cy="22" r="7" opacity=".6" />
      <path d="M5 44c1-8 5-12 11-12s10 4 11 12" opacity=".6" />
      <rect x="10" y="36" width="48" height="20" rx="2" />
      <rect
        x="24"
        y="31"
        width="16"
        height="7"
        rx="1"
        fill="currentColor"
        fillOpacity=".25"
      />
      <path d="M24 45h26M24 50h16" opacity=".5" />
      <path d="M50 50h4l-2 3Z" fill="currentColor" stroke="none" />
    </>
  ),
  "Digital Clock": (
    <>
      <rect x="6" y="16" width="52" height="32" rx="4" opacity=".35" />
      <path d="M13 24v16M18 24h6v8h-6v8h6M35 24v8h6M41 24v16M52 24h-6v8h6v8h-6" />
      <circle cx="29.5" cy="28" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="29.5" cy="36" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  "PDF Display": (
    <>
      <path d="M16 8h22l10 10v38H16Z" opacity=".4" />
      <path d="M38 8v10h10" opacity=".4" />
      <rect
        x="10"
        y="30"
        width="26"
        height="14"
        rx="2"
        fill="currentColor"
        fillOpacity=".14"
      />
      <path d="M14 41v-8h3a2 2 0 0 1 0 4h-3M22 33v8h2a3 3 0 0 0 3-3v-2a3 3 0 0 0-3-3ZM31 41v-8h4M31 37h3" />
      <path d="M40 48h4" opacity=".5" />
    </>
  ),
  "Markdown Display": (
    <>
      <rect x="8" y="16" width="48" height="32" rx="4" opacity=".4" />
      <path d="M15 40V24l6 7 6-7v16" />
      <path d="M42 24v16m-6-6 6 6 6-6" />
    </>
  ),
  "SVG Display": (
    <>
      <rect x="8" y="12" width="48" height="40" rx="4" opacity=".4" />
      {[0, 1, 2, 3, 4, 5].map((col) =>
        [0, 1, 2, 3, 4].map((row) =>
          (col + row) % 2 ? null : (
            <rect
              key={`${col}-${row}`}
              x={8 + col * 8}
              y={12 + row * 8}
              width="8"
              height="8"
              fill="currentColor"
              fillOpacity=".08"
              stroke="none"
            />
          )
        )
      )}
      <path d="m22 42 10-18 10 18Z" fill="currentColor" fillOpacity=".2" />
      <circle cx="22" cy="42" r="2" fill="currentColor" stroke="none" />
      <circle cx="32" cy="24" r="2" fill="currentColor" stroke="none" />
      <circle cx="42" cy="42" r="2" fill="currentColor" stroke="none" />
    </>
  ),
  "Video Display": (
    <>
      <rect x="6" y="12" width="52" height="36" rx="4" opacity=".4" />
      <path d="m28 23 10 7-10 7Z" fill="currentColor" />
      <path d="M12 42h40" opacity=".35" />
      <path d="M12 42h16" strokeWidth="2.5" />
      <path d="M22 54h20" opacity=".5" />
    </>
  ),
  "Audio Display": (
    <>
      <rect x="6" y="18" width="52" height="28" rx="4" opacity=".4" />
      <circle cx="17" cy="32" r="6" fill="currentColor" fillOpacity=".14" />
      <path d="m15.5 29 4 3-4 3Z" fill="currentColor" />
      {[5, 11, 7, 14, 9, 12, 6, 10, 4].map((height, index) => (
        <path
          key={index}
          d={`M${29 + index * 3} ${32 - height / 2}v${height}`}
          opacity={index < 4 ? 1 : 0.4}
        />
      ))}
    </>
  ),
  "JSON Display": (
    <>
      <path d="M18 12h-2a4 4 0 0 0-4 4v10l-4 6 4 6v10a4 4 0 0 0 4 4h2" />
      <path d="M46 12h2a4 4 0 0 1 4 4v10l4 6-4 6v10a4 4 0 0 1-4 4h-2" />
      <path d="m23 22 3 3-3 3" opacity=".6" />
      <path d="M30 25h10M26 32h14M26 39h8" opacity=".6" />
    </>
  ),
  "JSON Viewer": (
    <>
      <rect x="8" y="12" width="48" height="40" rx="4" />
      <path d="M8 20h48" opacity=".6" />
      <path d="M24 20v32" opacity=".4" />
      <path d="M13 27h6M13 35h6M13 43h6" />
      <rect x="29" y="31" width="22" height="16" rx="2" opacity=".6" />
      <path d="M29 36h22M29 27h14" opacity=".6" />
    </>
  ),
  "Draw Display": (
    <>
      <rect x="6" y="12" width="52" height="40" rx="4" opacity=".4" />
      <path d="M14 42c4-10 8-16 12-12s2 10 7 8 6-12 11-14" />
      <path
        d="m44 30 8-8a2.8 2.8 0 0 1 4 4l-8 8-5 1Z"
        fill="currentColor"
        fillOpacity=".14"
      />
    </>
  ),
  "Card Bar": (
    <>
      <rect x="10" y="16" width="44" height="32" rx="5" />
      <path d="M10 28h44" />
      <path d="M18 22h12M18 36h20" />
    </>
  ),
  "Table Grid": (
    <>
      <rect x="8" y="12" width="22" height="18" rx="3" />
      <rect x="34" y="12" width="22" height="18" rx="3" />
      <rect x="8" y="34" width="22" height="18" rx="3" opacity=".5" />
      <rect x="34" y="34" width="22" height="18" rx="3" opacity=".5" />
    </>
  ),
  Math: (
    <>
      <path d="M16 20h32M16 44h32" />
      <path d="m22 28 8 8m0-8-8 8M38 28v16" />
    </>
  ),
  "Social Media Buttons": (
    <>
      <rect x="6" y="22" width="16" height="20" rx="2" />
      <path d="M16 27h-2a2 2 0 0 0-2 2v9M10 32h5" />
      <rect x="24" y="22" width="16" height="20" rx="2" opacity=".6" />
      <path d="m28 27 8 10m0-10-8 10" opacity=".6" />
      <rect x="42" y="22" width="16" height="20" rx="2" opacity=".35" />
      <path d="M46 31v6M46 28v.01M50 37v-4a2 2 0 0 1 4 0v4" opacity=".35" />
    </>
  ),
  "Share Button": (
    <>
      <rect x="8" y="20" width="48" height="24" rx="8" />
      <circle cx="22" cy="27" r="2.5" />
      <circle cx="22" cy="37" r="2.5" />
      <circle cx="15" cy="32" r="2.5" />
      <path d="m17.2 30.8 2.6-2.1M17.2 33.2l2.6 2.1M30 32h18" />
    </>
  ),
  "Print Button": (
    <>
      <rect x="8" y="20" width="48" height="24" rx="8" />
      <path d="M15 29v-4h8v4M14 36h-1v-7h12v7h-1" />
      <rect x="16" y="33" width="6" height="5" />
      <path d="M31 32h17" />
    </>
  ),
  "Excel Button": (
    <>
      <rect x="8" y="20" width="48" height="24" rx="8" />
      <rect x="13" y="26" width="12" height="12" rx="1.5" />
      <path d="M13 30h12M13 34h12M19 26v12" />
      <path d="M31 32h17" />
    </>
  ),
  "CSV Button": (
    <>
      <rect x="8" y="20" width="48" height="24" rx="8" />
      <path d="M21 25h-5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-9z" />
      <path d="M21 25v4h5M18 33h5M18 36h5" />
      <path d="M31 32h17" />
    </>
  ),
  "Download Button": (
    <>
      <rect x="8" y="20" width="48" height="24" rx="8" />
      <path d="M20 25v9m-4-4 4 4 4-4M15 38h10" />
      <path d="M31 32h17" />
    </>
  ),
  "Upload Button": (
    <>
      <rect x="8" y="20" width="48" height="24" rx="8" />
      <path d="M20 35v-9m-4 4 4-4 4 4M15 38h10" />
      <path d="M31 32h17" />
    </>
  ),
  "Webcam Button": (
    <>
      <rect x="8" y="20" width="48" height="24" rx="8" />
      <rect x="13" y="27" width="10" height="10" rx="2" />
      <path d="m23 30.5 4-2.5v8l-4-2.5" />
      <path d="M32 32h16" />
    </>
  ),
  "Mic Button": (
    <>
      <rect x="8" y="20" width="48" height="24" rx="8" />
      <rect x="17" y="25" width="6" height="10" rx="3" />
      <path d="M14.5 32a5.5 5.5 0 0 0 11 0M20 37.5V40" />
      <path d="M32 29v6M36 27v10M40 30v4" />
    </>
  ),
  "Volume Button": (
    <>
      <path d="M10 28h4l6-5v18l-6-5h-4z" />
      <path d="M24 28.5a5 5 0 0 1 0 7" />
      <path d="M30 32h24" opacity=".35" />
      <path d="M30 32h14" />
      <circle cx="44" cy="32" r="3" />
    </>
  ),
  "Email Button": (
    <>
      <rect x="8" y="20" width="48" height="24" rx="8" />
      <rect x="13" y="26" width="14" height="11" rx="1.5" />
      <path d="m13.5 27 6.5 5 6.5-5" />
      <path d="M32 32h16" />
    </>
  ),
  "Copy Button": (
    <>
      <rect x="8" y="20" width="48" height="24" rx="8" />
      <rect x="17" y="28" width="9" height="10" rx="1.5" />
      <path d="M14 34v-7.5a1.5 1.5 0 0 1 1.5-1.5H22" />
      <path d="M32 32h16" />
    </>
  ),
  "Scroll Horizontal Button": (
    <>
      <rect x="6" y="20" width="22" height="24" rx="8" />
      <path d="m20 28-6 4 6 4" />
      <rect x="36" y="20" width="22" height="24" rx="8" />
      <path d="m44 28 6 4-6 4" />
    </>
  ),
  "Loading State": (
    <>
      <rect x="8" y="14" width="48" height="16" rx="8" opacity=".45" />
      <circle cx="18" cy="22" r="4" opacity=".3" />
      <path d="M18 18a4 4 0 0 1 4 4" />
      <path d="M27 22h20" opacity=".5" />
      <rect
        x="8"
        y="34"
        width="48"
        height="16"
        rx="8"
        fill="currentColor"
        fillOpacity=".12"
      />
      <path d="m14.5 42 2.5 2.5 4.5-5" />
      <path d="M27 42h14" />
    </>
  ),
  Cursor: (
    <>
      <path d="M20 12 44 30l-10 3-5 11z" />
      <circle cx="22" cy="14" r="12" opacity=".35" />
    </>
  ),
  "Cursor Label": (
    <>
      <path d="M8 20h48M20 8v48" opacity=".35" />
      <circle cx="20" cy="20" r="4" />
      <rect x="28" y="30" width="26" height="12" rx="3" />
    </>
  ),
  "Control Bar": (
    <>
      <rect x="6" y="22" width="28" height="20" rx="10" />
      <rect x="38" y="22" width="20" height="20" rx="6" />
      <circle cx="16" cy="32" r="4" />
    </>
  ),
  "Page Header": (
    <>
      <path d="M10 18h28" />
      <path d="M10 28h18" opacity=".45" />
      <rect x="42" y="14" width="14" height="10" rx="4" />
      <path d="M10 44h44" opacity=".25" />
    </>
  ),
  "App Bar": (
    <>
      <path d="M6 24h52" opacity=".3" />
      <path d="M10 14h8M10 17h8" />
      <path d="M24 16h16" />
      <circle cx="48" cy="16" r="2" fill="currentColor" stroke="none" />
      <circle cx="54" cy="16" r="2" fill="currentColor" stroke="none" />
      <path d="M10 36h26" strokeWidth="5" />
      <path d="M10 46h18" opacity=".4" />
    </>
  ),
  "Navigation Bar": (
    <>
      <path d="M6 42h52" opacity=".3" />
      <rect
        x="10"
        y="46"
        width="14"
        height="8"
        rx="4"
        fill="currentColor"
        stroke="none"
      />
      <circle cx="32" cy="50" r="3" />
      <circle cx="47" cy="50" r="3" />
    </>
  ),
  "Navigation Rail": (
    <>
      <path d="M22 8v48" opacity=".3" />
      <rect
        x="7"
        y="16"
        width="10"
        height="8"
        rx="4"
        fill="currentColor"
        stroke="none"
      />
      <circle cx="12" cy="34" r="3" />
      <circle cx="12" cy="46" r="3" />
      <path d="M30 18h24M30 28h16" opacity=".4" />
    </>
  ),
  "Navigation Drawer": (
    <>
      <path d="M10 14h20" opacity=".4" />
      <rect
        x="8"
        y="22"
        width="40"
        height="10"
        rx="5"
        fill="currentColor"
        stroke="none"
      />
      <path d="M13 42h30M13 52h24" />
    </>
  ),
  Wizard: (
    <>
      <rect x="7" y="10" width="50" height="44" rx="5" opacity=".2" />
      <rect x="11" y="15" width="42" height="35" rx="4" fill="var(--card)" />
      <circle cx="20" cy="23" r="2.5" fill="currentColor" stroke="none" />
      <path d="M24 23h4" />
      <circle cx="32" cy="23" r="2.5" />
      <path d="M36 23h4" opacity=".4" />
      <circle cx="44" cy="23" r="2.5" opacity=".4" />
      <path d="M17 32h28" opacity=".55" />
      <path d="M17 37h18" opacity=".35" />
      <rect x="17" y="42" width="10" height="4" rx="2" opacity=".45" />
      <rect x="36" y="42" width="11" height="4" rx="2" fill="currentColor" />
    </>
  ),
  "Tabbed Dialog": (
    <>
      <rect x="7" y="10" width="50" height="44" rx="5" opacity=".2" />
      <rect x="11" y="15" width="42" height="35" rx="4" fill="var(--card)" />
      <rect
        x="16"
        y="19"
        width="11"
        height="6"
        rx="2"
        fill="currentColor"
        fillOpacity=".16"
      />
      <path d="M31 22h7m4 0h6" opacity=".45" />
      <path d="M11 29h42" opacity=".25" />
      <path d="M17 35h26" opacity=".55" />
      <path d="M17 40h16" opacity=".35" />
      <path d="M40 45h7" strokeWidth="3" />
    </>
  ),
  "Arrangeable Grid": (
    <>
      <rect x="10" y="10" width="13" height="13" rx="2" opacity=".4" />
      <rect x="25.5" y="10" width="13" height="13" rx="2" opacity=".4" />
      <rect x="41" y="10" width="13" height="13" rx="2" opacity=".4" />
      <rect x="10" y="25.5" width="13" height="13" rx="2" opacity=".4" />
      <rect
        x="25.5"
        y="25.5"
        width="13"
        height="13"
        rx="2"
        strokeDasharray="3 2"
      />
      <rect x="41" y="25.5" width="13" height="13" rx="2" opacity=".4" />
      <rect x="10" y="41" width="13" height="13" rx="2" opacity=".4" />
      <rect x="25.5" y="41" width="13" height="13" rx="2" opacity=".4" />
      <rect x="41" y="41" width="13" height="13" rx="2" opacity=".4" />
      <rect
        x="31"
        y="31"
        width="13"
        height="13"
        rx="2"
        fill="currentColor"
        fillOpacity=".16"
      />
    </>
  ),
  Draggable: (
    <>
      <rect x="10" y="12" width="44" height="10" rx="3" opacity=".4" />
      <rect
        x="14"
        y="27"
        width="44"
        height="10"
        rx="3"
        fill="currentColor"
        fillOpacity=".16"
      />
      <rect x="10" y="42" width="44" height="10" rx="3" opacity=".4" />
      <path d="M20 30v4m4-4v4" />
    </>
  ),
  Kanban: (
    <>
      <rect x="8" y="10" width="14" height="44" rx="3" opacity=".4" />
      <rect x="25" y="10" width="14" height="44" rx="3" opacity=".4" />
      <rect x="42" y="10" width="14" height="44" rx="3" opacity=".4" />
      <rect x="10" y="14" width="10" height="8" rx="2" />
      <rect x="10" y="25" width="10" height="8" rx="2" />
      <rect
        x="27"
        y="14"
        width="10"
        height="8"
        rx="2"
        fill="currentColor"
        fillOpacity=".16"
      />
      <rect x="44" y="14" width="10" height="8" rx="2" />
    </>
  ),
  Gantt: (
    <>
      <path d="M8 14h48M22 14v38" opacity=".4" />
      <path d="M11 22h7M11 31h7M11 40h7M11 48h7" opacity=".5" />
      <rect x="25" y="19" width="14" height="5" rx="1" />
      <rect
        x="33"
        y="28"
        width="12"
        height="5"
        rx="1"
        fill="currentColor"
        fillOpacity=".16"
      />
      <rect x="40" y="37" width="12" height="5" rx="1" />
      <path d="M52 44.5l3 3-3 3-3-3Z" fill="currentColor" stroke="none" />
      <path d="M36 12v42" strokeDasharray="2 2" opacity=".6" />
    </>
  ),
  Stepper: (
    <>
      <rect
        x="6"
        y="26"
        width="12"
        height="12"
        rx="3"
        fill="currentColor"
        fillOpacity=".16"
      />
      <rect x="26" y="26" width="12" height="12" rx="3" />
      <rect x="46" y="26" width="12" height="12" rx="3" opacity=".4" />
      <path d="M18 32h8m12 0h8" />
      <path d="M9 32l2 2 4-4" />
    </>
  ),
  Steps: (
    <>
      <rect
        x="8"
        y="8"
        width="21"
        height="21"
        rx="3"
        strokeDasharray="2 2"
        opacity=".5"
      />
      <rect
        x="35"
        y="8"
        width="21"
        height="21"
        rx="3"
        strokeDasharray="2 2"
        opacity=".5"
      />
      <rect
        x="8"
        y="35"
        width="21"
        height="21"
        rx="3"
        strokeDasharray="2 2"
        opacity=".5"
      />
      <rect
        x="35"
        y="35"
        width="21"
        height="21"
        rx="3"
        strokeDasharray="2 2"
        opacity=".5"
      />
      <circle cx="18.5" cy="18.5" r="5" fill="currentColor" fillOpacity=".16" />
      <path d="m16 18.5 1.8 1.8 3.2-3.2" />
      <path d="M40 18.5h11" />
      <path d="M13 42h11M13 49h7" />
      <circle cx="45.5" cy="45.5" r="5" />
      <circle cx="45.5" cy="45.5" r="1.8" fill="currentColor" stroke="none" />
    </>
  ),
  "Popover Wizard": (
    <>
      <rect x="8" y="6" width="48" height="36" rx="4" />
      <path d="M28 42l4 5 4-5" />
      <circle cx="16" cy="14" r="2" fill="currentColor" stroke="none" />
      <path d="M20 14h6" />
      <circle cx="30" cy="14" r="2" />
      <path d="M34 14h6" opacity=".4" />
      <circle cx="44" cy="14" r="2" opacity=".4" />
      <path d="M14 23h26" opacity=".5" />
      <rect x="14" y="31" width="12" height="6" rx="2" opacity=".45" />
      <rect x="38" y="31" width="12" height="6" rx="2" fill="currentColor" />
      <rect x="22" y="51" width="20" height="8" rx="3" opacity=".45" />
    </>
  ),
  Rater: (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          d={starPath(10 + i * 11, 32, 6.5, 2.8)}
          fill={i < 3 ? "currentColor" : "none"}
          fillOpacity={i < 3 ? 0.9 : undefined}
          opacity={i < 3 ? 1 : 0.4}
          strokeWidth="1.25"
        />
      ))}
    </>
  ),
  Thumbs: (
    <>
      {/* Thumbs up (chosen, filled) beside thumbs down. */}
      <g transform="translate(6 20) scale(1.1)">
        <path d="M7 10v12" />
        <path
          d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"
          fill="currentColor"
          fillOpacity=".9"
        />
      </g>
      <g transform="translate(32 20) scale(1.1)" opacity=".45">
        <path d="M17 14V2" />
        <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
      </g>
    </>
  ),
  Heart: (
    <>
      {/* A filled heart with a burst of dots around it. */}
      <g transform="translate(17 18) scale(1.25)">
        <path
          d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
          fill="currentColor"
          fillOpacity=".9"
        />
      </g>
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <circle
          key={angle}
          cx={32 + 23 * Math.sin((angle * Math.PI) / 180)}
          cy={32 - 23 * Math.cos((angle * Math.PI) / 180)}
          r="1.8"
          fill="currentColor"
          stroke="none"
          opacity=".5"
        />
      ))}
    </>
  ),
  Masonry: (
    <>
      <rect x="8" y="8" width="14" height="20" rx="3" />
      <rect x="8" y="32" width="14" height="24" rx="3" opacity=".45" />
      <rect x="25" y="8" width="14" height="30" rx="3" opacity=".6" />
      <rect x="25" y="42" width="14" height="14" rx="3" />
      <rect x="42" y="8" width="14" height="12" rx="3" opacity=".45" />
      <rect x="42" y="24" width="14" height="32" rx="3" />
    </>
  ),
  Gradient: (
    <>
      <g stroke="none" fill="currentColor">
        <rect x="12" y="16" width="10" height="32" opacity=".06" />
        <rect x="22" y="16" width="10" height="32" opacity=".2" />
        <rect x="32" y="16" width="10" height="32" opacity=".42" />
        <rect x="42" y="16" width="10" height="32" opacity=".75" />
      </g>
      <rect x="10" y="14" width="44" height="36" rx="4" opacity=".5" />
    </>
  ),
  Noise: (
    <>
      <rect x="10" y="14" width="44" height="36" rx="4" opacity=".35" />
      <g stroke="none" fill="currentColor">
        {noiseSpecks.map((speck, i) => (
          <circle
            key={i}
            cx={speck.x}
            cy={speck.y}
            r={speck.r}
            opacity={speck.opacity}
          />
        ))}
      </g>
    </>
  ),
  Pattern: (
    <>
      <rect x="10" y="10" width="44" height="44" rx="4" opacity=".35" />
      {[0, 1, 2].map((col) =>
        [0, 1, 2].map((row) =>
          (col + row) % 2 ? (
            <circle
              key={`${col}-${row}`}
              cx={20 + col * 12}
              cy={20 + row * 12}
              r="2"
              fill="currentColor"
              stroke="none"
            />
          ) : (
            <path
              key={`${col}-${row}`}
              d={`M${16 + col * 12} ${20 + row * 12}h8m-4-4v8`}
            />
          )
        )
      )}
    </>
  ),
  Screentone: (
    <>
      <rect x="10" y="10" width="44" height="44" rx="4" opacity=".35" />
      <g stroke="none" fill="currentColor">
        {[0, 1, 2, 3, 4].map((col) =>
          [0, 1, 2, 3, 4].map((row) => (
            <circle
              key={`${col}-${row}`}
              cx={16 + col * 8}
              cy={16 + row * 8}
              r={0.6 + (col + row) * 0.42}
            />
          ))
        )}
      </g>
    </>
  ),
  Shader: (
    <>
      <rect x="10" y="12" width="44" height="40" rx="4" opacity=".35" />
      <path d="M12 24c7-6 13 6 20 0s13-6 20 0" />
      <path d="M12 32c7-6 13 6 20 0s13-6 20 0" opacity=".65" />
      <path d="M12 40c7-6 13 6 20 0s13-6 20 0" opacity=".35" />
    </>
  ),
  "Image Shader": (
    <>
      <rect x="10" y="14" width="44" height="36" rx="4" opacity=".5" />
      <circle cx="22" cy="24" r="4" />
      <path d="m11 44 13-12 9 8 8-7 12 11" />
      <path
        d="M34 20c3-3 6 3 9 0s6-3 9 0M34 27c3-3 6 3 9 0s6-3 9 0"
        opacity=".5"
      />
    </>
  ),
  "Color Picker": (
    <>
      <rect x="8" y="22" width="48" height="20" rx="4" opacity=".4" />
      <rect
        x="12"
        y="26"
        width="12"
        height="12"
        rx="2"
        fill="currentColor"
        fillOpacity=".35"
      />
      <path d="M29 32h14" opacity=".6" />
      <path d="m50 27-4 4m-1-1 3 3-6 6h-2v-2Z" opacity=".8" />
    </>
  ),
  "Color Grade": (
    <>
      <rect x="10" y="10" width="44" height="44" rx="4" opacity=".35" />
      <path d="M14 50 50 14" strokeDasharray="2 3" opacity=".3" />
      <path d="M14 50C30 50 34 14 50 14" />
      <circle cx="24.1" cy="44.4" r="2.5" fill="currentColor" stroke="none" />
      <circle cx="39.9" cy="19.6" r="2.5" fill="currentColor" stroke="none" />
    </>
  ),
  Distort: (
    <>
      <rect x="10" y="10" width="44" height="44" rx="4" opacity=".35" />
      <path d="M21 12q-6 20 0 40M32 12v40M43 12q6 20 0 40" opacity=".6" />
      <path d="M12 21q20-6 40 0M12 32h40M12 43q20 6 40 0" />
    </>
  ),
  Mask: (
    <>
      <path
        d="M14 10h36a4 4 0 0 1 4 4v36a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4V14a4 4 0 0 1 4-4ZM32 20a12 12 0 1 0 0 24 12 12 0 1 0 0-24Z"
        fill="currentColor"
        fillOpacity=".18"
        fillRule="evenodd"
        opacity=".5"
      />
      <circle cx="32" cy="32" r="12" strokeDasharray="3 3" />
    </>
  ),
  Art: (
    <>
      <rect x="8" y="10" width="48" height="44" rx="4" opacity=".35" />
      <circle cx="24" cy="26" r="8" fill="currentColor" fillOpacity=".18" />
      <path d="M40 18 L48 32 L32 32Z" />
      <rect
        x="30"
        y="38"
        width="16"
        height="10"
        rx="2"
        opacity=".6"
        transform="rotate(-12 38 43)"
      />
      <path
        d="M18 44 l2 -5 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2Z"
        fill="currentColor"
        stroke="none"
      />
    </>
  ),
  Surface: (
    <>
      <rect x="20" y="8" width="36" height="28" rx="4" opacity=".35" />
      <rect x="14" y="18" width="36" height="28" rx="4" opacity=".6" />
      <rect
        x="8"
        y="28"
        width="36"
        height="28"
        rx="4"
        fill="currentColor"
        fillOpacity=".12"
      />
    </>
  ),
  "Phone Input": (
    <>
      <rect x="8" y="22" width="48" height="20" rx="4" />
      <rect
        x="13"
        y="27"
        width="10"
        height="10"
        rx="2"
        fill="currentColor"
        fillOpacity=".18"
      />
      <path d="m26 31 2 2 2-2" opacity=".6" />
      <path d="M34 26v12" opacity=".35" />
      <path d="M38 32h4m3 0h4" />
    </>
  ),
  "Miller Select": (
    <>
      <rect x="6" y="14" width="52" height="36" rx="4" opacity=".4" />
      <path d="M23 14v36M40 14v36" opacity=".4" />
      <rect
        x="8"
        y="24"
        width="13"
        height="8"
        rx="2"
        fill="currentColor"
        fillOpacity=".18"
        stroke="none"
      />
      <rect
        x="25"
        y="32"
        width="13"
        height="8"
        rx="2"
        fill="currentColor"
        fillOpacity=".18"
        stroke="none"
      />
      <path d="M10 20h7m-7 8h6m-6 8h7M27 20h6m-6 8h7m-7 8h6M44 22h10m-10 6h7" />
      <path d="m18 26 2 2-2 2m17 4 2 2-2 2" opacity=".6" />
    </>
  ),
  "Data Grid": (
    <>
      <rect
        x="8"
        y="12"
        width="48"
        height="10"
        fill="currentColor"
        fillOpacity=".12"
        stroke="none"
      />
      <rect x="8" y="12" width="48" height="40" rx="3" />
      <path
        d="M8 22h48M8 32h48M8 42h48M20 12v40M32 12v40M44 12v40"
        opacity=".45"
      />
      <rect x="32" y="32" width="12" height="10" strokeWidth="2.5" />
    </>
  ),
  Spreadsheet: (
    <>
      <rect x="8" y="10" width="48" height="8" rx="2" opacity=".5" />
      <path d="M12 14h2M17 14h9" />
      <rect x="8" y="22" width="48" height="32" rx="3" />
      <path d="M8 30h48M8 38h48M8 46h48M20 22v32M38 22v32" opacity=".45" />
      <path d="M24 49h10" strokeWidth="2.5" />
    </>
  ),
  "Data Table": (
    <>
      <rect x="8" y="12" width="48" height="40" rx="3" opacity=".45" />
      <path d="M8 22h48" />
      <path d="M8 32h48M8 42h48" opacity=".25" />
      <rect x="12" y="15" width="4" height="4" rx="1" />
      <rect
        x="12"
        y="25"
        width="4"
        height="4"
        rx="1"
        fill="currentColor"
        stroke="none"
      />
      <rect x="12" y="35" width="4" height="4" rx="1" />
      <rect x="12" y="45" width="4" height="4" rx="1" opacity=".5" />
      <path d="M22 17h14M22 27h18M22 37h12M22 47h16" opacity=".6" />
      <path d="m46 16 2-2 2 2m-4 3 2 2 2-2" />
    </>
  ),
  Article: (
    <>
      <rect x="12" y="8" width="40" height="48" rx="4" opacity=".4" />
      <path d="M18 16h22" strokeWidth="3" />
      <rect
        x="18"
        y="22"
        width="28"
        height="12"
        rx="2"
        fill="currentColor"
        fillOpacity=".14"
      />
      <path d="M18 40h28M18 45h28M18 50h18" opacity=".6" />
    </>
  ),
} satisfies Record<string, ReactNode>

export type GalleryIconName = keyof typeof icons

const aliases: Record<string, GalleryIconName> = {
  "Standard Table": "Table",
  "Table List": "Table",
  Toast: "Sonner",
}

function hashedIcon(name: string) {
  let hash = 0
  for (const char of name) {
    hash = (hash * 31 + char.charCodeAt(0)) % 997
  }

  const x = 14 + (hash % 18)
  const y = 14 + ((hash * 7) % 18)
  const r = 6 + (hash % 8)

  return (
    <>
      <rect x="10" y="10" width="44" height="44" rx="8" opacity=".35" />
      <circle cx={x + 10} cy={y + 10} r={r} />
      <path d={`M18 46h${20 + (hash % 16)}`} />
    </>
  )
}

export function GalleryIcon({ name }: { name: string }) {
  const resolved = aliases[name] ?? name
  const icon = icons[resolved as GalleryIconName] ?? hashedIcon(name)

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-16 text-foreground/80"
    >
      {icon}
    </svg>
  )
}
