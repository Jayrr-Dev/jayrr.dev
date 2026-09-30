# Component conventions

Rules for Standard components (`components/standard/*`) and their gallery
entries.

## Slots

- Content placed before or after a component's main content goes in
  `leading` and `trailing`.
- Don't add other slot names for the same idea (`icon` + `iconPosition`,
  `image` + `imagePosition`, `leadingIcon` / `trailingIcon`); those were
  removed in the consolidation.

## Labels

- `label` is always visible text.
- Icon-only controls take `aria-label` for their accessible name. They do not
  use `label` for it.

## Tone

One vocabulary for every component that takes a tone:

`default | quiet | outline | ghost | success | warning | info | danger`

A component supports the subset that makes sense for it, and does not invent
other names for the same idea.

Deliberate extras outside the vocabulary:

- Button takes `tone="link"` (text-only link styling). No other component
  has it.
- Caption takes `tone="uppercase"`. It is a casing, not a colour; it is a
  candidate for a future `casing` prop.
- `inverse` is for content over media or a coloured surface. Button and
  Badge take it from the surrounding text colour (`currentColor`): Button's
  `tone="inverse"` fills with it and flips the label to a neutral opposite,
  and `tone="inverse-outline"` draws a current-colour border; Badge's
  `tone="inverse"` works with every appearance. Set the ink on the surface
  (`text-white` over a dark photo) and the controls follow it. BentoTile's
  `variant="inverse"` is light text for a tile over dark background media.

## Tokens

Tones map to theme tokens declared in `app/globals.css`: `success`,
`warning`, `info` and `destructive`, each used like shadcn's `destructive`.

- Solid: `bg-success text-success-foreground`.
- Soft: `border-success/30 bg-success/10 text-success`.
- Outline: `border-success/60 text-success`.

Don't use palette colors (`emerald-600`, `amber-500`) for a tone. The tokens
follow the installer's theme; palette colors don't. The `standard-tokens`
registry item ships them as `cssVars`, and `scripts/writesRegistryIndex.mjs`
adds it to any item whose file uses a tone class.

`npm run lint` enforces this with `@shadcn/lint`; see
[lint-rollout.md](lint-rollout.md).

## Loading

Button's `loading` is `true` (spinner replaces the leading slot, or the
icon for icon-only buttons) or `"spin-icon"` (the `leading` icon itself spins,
e.g. a refresh arrow).

## Size

Scale: `xs | sm | default | lg | xl`.

Fields, selects and buttons share heights so they line up in a row:

| size      | height |
| --------- | ------ |
| `sm`      | `h-7`  |
| `default` | `h-8`  |
| `lg`      | `h-9`  |

Every one of them defaults to `default` (`h-8`), with one deliberate
exception: **Select defaults to `sm` (`h-7`)** so it lines up with the `h-7`
toolbar and list controls it usually sits beside. Pass `size="default"` to
line it up with an `h-8` field or button.

## Data components

Components that render a list of things (menus, tabs, selects, arrays of
buttons) accept either an `items` array or composed children.

## Controlled state

- Single value: `value`, `defaultValue`, `onValueChange`.
- Multiple values: `values`, `defaultValues`, `onValuesChange`.
- Implement both with `useControllableState` from
  `hooks/use-controllable-state.ts`, so a component is controlled when the
  parent passes `value` and keeps its own state otherwise.

## Replacing a component

When a component is merged into another, move every caller onto the
surviving component in the same change and delete the old one: its file, its
exports, its gallery piece and catalog entry, and its registry item. Don't
leave deprecated wrappers, prop aliases or old-location re-exports behind.
The consolidation removed the last of them (ButtonIcon, ButtonLink,
ButtonBack, CaptionButton, BadgePill, CircleBadge, MultiSelect,
ToolbarSelect, ToggleableBadges, LabelledSwitch, ToggleRow, BroadcastBanner,
BarStack, Row, ThinScrollbar, StandardCard, StandardText, TabNavigation and
the deprecated props).

## Gallery catalog

Every entry in `features/ui-library/domain/catalog/galleryComponents.json`
keeps a valid `type`, `canonical` and `tier`, each resolving to a category in
`galleryTypes.json`. Names are unique.

Descriptions live only in `shortDescriptions.json`, one line per piece under
its tier (`primitive`, `component`, `block`). Catalog entries carry no
`description` of their own; `definesGalleryCatalog.ts` fills it in. Longer
install notes belong in the item's `description` in `components/*/registry.json`.

An entry with `"standard"` in `demos` has a demo in
`features/standard-library/components/demos/pieces/<slug>.tsx`, registered by
piece name in `definesStandardPieceDemos.ts`. A piece demo takes no hooks at
its top level: the gallery calls it as a plain function, so stateful parts go
in child components it renders.

Check with:

```sh
node scripts/checksGalleryPages.mjs --port 3200
```
