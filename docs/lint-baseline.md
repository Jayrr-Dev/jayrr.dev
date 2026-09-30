# @shadcn/lint baseline

Stage 0 of [lint-rollout.md](lint-rollout.md). Measured 2026-09-30 with
`@shadcn/lint` 0.2.0, ESLint 10.11, every enabled rule at `warn`.

**984 warnings, 0 errors** from `@shadcn/lint`. Separately, `npm run lint`
already fails on **33 errors from other rules** (`react-hooks/refs`,
`react-hooks/set-state-in-effect`, `react-hooks/rules-of-hooks`,
`jsx-a11y/alt-text`, ...). Those predate this rollout; see "Pre-existing errors"
below.

## Counts

| Rule | Consumers | Standard | ui |
| --- | ---: | ---: | ---: |
| `no-restyle` | 349 | off | off |
| `no-raw-colors` | 120 | 114 | off |
| `no-arbitrary-values` | 61 | 313 | off |
| `no-inline-styles` | 22 | off | off |
| `require-static-classes` | 4 | off | off |
| `no-unknown-classes` | 0 | 0 | 1 |

Consumers are `app/**`, `features/**` and `components/*.tsx`.

Where the consumer findings are:

| Area | Findings | Files |
| --- | ---: | ---: |
| `features/standard-library/.../demos/pieces/[a-h]*` | 177 | 16 |
| `features/standard-library/.../demos/pieces/[i-z]*` | 186 | 24 |
| `features/standard-library/**` (other) | 119 | 17 |
| `features/ui-library/**`, `app/**`, `components/*.tsx` | 74 | 11 |

## What the findings are

### `no-restyle` (consumers, 349)

By category: shape 116, color 110, spacing 87, typography 27, effects 6,
motion 3.

By component, top 20: Draggable 34, Stack 32, InfiniteScroll 26,
InputCalculatorHighlight 19, Button 17, Surface 15, DynamicTabs 12, Toolbar 12,
InputCalculatorResult 10, AppBar 9, AspectRatio 8, Card 7, CollapsibleContent 7,
InputCalculatorInput 6, Step 6, ActionWheelContextMenu 6, Cursor 6,
ProgressRing 6, Masonry 5, Parallax 5.

**Many of these are containers, not violations.** Stack, Draggable,
InfiniteScroll, Surface, Masonry, AspectRatio, Parallax, CollapsibleContent
and Toolbar exist to hold other content, and demos pass them gap, padding,
rounding or a background on purpose. They need `no-restyle` contracts
(for example Stack: `allow: ["layout", "spacing"]`) before anyone fixes
findings, or the fix pass will contort demos to satisfy a rule that's wrong
for them. That's roughly 150 of the 349.

The messages are good: they name the component, the category, and list the
component's own variants (`Use a variant: small, medium, large, search`).

### `no-raw-colors` (234)

Standard, 114, concentrated: banner 27, alert 24, spreadsheet 10,
screentone 9, json-display 8, json-viewer 8, dialog 6, miller-select 4, then
1–3 each in button, character-chat, draw-display, form-field, gantt,
indicator, loading-state, progress, flip-dots.

- **banner and alert (51)** are tones built from sky / emerald / amber / red.
  Stage 1's `success` / `warning` / `info` tokens fix these.
- **json-display, json-viewer** are syntax-highlight colors. They need
  either `chart-*` tokens or a small set of `syntax-*` tokens.
- **screentone** uses `black` / `white` in SVG masks, where black and white
  are mask values, not colors. Legitimate: disable per line with a reason.
- **`fill-none` is a false positive** (character-chat.tsx:205): the rule
  reports it as an undeclared color. Allow it in the rule config.

Consumers, 120: mostly demo imagery (card, card-grid, input-calculator,
rendersStandardArticleDemo, parallax, list, rendersStandardBentoGridDemo).
Decide per file whether the colors are the content (turn the rule off for
that file) or styling (swap for tokens).

### `no-arbitrary-values` (374)

Standard, 313: by utility, `text-[..]` 64, `transition-[..]` 40,
`rounded-[..]` 21, `shadow-[..]` 17, `h-[..]` 16, `z-[..]` 12, `w-[..]` 10,
`grid-cols-[..]` 8, others below 8, plus ~95 inside variant or selector
syntax. Only 14 have an exact scale equivalent the rule names
(`h-[72px]` → `h-18`); 70 list the nearest values; 3 are hex colors
(character-chat).

Arbitrary values are portable (they render the same in any project), so for
the registry they're a consistency issue, not a correctness one. Keep the
rule at `warn` in Standard; take the 14 exact swaps and the 3 hex colors;
leave the rest.

Consumers, 61: fix these, they're demo code.

### `no-inline-styles` (consumers, 22)

Mostly dynamic geometry in demos. Fix where a class works; leave runtime
values.

### `require-static-classes` (consumers, 4)

hero-card.tsx:437, 466 and rendersShadcnLibraryDemo.tsx:532, 541. Build
the class with a lookup object.

### `no-unknown-classes` (1)

`origin-top-center` in `components/ui/navigation-menu.tsx:110`. Tailwind
generates nothing for it, so the class does nothing. It's upstream shadcn
source; leave it or report it upstream.

## Config decisions made in stage 0

These change the plan's level table; lint-rollout.md is updated to match.

- **Standard: `require-static-classes` and `no-inline-styles` off.** The
  @shadcn/lint docs recommend turning them off in component directories.
  Measured: `require-static-classes` gave 37 findings, all Standard components
  forwarding `className` to the component they wrap. `no-inline-styles` gave
  333; limited to color properties only (`deny: [background, color, ...]`)
  it still gave 64, all dynamic style objects, `<style>` tags or
  user-picked colors (color-picker, gantt, cell-grid). None affect
  portability.
- **Standard: `no-unknown-classes` allows `mood-*`.** mood-text styles
  its own hook classes in a `<style>` element (14 findings, all these).
- **ui: `no-unknown-classes` allows `cn-input-otp` and `toaster`**, hook
  classes for shadcn's CSS and sonner.
- **`eslint .` now ignores `.claude/**`**: agent worktrees were being linted
  as duplicate copies of the repo.

## How the linter reads this repo

- Components: `components.json` gives `@/components/ui`;
  `settings.shadcn.ui` adds `@/components/standard`. Wrappers are traced,
  so a Standard component forwarding `className` to a ui component
  inherits its contract.
- Theme: `app/globals.css` from `components.json`, following its imports
  (`shadcn/tailwind.css`, `typeset.css`). Tokens are the `--color-*`
  entries in `@theme inline`.
- Variants for suggestions come from `cva` and string-union props in each
  component file.
- Run time: about 50 seconds for `eslint .`.

## Pre-existing errors

`npm run lint` exits non-zero before any `@shadcn/lint` rule is an error:

| Rule | Count |
| --- | ---: |
| `react-hooks/refs` | 17 |
| `react-hooks/set-state-in-effect` | 9 |
| `react-hooks/rules-of-hooks` | 4 |
| `jsx-a11y/alt-text` | 4 |
| `react-hooks/immutability` | 2 |
| `jsx-a11y/role-supports-aria-props` | 2 |
| `@next/next/no-html-link-for-pages` | 1 |
| `@next/next/no-img-element` | 1 |

Some are warnings; 33 are errors. Stage 5's "lint passes" gate needs these
fixed or scoped separately.
