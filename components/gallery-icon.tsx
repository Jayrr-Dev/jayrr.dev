import type { ReactNode } from "react"

const icons = {
  Heading: (
    <>
      <path d="M15 23v18m16-18v18M15 32h16M39 28l5-3v16m-5 0h10" />
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
        y="21"
        width="48"
        height="22"
        rx="6"
        fill="currentColor"
        fillOpacity=".1"
      />
      <path d="M18 32h15m7-4 4 4-4 4" />
    </>
  ),
  Link: (
    <>
      <path d="M13 31h25m-25 7h25m5-16h9v9m-14 5 14-14" />
      <path d="M13 44h39" opacity=".3" />
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
  Radio: (
    <>
      <circle cx="22" cy="32" r="10" />
      <circle cx="22" cy="32" r="4" fill="currentColor" stroke="none" />
      <path d="M40 29h12m-12 6h8" opacity=".5" />
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
  "Field label": (
    <>
      <path d="M12 21h20m-20 6h13m16-9v6m-3-4 6 2m-6 0 6-2" />
      <rect x="12" y="35" width="40" height="13" rx="3" opacity=".25" />
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
  Dialog: (
    <>
      <rect x="7" y="10" width="50" height="44" rx="5" opacity=".2" />
      <rect x="13" y="20" width="38" height="29" rx="4" fill="var(--card)" />
      <path d="M20 28h11m11-3 4 4m0-4-4 4M20 35h24" />
      <path d="M36 42h8" strokeWidth="3" />
    </>
  ),
  Divider: (
    <>
      <path d="M17 20h30M17 44h30" opacity=".2" />
      <path d="M9 32h46" />
    </>
  ),
  Stack: (
    <>
      <rect x="15" y="10" width="34" height="11" rx="3" />
      <rect x="15" y="27" width="34" height="10" rx="3" opacity=".6" />
      <rect x="15" y="43" width="34" height="11" rx="3" opacity=".3" />
    </>
  ),
  Row: (
    <>
      <rect x="10" y="15" width="11" height="34" rx="3" />
      <rect x="27" y="15" width="10" height="34" rx="3" opacity=".6" />
      <rect x="43" y="15" width="11" height="34" rx="3" opacity=".3" />
    </>
  ),
} satisfies Record<string, ReactNode>

export type GalleryIconName = keyof typeof icons

export function GalleryIcon({ name }: { name: GalleryIconName }) {
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
      {icons[name]}
    </svg>
  )
}
