# @shadcn/lint rollout

Plan for adding [`@shadcn/lint`](https://github.com/shadcn-ui/lint) to the repo
and shipping it with the `@jayrr` registry, plus the agent prompts for each
stage.

## Status (2026-09-30): stages 0–5 done

- `@shadcn/lint` 0.2.0 runs on every file. The rules consumers get live in
  `lib/standard-lint.mjs`; `eslint.config.mjs` spreads them over `app/`,
  `features/` and `components/*.tsx` and adds this repo's layers and
  exceptions after them.
- **All `shadcn/*` rules pass.** Raw colors are at zero repo-wide. 79 known
  consumer errors (no-restyle, no-arbitrary-values) are recorded in
  `eslint-suppressions.json`: 42 in input-calculator and theme demos that
  were being edited in parallel, the rest waiting on component props (below).
  New violations fail; run `npx eslint . --prune-suppressions` after fixing
  one.
- Tone tokens `success`, `warning`, `info` (+ `-foreground`) are in
  `app/globals.css` and ship as the `standard-tokens` registry item; the
  registry script adds it to any item using a tone class (13 today). Also a
  `text-2xs` (10px) size in this repo's theme.
- `@jayrr/standard-lint` installs `lib/standard-lint.mjs` plus `@shadcn/lint`,
  tested in a fresh `shadcn init` app: it flags restyles, raw colors,
  arbitrary values and Button heights with the intended messages.
- `npm run check` runs lint, typecheck and `registry:validate`.
  `AGENTS.md` tells agents to run lint after UI changes.
- All 196 gallery pages render (`scripts/checksGalleryPages.mjs`).

Still open:

- `npm run lint` fails on 33 pre-existing errors from other rules
  (react-hooks, `@next/next/no-html-link-for-pages`), so `check` fails
  until those are fixed.
- The missing props are in: Button `inverse` / `inverse-outline` tones,
  Badge `tone="inverse"`, Toolbar `variant="floating"`, FlipDots `bare`,
  ArticleTitle / BentoTileTitle / StepTitle `size`, BentoTile
  `variant="inverse"`, Chat `background`, FloatingWindow `radius`. 48
  suppressions remain: 42 in input-calculator and theme, and 6 arbitrary
  values or restyles in arrangeable-grid, draggable, app-grid, floating-window
  and layer demos.
- Standard keeps ~300 arbitrary values as warnings, e.g. `text-[10px]` in
  15 components; `text-2xs` would need to ship in `standard-tokens` first.
- Look changes to review: warning solid is now burnt orange with white text
  (was amber/yellow with black); tone solids use dark text in dark mode;
  gantt's "forecast past plan" moved from violet to warning; card-grid lost
  its lime/violet/indigo tray icons; Rater and SocialMediaButtons demos use
  the default gap.

## Goals

1. Registry items in `components/standard` stay portable: theme tokens only, no
   classes that depend on this repo's CSS.
2. Code that uses the design system (`features/`, `app/`, `components/*.tsx`)
   styles components through their props, as `docs/component-conventions.md`
   describes.
3. Users can install the same rules from the registry
   (`npx shadcn add @jayrr/standard-lint`).

## Layers and rule levels (target end state)

| Rule | `components/ui` | `components/standard` | consumers |
| --- | --- | --- | --- |
| `no-raw-colors` | off | error | error (art files overridden off) |
| `no-arbitrary-values` | off | warn | error |
| `no-unknown-classes` | warn | error | error |
| `require-static-classes` | off | off | error |
| `no-inline-styles` | off | off | warn |
| `no-restyle` | off | off | error (`allow: ["layout"]` + contracts) |

`components/ui` is vendored shadcn source and is overwritten on re-add, so we
don't fix it. Standard turns off `require-static-classes` and
`no-inline-styles` because components forward `className` and set dynamic
geometry by design; see [lint-baseline.md](lint-baseline.md) for the numbers.

## Stages

| # | Stage | Agents | Depends on | Gate to pass |
| --- | --- | --- | --- | --- |
| 0 | Baseline | 1 | clean commit | `docs/lint-baseline.md` written, all rules at `warn` (**done**) |
| 1 | Tone tokens + container contracts | 1 | 0 | `success/warning/info` tokens exist in light + dark and ship as `cssVars`; container components have `no-restyle` contracts |
| 2 | Fix fan-out | 4 in parallel | 1 | each agent's files lint clean at stage-2 levels, `npm run typecheck` passes |
| 3 | Contracts | 1 | 2 | `no-restyle` contracts written, consumers at `error`, zero violations |
| 4 | Registry item | 1 | 3 | `@jayrr/standard-lint` builds, validates, installs into a scratch app |
| 5 | Gates + review | 1 | 4 | levels match the table above, scripts and agent docs updated |

Before stage 0, commit or stash the current working tree so each stage is a
clean diff you can review or revert.

Stage 2 is the only parallel stage. Its agents own disjoint files and never
touch `eslint.config.mjs`, `app/globals.css` or any `registry.json`, so they
can share one working tree. Run the rest one after another, and review each
diff before starting the next.

---

## Shared preamble

Paste this above every stage prompt.

```text
Repo: jayrr.dev, a Next.js app and the shadcn registry "@jayrr"
(registry.json includes components/ui, components/standard and hooks
registry.json files; scripts/writesRegistryIndex.mjs regenerates them and keeps
hand-written fields like description, css and cssVars).

Layers:
- components/ui: vendored shadcn source. Never edit it.
- components/standard: the Standard design system (~160 files). Published as
  registry items that install to components/standard/<name>.tsx.
- Consumers: features/**, app/**, components/*.tsx.

Read docs/lint-rollout.md (the plan) and docs/component-conventions.md before
starting. @shadcn/lint is at 0.2.0 and its README leaves gaps; when an option
name or behaviour is unclear, read node_modules/@shadcn/lint (source and README)
instead of guessing.

Rules for every stage:
- Stay inside the files your prompt assigns. If a fix needs a file outside
  them, stop and report it instead of editing.
- No eslint-disable comments unless the prompt allows them. Each one needs a
  reason in the comment.
- Keep what renders the same. Swapping a raw color for a token must keep the
  same look in light and dark. If no token matches, report it; don't invent one.
- Match the surrounding code's style. Don't reformat files you aren't fixing.
- Before finishing, run `npx eslint <your paths>` and `npm run typecheck`.

End with a report: files changed, violations before/after per rule, anything
you skipped and why, and open questions.
```

---

## Stage 0: Baseline

```text
Goal: install @shadcn/lint, turn on every rule at "warn", and measure.

1. `npm install -D --save-exact @shadcn/lint @typescript-eslint/parser`
   (skip the parser if eslint-config-next already provides a compatible one;
   check the peer range in node_modules/@shadcn/lint/package.json).
2. Read node_modules/@shadcn/lint fully. Write down in the report:
   - the exact classes each no-restyle category (layout, spacing, typography,
     ...) covers
   - every value no-raw-colors `allow` accepts and what "semantic" means
   - what no-arbitrary-values lets through (var(), [&_svg] variants, ...)
   - how no-unknown-classes finds the Tailwind CSS entry, and whether it picks
     up app/globals.css (which imports shadcn/tailwind.css and
     components/standard/typeset.css)
   - Oxlint vs ESLint differences that matter here
3. In eslint.config.mjs add three config blocks after the Next configs:
   - components/standard/**: plugin + settings, every rule "warn" except
     no-restyle off
   - consumers (features/**, app/**, components/*.{ts,tsx}): settings
     `ui: "@/components/standard"`, `componentImports: ["^@/components/ui(/|$)"]`,
     `note: "See docs/component-conventions.md"`, every rule "warn",
     no-restyle with `allow: ["layout"]`
   - components/ui/**: no-unknown-classes "warn" only
4. Change the lint script to `eslint .` if bare `eslint` doesn't lint the tree.
5. Run lint and write docs/lint-baseline.md: a table of counts per rule per
   layer, the top 15 files by violations, and 5 sample messages per rule.
   Flag false positives (things the rule gets wrong for this repo).
6. List every file whose colors are the point of the file (art, swatches,
   color pickers, demo imagery) as candidates for a no-raw-colors override.

Don't fix any violations in this stage.
```

## Stage 1: Tone tokens

```text
Goal: give the tone vocabulary (success, warning, info; danger already maps to
destructive) real theme tokens so tones stop using raw palette colors.

Files you own: app/globals.css, components/standard/registry.json (cssVars
fields only), scripts/writesRegistryIndex.mjs (only if cssVars don't survive a
rebuild), docs/component-conventions.md.

1. Read how banner, badge, alert, progress, spreadsheet and carousel in
   components/standard color each tone today (emerald, amber, sky, ...), in
   both light and dark.
2. Add --success, --warning, --info and a -foreground for each to :root and
   .dark in app/globals.css, in oklch, matching the colors those components
   use now. Register them in `@theme inline` as --color-success etc. Consider a
   muted/subtle variant only if several components use a tinted background
   (e.g. bg-emerald-500/10); prefer opacity modifiers on the base token
   (bg-success/10) if they match.
3. For every Standard registry item whose component will use these tokens, add
   a cssVars block (theme / light / dark) so an installer gets them. Put the
   shared block on one item if the registry supports a dependency for it
   (e.g. a "standard-tokens" registry:style or registry:theme item that others
   list in registryDependencies); check the shadcn registry-item schema and
   pick the cleanest option. Rebuild with `npm run registry:build` and
   confirm the vars appear in public/r/<item>.json.
4. Add a "Tokens" section to docs/component-conventions.md: tones use
   success / warning / info / destructive tokens, never palette colors.

Don't change the components themselves; stage 2 does that.

5. Container contracts. docs/lint-baseline.md shows ~150 of the 349
   consumer no-restyle findings are on containers (Stack, Draggable,
   InfiniteScroll, Surface, Masonry, AspectRatio, Parallax,
   CollapsibleContent, Toolbar). For each, read the component and its
   gallery demos and decide what callers may set: usually
   `allow: ["layout", "spacing"]`, sometimes shape or color for
   surface-like containers. Add them as contracts on the consumer
   no-restyle rule in eslint.config.mjs (this stage also owns that file).
   Put each decision and its reason in the report. Don't write contracts
   for controls (Button, Select, fields); stage 3 does those.
6. In eslint.config.mjs, add `allow: ["fill-none"]` to no-raw-colors in
   both blocks (false positive, see the baseline).
```

## Stage 2: Fix fan-out (run the four agents in parallel)

Each agent gets the preamble, the shared block below, and one assignment.

```text
Stage 2. The lint config and tokens are in place (see docs/lint-baseline.md
for the counts and the known false positives). Fix every @shadcn/lint warning
in your assigned files, plus any the rules miss that the rule text clearly
covers.

How to fix:
- Raw colors → theme tokens (primary, muted, accent, destructive, success,
  warning, info, chart-1..5, border, ring, ...). Keep light and dark looks.
- Arbitrary values → the nearest Tailwind scale value if it looks the same;
  otherwise a token or CSS var registered in @theme. `[&_svg]:` style
  variants and `var(--x)` values are fine if the baseline says the rule
  allows them. If a value is truly one-off and structural (e.g. a
  calc() for a clip path), leave it and list it in the report.
- Template-literal classes → a lookup object or cva variant.
- Inline styles → classes, unless the value is dynamic (computed at runtime);
  then leave it.
- In consumer files, className on a Standard component that isn't layout
  → the component's prop (tone, size, leading/trailing...). If the prop
  doesn't exist, don't add it; list it in the report as a missing prop.

You may not edit eslint.config.mjs, app/globals.css or any registry.json.
Ask for a file-level override in your report instead.
```

Assignments (sized from the baseline):

- **2A** `components/standard/**`: the 114 raw colors (banner and alert onto
  the stage 1 tokens; json-display and json-viewer need a decision on syntax
  colors, so ask before adding tokens; screentone's SVG mask black/white get
  a reasoned disable), the 14 arbitrary values with an exact scale equivalent,
  and the 3 hex colors in character-chat. Leave the other arbitrary values.
- **2B** `features/standard-library/components/demos/pieces/[a-h]*` (177
  findings, 16 files)
- **2C** `features/standard-library/components/demos/pieces/[i-z]*` (186
  findings, 24 files)
- **2D** everything else in `features/standard-library/**` (119, 17 files),
  plus `features/ui-library/**`, `app/**`, `components/*.tsx` (74, 11 files)

For consumer files whose colors are the content (demo art, swatches), don't
swap colors; list the file for a no-raw-colors override.

After all four finish, run `npx eslint . && npm run typecheck` and
`node scripts/checksGalleryPages.mjs --port 3200` yourself, then merge the
reports: missing props go to stage 3, override requests go into the config.

## Stage 3: Contracts

```text
Goal: encode docs/component-conventions.md as no-restyle contracts and move
consumers to "error".

Files you own: eslint.config.mjs, plus consumer files to fix fallout.

1. From the stage 2 reports, collect the "missing prop" list. For each, decide
   with the user whether the component should gain a prop or the usage is
   layout and should be allowed. Stop and ask before adding props.
2. Write contracts for the components with a size or tone API: Button,
   Select, form fields (text-field, number-input, phone-input, textarea,
   autocomplete-input), Badge, Chip, Alert, Banner, Card, Caption. Typical
   shape: deny h-*, text-*, bg-*, rounded-*, font-*; allow w-full, mt-*,
   mb-*, layout. Use custom messages with placeholders so the error names the
   prop to use, e.g. "Use {{component}}'s size prop ({{sizes}})." Check which
   placeholders the rule actually supports.
3. Put the rules and contracts in one exported object (a new file,
   lib/standard-lint.mjs, exporting `standardLint({ ui })` that returns an
   ESLint flat-config block) and import it into eslint.config.mjs. Stage 4
   ships this exact file, so keep it self-contained: no repo-relative
   imports, no Next-specific settings.
4. Set consumer rules to the levels in the plan's table and fix the fallout.
```

## Stage 4: Registry item

```text
Goal: publish lib/standard-lint.mjs as @jayrr/standard-lint.

Files you own: lib/standard-lint.mjs (docs and small API tweaks only), a
new lib/registry.json (or the best existing registry.json to hold it; read how
registry.json "include" and scripts/writesRegistryIndex.mjs work first),
registry.json, docs.

1. Add the item: type registry:file (or registry:lib if the schema fits
   better), devDependencies ["@shadcn/lint", "@typescript-eslint/parser"],
   target lib/standard-lint.mjs, a description, and docs text showing the
   one-line eslint.config.mjs change and the `ui` option. It must not target
   eslint.config.mjs. No Standard component may list it in
   registryDependencies.
2. Make sure writesRegistryIndex.mjs keeps the item on rebuild.
3. `npm run registry:build`, then `npx shadcn registry validate`.
4. Test the install end to end in the scratchpad (not in this repo): create a
   fresh Next app, run `npx shadcn init`, add a Standard component and
   standard-lint from the local build (serve public/r or use the file path),
   wire the config, and confirm lint flags a deliberate
   `<Button className="h-12 bg-pink-500">`. Report the exact commands.
5. Add an install section for the linter where the gallery shows install
   commands (find it via the "install commands per piece" feature).
```

## Stage 5: Gates and review

```text
Goal: lock it in and review the whole rollout.

1. Confirm every rule level matches the table in docs/lint-rollout.md. Promote
   any remaining "warn" whose layer is at zero.
   `npm run lint` also fails on ~33 pre-existing react-hooks / jsx-a11y
   errors (see docs/lint-baseline.md). Ask the user whether to fix them here
   or in a separate task before making lint a hard gate.
2. package.json scripts: "registry:validate": "shadcn registry validate", and
   "check": lint + typecheck + registry:validate.
3. Add a short "Before finishing UI work, run npm run check" note to the
   agent instructions (CLAUDE.md; don't edit the generated block in AGENTS.md).
4. Review the full diff from stage 0 to now: token swaps that changed a look,
   eslint-disable comments without reasons, overrides broader than needed,
   contracts that block legitimate layout. Report findings; fix only the
   clear ones.
```
