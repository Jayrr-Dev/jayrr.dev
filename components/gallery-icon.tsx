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
  "Button Base": (
    <>
      <rect x="10" y="22" width="44" height="20" rx="6" />
    </>
  ),
  "Standard Button": (
    <>
      <rect
        x="8"
        y="20"
        width="48"
        height="24"
        rx="8"
        fill="currentColor"
        fillOpacity=".22"
      />
      <path d="M22 32h20" />
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
  "Button Back": (
    <>
      <rect x="8" y="20" width="48" height="24" rx="8" opacity=".45" />
      <path d="m28 24-8 8 8 8M20 32h22" />
    </>
  ),
  "Button Enhanced": (
    <>
      <rect x="8" y="20" width="48" height="24" rx="8" opacity=".45" />
      <path d="M22 25v14M15 32h14" />
      <path d="M38 32h14" />
    </>
  ),
  "Button Link": (
    <>
      <rect x="8" y="20" width="48" height="24" rx="8" opacity=".45" />
      <path d="M18 32h16" />
      <path d="M40 24h10v10M38 26l12 12" />
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
  "Reports Button": (
    <>
      <rect x="8" y="20" width="48" height="24" rx="8" opacity=".45" />
      <path d="M22 36V28m8 8V24m8 12v-6" />
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
  "Alert Dialog": (
    <>
      <rect x="8" y="14" width="48" height="36" rx="5" />
      <path d="M32 24v8" />
      <circle cx="32" cy="38" r="1.5" fill="currentColor" stroke="none" />
      <path d="M20 44h10m4 0h10" opacity=".45" />
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
      <rect x="16" y="12" width="32" height="24" rx="4" />
      <path d="M28 36v8l6-8" />
      <path d="M24 22h16M24 28h10" opacity=".5" />
    </>
  ),
  "Hover Card": (
    <>
      <rect x="18" y="10" width="28" height="22" rx="4" />
      <path d="M24 18h16M24 24h10" />
      <path d="M14 42l6-8 4 3 8-10" />
    </>
  ),
  Tooltip: (
    <>
      <rect x="12" y="16" width="40" height="18" rx="9" />
      <path d="M30 34v6" />
      <path d="M22 25h20" />
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
  "Input Select": (
    <>
      <rect x="8" y="22" width="48" height="20" rx="4" />
      <path d="M16 32h18m12-4 4 4-4 4" />
    </>
  ),
  "Labelled Switch": (
    <>
      <path d="M10 24h16M10 40h12" opacity=".55" />
      <rect x="30" y="18" width="24" height="14" rx="7" />
      <circle cx="46" cy="25" r="4" fill="currentColor" stroke="none" />
      <rect x="30" y="36" width="24" height="14" rx="7" opacity=".4" />
      <circle cx="38" cy="43" r="4" />
    </>
  ),
  "Lexical Editor": (
    <>
      <rect x="8" y="10" width="48" height="44" rx="4" />
      <path d="M16 20h20M16 28h28M16 36h16" />
      <path d="M36 36v10" />
    </>
  ),
  "Standard Toolbar Search Cluster": (
    <>
      <rect x="6" y="22" width="30" height="20" rx="10" />
      <circle cx="16" cy="32" r="4" />
      <path d="m19 35 3 3" />
      <rect x="40" y="22" width="18" height="20" rx="6" opacity=".5" />
      <path d="m48 28 4 4-4 4" />
    </>
  ),
  "Data Filters": (
    <>
      <path d="M14 16h36L38 32v16l-12-6V32Z" />
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
  "Multi Select": (
    <>
      <rect x="8" y="12" width="48" height="40" rx="4" />
      <path d="m16 24 3 3 6-6M16 40l3 3 6-6" />
      <path d="M32 25h16M32 41h12" opacity=".5" />
    </>
  ),
  "Period Filter": (
    <>
      <rect x="8" y="22" width="20" height="20" rx="4" />
      <rect x="36" y="22" width="20" height="20" rx="4" />
      <path d="M30 32h4" />
    </>
  ),
  "Searchable Project Select": (
    <>
      <rect x="8" y="10" width="48" height="16" rx="8" />
      <circle cx="18" cy="18" r="4" />
      <path d="m21 21 3 3M30 18h16" />
      <rect x="8" y="32" width="48" height="22" rx="4" opacity=".4" />
      <path d="M16 40h24M16 46h14" />
    </>
  ),
  "Select Filter Sheet Button": (
    <>
      <rect x="8" y="10" width="48" height="44" rx="4" opacity=".2" />
      <rect x="8" y="28" width="48" height="26" rx="4" />
      <path d="M20 16h24l-6 10H26Z" />
    </>
  ),
  "Static Employee Selector": (
    <>
      <circle cx="22" cy="24" r="7" />
      <path d="M12 44a10 10 0 0 1 20 0" />
      <rect x="36" y="22" width="20" height="20" rx="4" />
      <path d="m46 28 4 4-4 4" />
    </>
  ),
  "View Mode Filter": (
    <>
      <rect x="10" y="16" width="18" height="14" rx="2" />
      <rect x="10" y="34" width="18" height="14" rx="2" />
      <path d="M38 20h16M38 28h16M38 36h16M38 44h10" />
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
  "Circle Badge": (
    <>
      <circle cx="32" cy="32" r="16" />
      <path d="M32 24v16M24 32h16" />
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
      <path d="M20 42V30a12 12 0 0 1 24 0v12H16h32" opacity=".45" />
      <path d="M28 48h8" opacity=".45" />
      <circle cx="44" cy="20" r="8" fill="currentColor" fillOpacity=".16" />
      <path d="M44 16v8" />
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
  "Standard Toolbar Count": (
    <>
      <rect x="8" y="22" width="32" height="20" rx="6" opacity=".4" />
      <circle cx="48" cy="24" r="10" />
      <path d="M44 24h8" />
    </>
  ),
  "Tag Label": (
    <>
      <path d="M10 32 24 18h22a6 6 0 0 1 6 6v16a6 6 0 0 1-6 6H24Z" />
      <circle cx="22" cy="32" r="2.5" fill="currentColor" stroke="none" />
    </>
  ),
  "Tag Manager": (
    <>
      <path d="M8 22h18l8 10-8 10H8Z" />
      <path d="M30 22h18l8 10-8 10H30Z" opacity=".45" />
    </>
  ),
  "Toggleable Badges": (
    <>
      <rect
        x="6"
        y="22"
        width="16"
        height="20"
        rx="10"
        fill="currentColor"
        fillOpacity=".16"
      />
      <rect x="24" y="22" width="16" height="20" rx="10" />
      <rect x="42" y="22" width="16" height="20" rx="10" opacity=".4" />
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
  "Button Icon": (
    <>
      <rect x="16" y="16" width="32" height="32" rx="8" />
      <path d="m32 24 3 8h8l-6.5 4.5 2.5 8L32 40l-7 4.5 2.5-8L21 32h8Z" />
    </>
  ),
  "Caption Button": (
    <>
      <rect x="18" y="10" width="28" height="28" rx="8" />
      <path d="M32 18v12M26 24h12" />
      <path d="M20 48h24" />
    </>
  ),
  "Captions Array": (
    <>
      <rect x="8" y="16" width="14" height="14" rx="4" />
      <rect x="25" y="16" width="14" height="14" rx="4" />
      <rect x="42" y="16" width="14" height="14" rx="4" />
      <path d="M10 40h10M27 40h10M44 40h10" />
    </>
  ),
  Icon: (
    <>
      <rect x="14" y="14" width="36" height="36" rx="8" opacity=".35" />
      <path d="m32 20 4 10h10l-8 6 3 10-9-6-9 6 3-10-8-6h10Z" />
    </>
  ),
  "Icon Indicator": (
    <>
      <circle cx="32" cy="32" r="16" />
      <circle cx="46" cy="18" r="6" fill="currentColor" stroke="none" />
    </>
  ),
  "Icon Popover": (
    <>
      <circle cx="22" cy="22" r="10" />
      <rect x="28" y="28" width="28" height="22" rx="4" />
      <path d="M36 38h12M36 44h8" opacity=".5" />
    </>
  ),
  "Icon Tooltip Label": (
    <>
      <circle cx="18" cy="32" r="8" />
      <path d="M18 32h.01" />
      <rect x="30" y="22" width="26" height="20" rx="8" />
      <path d="M36 32h14" />
    </>
  ),
  "Iconify Icon": (
    <>
      <rect x="12" y="12" width="18" height="18" rx="4" />
      <rect x="34" y="12" width="18" height="18" rx="4" opacity=".55" />
      <rect x="12" y="34" width="18" height="18" rx="4" opacity=".35" />
      <rect x="34" y="34" width="18" height="18" rx="4" opacity=".2" />
    </>
  ),
  "Info Icon": (
    <>
      <circle cx="32" cy="32" r="18" />
      <path d="M32 28v12" />
      <circle cx="32" cy="22" r="1.5" fill="currentColor" stroke="none" />
    </>
  ),
  "Lazy Icon Picker": (
    <>
      <rect x="10" y="10" width="44" height="44" rx="6" />
      <path d="M18 22h8m4 0h8m4 0h8M18 32h8m4 0h8M18 42h8m4 0h8" />
    </>
  ),
  "Question Icon": (
    <>
      <circle cx="32" cy="32" r="18" />
      <path d="M26 26a6 6 0 1 1 8 5c-2 1.2-3 2.4-3 6" />
      <circle cx="32" cy="44" r="1.5" fill="currentColor" stroke="none" />
    </>
  ),
  "Save Check Icon": (
    <>
      <rect x="12" y="12" width="40" height="40" rx="6" />
      <path d="m22 34 6 6 14-16" />
    </>
  ),
  "Shield Cog Corner Icon": (
    <>
      <path d="M22 12 40 18v12c0 9-6 14-18 18" />
      <circle cx="42" cy="42" r="8" />
      <path d="M42 34v4m0 8v4M34 42h4m8 0h4" />
    </>
  ),
  "Badge Icon": (
    <>
      <rect x="8" y="22" width="48" height="20" rx="10" />
      <circle cx="20" cy="32" r="5" />
      <path d="M30 32h18" />
    </>
  ),
  "App Cards Layout": (
    <>
      <rect x="8" y="12" width="22" height="40" rx="4" />
      <rect x="34" y="12" width="22" height="18" rx="4" />
      <rect x="34" y="34" width="22" height="18" rx="4" opacity=".45" />
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
  "Card Bar": (
    <>
      <rect x="10" y="16" width="44" height="32" rx="5" />
      <path d="M10 28h44" />
      <path d="M18 22h12M18 36h20" />
    </>
  ),
  "Card Bars": (
    <>
      <rect x="10" y="10" width="44" height="14" rx="3" />
      <rect x="10" y="28" width="44" height="14" rx="3" opacity=".65" />
      <rect x="10" y="46" width="44" height="10" rx="3" opacity=".35" />
    </>
  ),
  "Card Header Image": (
    <>
      <rect x="10" y="10" width="44" height="44" rx="5" />
      <rect x="10" y="10" width="44" height="22" rx="5" opacity=".45" />
      <path d="M18 40h20M18 46h12" />
    </>
  ),
  "Standard Card Chrome": (
    <>
      <rect x="10" y="10" width="44" height="44" rx="5" />
      <path d="M10 22h44" />
      <path d="M16 16h10M38 16h8" />
      <path d="M16 32h24M16 40h16" />
    </>
  ),
  "Card List": (
    <>
      <rect x="10" y="10" width="44" height="12" rx="3" />
      <rect x="10" y="26" width="44" height="12" rx="3" />
      <rect x="10" y="42" width="44" height="12" rx="3" opacity=".4" />
    </>
  ),
  "Bar Stack": (
    <>
      <rect x="12" y="40" width="40" height="8" rx="2" />
      <rect x="12" y="30" width="40" height="8" rx="2" opacity=".65" />
      <rect x="12" y="20" width="40" height="8" rx="2" opacity=".35" />
    </>
  ),
  "Standard Grid": (
    <>
      <rect x="8" y="12" width="22" height="18" rx="3" />
      <rect x="34" y="12" width="22" height="18" rx="3" />
      <rect x="8" y="34" width="22" height="18" rx="3" opacity=".5" />
      <rect x="34" y="34" width="22" height="18" rx="3" opacity=".5" />
    </>
  ),
  "Standard Hybrid": (
    <>
      <rect x="8" y="12" width="22" height="40" rx="3" />
      <path d="M12 20h14M12 28h14M12 36h10" />
      <rect x="34" y="12" width="22" height="18" rx="3" opacity=".55" />
      <rect x="34" y="34" width="22" height="18" rx="3" opacity=".35" />
    </>
  ),
  "Standard Table Row Actions Menu": (
    <>
      <rect x="8" y="12" width="48" height="40" rx="3" />
      <path d="M8 24h48M8 36h48M24 12v40" />
      <path d="M48 18v.01M48 32v.01M48 44v.01" />
    </>
  ),
  "Sticky Table": (
    <>
      <rect x="8" y="12" width="48" height="40" rx="3" />
      <rect
        x="8"
        y="12"
        width="48"
        height="12"
        rx="3"
        fill="currentColor"
        fillOpacity=".12"
      />
      <path d="M8 36h48M24 12v40" />
    </>
  ),
  "Renders Standard Hybrid Pagination Footer": (
    <>
      <rect x="8" y="10" width="48" height="28" rx="3" opacity=".35" />
      <path d="M12 48h12m8-4 4 4-4 4m8-4 4 4-4 4" />
    </>
  ),
  Math: (
    <>
      <path d="M16 20h32M16 44h32" />
      <path d="m22 28 8 8m0-8-8 8M38 28v16" />
    </>
  ),
  "Standard Date Format": (
    <>
      <rect x="10" y="18" width="20" height="28" rx="3" />
      <path d="M10 28h20M16 14v8m8-8v8" />
      <path d="M38 26h16M38 34h16M38 42h10" />
    </>
  ),
  "Vacation Hours Display": (
    <>
      <circle cx="32" cy="32" r="18" />
      <path d="M32 20v12l8 4" />
    </>
  ),
  "Text Wrap Toggle": (
    <>
      <path d="M12 20h40M12 32h28a8 8 0 0 1 0 16H24" />
      <path d="m28 42-4 6 4 6" />
    </>
  ),
  "Toggle Row": (
    <>
      <path d="M10 24h24M10 40h18" />
      <rect x="38" y="17" width="18" height="14" rx="7" />
      <circle cx="50" cy="24" r="4" fill="currentColor" stroke="none" />
      <rect x="38" y="33" width="18" height="14" rx="7" opacity=".4" />
      <circle cx="44" cy="40" r="4" />
    </>
  ),
  "Renders Scroll Vertical Arrows": (
    <>
      <rect x="18" y="8" width="28" height="48" rx="4" opacity=".3" />
      <path d="m26 20 6-6 6 6M26 44l6 6 6-6" />
    </>
  ),
  "Scroll Dismiss Banner": (
    <>
      <rect x="8" y="16" width="48" height="16" rx="4" />
      <path d="M44 20l6 6m0-6-6 6" />
      <path d="M20 44h24" opacity=".4" />
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
  "Thin Scrollbar": (
    <>
      <rect x="12" y="12" width="36" height="40" rx="3" />
      <path d="M18 22h22M18 30h22M18 38h16" opacity=".45" />
      <rect
        x="50"
        y="16"
        width="3"
        height="20"
        rx="1.5"
        fill="currentColor"
        stroke="none"
      />
    </>
  ),
  "Loading Check": (
    <>
      <circle cx="32" cy="32" r="18" opacity=".35" />
      <path d="m22 33 7 7 14-16" />
    </>
  ),
  "Loading State": (
    <>
      <path d="M32 12a20 20 0 1 1-14 6" opacity=".3" />
      <path d="M32 12a20 20 0 0 1 16 8" />
      <path d="M22 36h20" opacity=".4" />
    </>
  ),
  Cursor: (
    <>
      <path d="M20 12 44 30l-10 3-5 11z" />
      <circle cx="22" cy="14" r="12" opacity=".35" />
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
      <rect x="10" y="46" width="14" height="8" rx="4" fill="currentColor" stroke="none" />
      <circle cx="32" cy="50" r="3" />
      <circle cx="47" cy="50" r="3" />
    </>
  ),
  "Navigation Rail": (
    <>
      <path d="M22 8v48" opacity=".3" />
      <rect x="7" y="16" width="10" height="8" rx="4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="34" r="3" />
      <circle cx="12" cy="46" r="3" />
      <path d="M30 18h24M30 28h16" opacity=".4" />
    </>
  ),
  "Navigation Drawer": (
    <>
      <path d="M10 14h20" opacity=".4" />
      <rect x="8" y="22" width="40" height="10" rx="5" fill="currentColor" stroke="none" />
      <path d="M13 42h30M13 52h24" />
    </>
  ),
  "App Badge Notification": (
    <>
      <rect x="12" y="14" width="36" height="36" rx="8" />
      <circle cx="46" cy="18" r="8" fill="currentColor" stroke="none" />
    </>
  ),
  "App Title Notification": (
    <>
      <path d="M10 18h30" />
      <circle cx="50" cy="18" r="6" fill="currentColor" stroke="none" />
      <path d="M10 32h44M10 42h28" opacity=".4" />
    </>
  ),
  "Favicon Notification": (
    <>
      <rect x="12" y="12" width="32" height="32" rx="6" />
      <circle cx="46" cy="18" r="8" />
      <path d="M46 18h.01" />
    </>
  ),
  "Popup Notification Container": (
    <>
      <rect x="10" y="12" width="44" height="16" rx="4" opacity=".3" />
      <rect x="10" y="32" width="44" height="20" rx="4" />
      <path d="M18 42h28" />
    </>
  ),
  "Popup Notification Display": (
    <>
      <rect x="8" y="18" width="48" height="28" rx="6" />
      <circle cx="20" cy="32" r="5" />
      <path d="M30 32h18" />
    </>
  ),
  "PWA Notification": (
    <>
      <path d="M20 28a12 12 0 0 1 24 0v10H20Z" />
      <path d="M28 42a4 4 0 0 0 8 0" />
      <circle cx="44" cy="20" r="6" fill="currentColor" stroke="none" />
    </>
  ),
  "Blur Overlay": (
    <>
      <rect x="8" y="10" width="48" height="44" rx="4" opacity=".2" />
      <rect x="16" y="20" width="32" height="24" rx="4" />
    </>
  ),
  "Broadcast Banner": (
    <>
      <rect x="8" y="22" width="48" height="20" rx="4" />
      <path d="M16 32h24M48 28v8" />
    </>
  ),
  "Broadcast Banner Container": (
    <>
      <rect x="8" y="10" width="48" height="14" rx="3" />
      <rect x="8" y="28" width="48" height="26" rx="4" opacity=".3" />
    </>
  ),
  Wizard: (
    <>
      <circle cx="12" cy="32" r="6" fill="currentColor" fillOpacity=".16" />
      <circle cx="32" cy="32" r="6" />
      <circle cx="52" cy="32" r="6" opacity=".4" />
      <path d="M18 32h8m12 0h8" />
    </>
  ),
  "Config Dialog": (
    <>
      <rect x="10" y="12" width="44" height="40" rx="5" />
      <circle cx="32" cy="32" r="8" />
      <path d="M32 20v4m0 16v4M20 32h4m16 0h4" />
    </>
  ),
  "Popover Wizard": (
    <>
      <rect x="12" y="10" width="40" height="32" rx="4" />
      <path d="M20 20h8m4 0h8m4 0h4" />
      <path d="M28 42v6l6-6" />
    </>
  ),
} satisfies Record<string, ReactNode>

export type GalleryIconName = keyof typeof icons

const aliases: Record<string, GalleryIconName> = {
  "Input Otp": "Input OTP",
  "Standard Search": "Search",
  "Standard Badge": "Badge",
  "Displays Defines New Badge": "Badge",
  "Filter Category Badge": "Pill",
  "Standard Card": "Card",
  "Standard Table": "Table",
  "Standard Text": "Paragraph",
  "Standard Icon": "Symbol",
  "Standard Cell Text": "Paragraph",
  Toast: "Sonner",
  "Tab Navigation": "Tabs",
  "Tab Drawn": "Tabs",
  "Confirm Dialog": "Alert Dialog",
  "Dialog Simple Search": "Dialog",
  "Bulk Hold Modal": "Dialog",
  "Tabbed Dialog": "Tabs",
  "Popover Column": "Popover",
  "Validation Tooltip": "Tooltip",
  "Department Select": "Select",
  "Month Select": "Select",
  "Category Filtered Select": "Select",
  "Rendering Standard Toolbar Filter Select": "Filter Select",
  "Job Costing Skeleton": "Skeleton",
  "Page Skeletons": "Skeleton",
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
